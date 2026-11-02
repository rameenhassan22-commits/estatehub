const BASE = "http://localhost:5000/api";
const stamp = Date.now();

const call = async (label, method, path, body, token) => {
  const res = await fetch(BASE + path, {
    method,
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  console.log(label.padEnd(36), res.status, data.message || (data.user ? `user ${data.user.role}` : ""));
  return data;
};

// 1. Register an agency: creates the tenant + its admin
const agency = await call("register agency", "POST", "/auth/register-agency", {
  agencyName: "Test Agency " + stamp, name: "Test Admin", email: `admin${stamp}@test.com`, password: "Strong123",
});
console.log("   admin tenantId == tenant _id:", agency.user.tenantId === agency.tenant._id);

// 2. Register a customer: no tenant
const cust = await call("register customer", "POST", "/auth/register-customer", {
  name: "Test Customer", email: `cust${stamp}@test.com`, password: "Strong123",
});
console.log("   customer tenantId:", cust.user.tenantId);

// 3. Failures
await call("duplicate email", "POST", "/auth/register-customer", { name: "Again", email: `cust${stamp}@test.com`, password: "Strong123" });
await call("wrong password", "POST", "/auth/login", { email: `cust${stamp}@test.com`, password: "Wrong1234" });
await call("unknown email (same message!)", "POST", "/auth/login", { email: "nobody@test.com", password: "Wrong1234" });
await call("weak password", "POST", "/auth/register-customer", { name: "Weak", email: `w${stamp}@test.com`, password: "abc" });
await call("sneaky role", "POST", "/auth/register-customer", { name: "Eve", email: `e${stamp}@test.com`, password: "Strong123", role: "super_admin" });

// 4. Login and /me
const login = await call("login", "POST", "/auth/login", { email: `cust${stamp}@test.com`, password: "Strong123" });
await call("/me with token", "GET", "/auth/me", null, login.token);
await call("/me without token", "GET", "/auth/me");
await call("/me with fake token", "GET", "/auth/me", null, "abc.def.ghi");