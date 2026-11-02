import { registerCustomerSchema, createPropertySchema, listPropertiesQuerySchema } from "../validators/schemas.js";
import { validate } from "../middleware/validate.js";

const show = (label, r) =>
  console.log(label.padEnd(34), r.success ? "OK  " + JSON.stringify(r.data) : "REJECTED " + r.error.issues.map((i) => i.message).join(" | "));

// 1. Cleaning: spaces trimmed, email lowercased
show("good customer", registerCustomerSchema.safeParse({ name: "  Ayesha Khan ", email: " AYESHA@Test.COM ", password: "Strong123" }));

// 2. Weak password and bad email
show("weak password", registerCustomerSchema.safeParse({ name: "Ayesha", email: "a@test.com", password: "abc" }));
show("bad email", registerCustomerSchema.safeParse({ name: "Ayesha", email: "not-an-email", password: "Strong123" }));

// 3. Mass assignment attack: client tries to choose its own role or tenant
show("sneaky role + tenantId", registerCustomerSchema.safeParse({ name: "Eve", email: "e@test.com", password: "Strong123", role: "super_admin", tenantId: "123" }));

// 4. Property: price comes as text from forms and is converted to a number
show("property price '2500000'", createPropertySchema.safeParse({
  title: "Nice house", price: "2500000", propertyType: "house", purpose: "sale", location: { city: "Lahore" },
}));
show("property with tenantId", createPropertySchema.safeParse({
  title: "Nice house", price: 100, propertyType: "house", purpose: "sale", location: { city: "Lahore" }, tenantId: "someone-else",
}));

// 5. Query string: unknown sort value is refused (protects the database)
show("sort=password", listPropertiesQuerySchema.safeParse({ sort: "password" }));
show("empty query gets defaults", listPropertiesQuerySchema.safeParse({}));

// 6. The middleware itself, with a fake request and response
const fakeRes = { status(c) { this.code = c; return this; }, json(b) { console.log("middleware ->", this.code, JSON.stringify(b)); } };
validate(registerCustomerSchema)({ body: { name: "A", email: "x", password: "1" } }, fakeRes, () => console.log("next() called"));