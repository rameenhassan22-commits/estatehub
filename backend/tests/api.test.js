// Run with: npm test (uses Node's built-in test runner, no extra packages)
// These tests need NO database: they check the gates that run BEFORE the DB is touched.
process.env.NODE_ENV = "test";
process.env.MONGO_URI = "mongodb://127.0.0.1:1/unused"; // never connected in these tests
process.env.JWT_SECRET = "test-secret-test-secret-123456";
process.env.CLIENT_URL = "http://localhost:5173";
process.env.LOG_LEVEL = "silent";
process.env.AUTH_RATE_LIMIT = "1000";

import { test, before, after } from "node:test";
import assert from "node:assert/strict";

// config/env.js reads process.env when first imported, so import the app AFTER setting the env above
const { app } = await import("../app.js");
const { createPropertySchema, updatePropertySchema, listPropertiesQuerySchema } = await import("../validators/schemas.js");

let server, base;
before(async () => {
  await new Promise((r) => (server = app.listen(0, r)));
  base = `http://127.0.0.1:${server.address().port}`;
});
after(() => server.close());

const call = async (method, path, body, headers = {}) => {
  const res = await fetch(base + path, {
    method,
    headers: { "Content-Type": "application/json", ...headers },
    body: body ? JSON.stringify(body) : undefined,
  });
  return { status: res.status, json: await res.json(), headers: res.headers };
};

test("health check", async () => {
  const { status, json } = await call("GET", "/api/health");
  assert.equal(status, 200);
  assert.equal(json.status, "ok");
});

test("readiness: 503 while the database is not connected", async () => {
  const { status, json } = await call("GET", "/api/health/ready");
  assert.equal(status, 503);
  assert.equal(json.db, "disconnected");
});

test("every response carries an X-Request-Id; a client-supplied id is echoed back", async () => {
  const a = await call("GET", "/api/health");
  assert.ok(a.headers.get("x-request-id"));
  const b = await call("GET", "/api/health", undefined, { "X-Request-Id": "abc-123" });
  assert.equal(b.headers.get("x-request-id"), "abc-123");
});

test("security headers (helmet) are present", async () => {
  const { headers } = await call("GET", "/api/health");
  assert.ok(headers.get("x-content-type-options"));
});

test("CORS: allowed origin is echoed, unknown origin gets no CORS header", async () => {
  const ok = await call("GET", "/api/health", undefined, { Origin: "http://localhost:5173" });
  assert.equal(ok.headers.get("access-control-allow-origin"), "http://localhost:5173");
  const bad = await call("GET", "/api/health", undefined, { Origin: "https://evil.example" });
  assert.equal(bad.headers.get("access-control-allow-origin"), null);
});

test("login: bad email + empty password -> 400 with per-field errors", async () => {
  const { status, json } = await call("POST", "/api/auth/login", { email: "nope", password: "" });
  assert.equal(status, 400);
  assert.ok(json.errors.email);
  assert.ok(json.errors.password);
});

test("register-customer: weak password rejected", async () => {
  const { status, json } = await call("POST", "/api/auth/register-customer", {
    name: "Ali", email: "ali@test.com", password: "abc",
  });
  assert.equal(status, 400);
  assert.match(json.errors.password, /at least 8/);
});

test("register-customer: cannot self-assign role (mass assignment blocked)", async () => {
  const { status, json } = await call("POST", "/api/auth/register-customer", {
    name: "Mallory", email: "m@test.com", password: "Strong123", role: "super_admin",
  });
  assert.equal(status, 400);
  assert.ok(json.errors.role || json.errors._form);
});

test("register-agency: missing agency name -> 400", async () => {
  const { status, json } = await call("POST", "/api/auth/register-agency", {
    name: "Sara", email: "sara@test.com", password: "Strong123",
  });
  assert.equal(status, 400);
  assert.ok(json.errors.agencyName);
});

test("protected routes reject guests with 401", async () => {
  for (const [m, p] of [
    ["POST", "/api/properties"],
    ["GET", "/api/inquiries"],
    ["GET", "/api/users"],
    ["GET", "/api/admin/overview"],
    ["GET", "/api/auth/me"],
  ]) {
    const { status } = await call(m, p, m === "POST" ? {} : undefined);
    assert.equal(status, 401, `${m} ${p}`);
  }
});

test("bad token is 401, not a crash", async () => {
  const { status } = await call("GET", "/api/auth/me", undefined, { Authorization: "Bearer garbage" });
  assert.equal(status, 401);
});

test("property id must be a valid ObjectId", async () => {
  const { status } = await call("GET", "/api/properties/not-an-id");
  assert.equal(status, 400);
});

test("sort whitelist: ?sort=password is rejected", async () => {
  const { status } = await call("GET", "/api/properties?sort=password");
  assert.equal(status, 400);
});

test("unknown route -> JSON 404", async () => {
  const { status, json } = await call("GET", "/api/nope");
  assert.equal(status, 404);
  assert.ok(json.message);
});

// ---------- schema unit tests ----------
const goodProperty = {
  title: "Modern 3 bed house",
  price: 25000000,
  propertyType: "house",
  purpose: "sale",
  location: { city: "Islamabad", area: "F-7" },
  bedrooms: 3,
  area: 10,
};

test("property schema: accepts a good payload and coerces numbers", () => {
  const r = createPropertySchema.safeParse({ ...goodProperty, price: "25000000" });
  assert.equal(r.success, true);
  assert.equal(r.data.price, 25000000);
});

test("property schema: rejects negative price and unknown keys (tenantId)", () => {
  assert.equal(createPropertySchema.safeParse({ ...goodProperty, price: -5 }).success, false);
  assert.equal(createPropertySchema.safeParse({ ...goodProperty, tenantId: "abc" }).success, false);
});

test("property update schema is partial but still strict", () => {
  assert.equal(updatePropertySchema.safeParse({ price: 100 }).success, true);
  assert.equal(updatePropertySchema.safeParse({ createdBy: "x" }).success, false);
});

test("list query: blanks become defaults, limit is capped at 50", () => {
  const ok = listPropertiesQuerySchema.parse({ q: "", sort: "", page: "" });
  assert.equal(ok.sort, "-createdAt");
  assert.equal(ok.page, 1);
  assert.equal(listPropertiesQuerySchema.safeParse({ limit: "5000" }).success, false);
});