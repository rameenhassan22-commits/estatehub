import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import User from "../models/User.js";
import Tenant from "../models/Tenant.js";
import Property from "../models/Property.js";
import Inquiry from "../models/Inquiry.js";

const BASE = "http://localhost:5000/api";
const stamp = Date.now();
let pass = 0, fail = 0;

const api = async (method, path, body, token) => {
  const res = await fetch(BASE + path, {
    method,
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  return { status: res.status, data: await res.json().catch(() => ({})) };
};
const check = (label, ok) => {
  ok ? pass++ : fail++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${label}`);
};
const house = (title) => ({ title, price: 5000000, propertyType: "house", purpose: "sale", location: { city: "Lahore" } });

await connectDB();

// --- set up ---
const mkAgency = (n) => api("POST", "/auth/register-agency", { agencyName: `Agency ${n} ${stamp}`, name: `Admin ${n}`, email: `admin${n}${stamp}@test.com`, password: "Strong123" });
const A = (await mkAgency("A")).data;
const B = (await mkAgency("B")).data;
const cust = (await api("POST", "/auth/register-customer", { name: "Cust", email: `c${stamp}@test.com`, password: "Strong123" })).data;
await User.create({ name: "Super", email: `super${stamp}@test.com`, password: "Strong123", role: "super_admin" });
const sa = (await api("POST", "/auth/login", { email: `super${stamp}@test.com`, password: "Strong123" })).data;

// --- team ---
const agentRes = await api("POST", "/users", { name: "Agent A", email: `agent${stamp}@test.com`, password: "Strong123", role: "agent" }, A.token);
check("admin A creates an agent", agentRes.status === 201);
check("agent received admin A's tenantId", agentRes.data.tenantId === A.tenant._id);
const team = await api("GET", "/users", null, A.token);
check("team list shows only own agency", team.data.length === 2 && team.data.every((u) => u.tenantId === A.tenant._id));
const agent = (await api("POST", "/auth/login", { email: `agent${stamp}@test.com`, password: "Strong123" })).data;
check("agent cannot list the team (403)", (await api("GET", "/users", null, agent.token)).status === 403);
check("admin B cannot deactivate A's agent (404)", (await api("PATCH", `/users/${agentRes.data._id}`, { isActive: false }, B.token)).status === 404);
check("admin cannot deactivate self (400)", (await api("PATCH", `/users/${A.user._id}`, { isActive: false }, A.token)).status === 400);
check("admin A deactivates the agent", (await api("PATCH", `/users/${agentRes.data._id}`, { isActive: false }, A.token)).status === 200);
check("deactivated agent's token stops working (401)", (await api("GET", "/auth/me", null, agent.token)).status === 401);
check("admin A reactivates the agent", (await api("PATCH", `/users/${agentRes.data._id}`, { isActive: true }, A.token)).status === 200);

// --- properties + inquiries ---
const pAdmin = (await api("POST", "/properties", house("A admin house"), A.token)).data;
const pAgent = (await api("POST", "/properties", house("A agent house"), agent.token)).data;
const msg = { message: "Is this still available for viewing?" };

const i1 = await api("POST", "/inquiries", { propertyId: pAdmin._id, ...msg }, cust.token);
check("customer sends an inquiry", i1.status === 201);
check("inquiry tenantId copied from the property", i1.data.tenantId === A.tenant._id);
const i2 = await api("POST", "/inquiries", { propertyId: pAgent._id, ...msg }, cust.token);
check("inquiry on a missing property (404)", (await api("POST", "/inquiries", { propertyId: "000000000000000000000000", ...msg }, cust.token)).status === 404);
check("guest cannot send an inquiry (401)", (await api("POST", "/inquiries", { propertyId: pAdmin._id, ...msg })).status === 401);
check("agent cannot send an inquiry (403)", (await api("POST", "/inquiries", { propertyId: pAdmin._id, ...msg }, agent.token)).status === 403);
check("tenantId in inquiry body rejected (400)", (await api("POST", "/inquiries", { propertyId: pAdmin._id, ...msg, tenantId: B.tenant._id }, cust.token)).status === 400);

check("admin A sees both inquiries", (await api("GET", "/inquiries", null, A.token)).data.length === 2);
const agentInq = (await api("GET", "/inquiries", null, agent.token)).data;
check("agent sees only inquiries on own listing", agentInq.length === 1 && agentInq[0]._id === i2.data._id);
check("admin B sees none of A's inquiries", (await api("GET", "/inquiries", null, B.token)).data.length === 0);
check("customer sees own inquiries", (await api("GET", "/inquiries", null, cust.token)).data.length === 2);

check("agent cannot update another agent's inquiry (404)", (await api("PATCH", `/inquiries/${i1.data._id}`, { status: "contacted" }, agent.token)).status === 404);
check("agent updates inquiry on own listing", (await api("PATCH", `/inquiries/${i2.data._id}`, { status: "contacted" }, agent.token)).status === 200);
check("customer cannot change status (403)", (await api("PATCH", `/inquiries/${i1.data._id}`, { status: "closed" }, cust.token)).status === 403);
check("admin B cannot update A's inquiry (404)", (await api("PATCH", `/inquiries/${i1.data._id}`, { status: "closed" }, B.token)).status === 404);
check("invalid status rejected (400)", (await api("PATCH", `/inquiries/${i1.data._id}`, { status: "banana" }, A.token)).status === 400);

// --- dashboard ---
const sumA = (await api("GET", "/dashboard/summary", null, A.token)).data;
check("admin summary: 2 properties, 2 inquiries", sumA.properties.total === 2 && sumA.inquiries.total === 2);
const sumAgent = (await api("GET", "/dashboard/summary", null, agent.token)).data;
check("agent summary: only own (1 property)", sumAgent.properties.total === 1);
check("customer has no dashboard (403)", (await api("GET", "/dashboard/summary", null, cust.token)).status === 403);

// --- agency page ---
const page = await api("GET", `/tenants/${A.tenant.slug}`);
check("public agency page works (2 listings)", page.status === 200 && page.data.listings === 2);
check("unknown agency (404)", (await api("GET", "/tenants/does-not-exist")).status === 404);

// --- super admin ---
check("agency admin cannot open the platform API (403)", (await api("GET", "/admin/overview", null, A.token)).status === 403);
const ov = await api("GET", "/admin/overview", null, sa.token);
check("super admin sees platform overview", ov.status === 200 && ov.data.stats.tenants >= 2);
check("super admin suspends agency A", (await api("PATCH", `/admin/tenants/${A.tenant._id}`, { status: "inactive" }, sa.token)).status === 200);
check("suspended agency's admin is locked out (403)", (await api("GET", "/auth/me", null, A.token)).status === 403);
const pub = (await api("GET", "/properties?limit=50")).data.items.map((p) => p.title);
check("suspended agency's listings hidden publicly", !pub.includes("A admin house") && !pub.includes("A agent house"));
check("suspended agency page is gone (404)", (await api("GET", `/tenants/${A.tenant.slug}`)).status === 404);
check("super admin reactivates agency A", (await api("PATCH", `/admin/tenants/${A.tenant._id}`, { status: "active" }, sa.token)).status === 200);
check("agency admin works again (200)", (await api("GET", "/auth/me", null, A.token)).status === 200);

console.log(`\n${pass} passed, ${fail} failed`);

// --- clean up ---
const ids = [A.tenant._id, B.tenant._id];
await Inquiry.deleteMany({ tenantId: { $in: ids } });
await Property.deleteMany({ tenantId: { $in: ids } });
await User.deleteMany({ $or: [{ tenantId: { $in: ids } }, { email: { $in: [`c${stamp}@test.com`, `super${stamp}@test.com`] } }] });
await Tenant.deleteMany({ _id: { $in: ids } });
await mongoose.connection.close();