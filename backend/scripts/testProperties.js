import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import User from "../models/User.js";
import Tenant from "../models/Tenant.js";
import Property from "../models/Property.js";

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
const check = (label, ok, extra = "") => {
  ok ? pass++ : fail++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${label} ${extra}`);
};
const house = (title, extra = {}) => ({
  title, price: 5000000, propertyType: "house", purpose: "sale", location: { city: "Lahore" }, ...extra,
});

await connectDB();

// --- set up: two agencies, an agent in A, and a customer ---
const mkAgency = (n) => api("POST", "/auth/register-agency", { agencyName: `Agency ${n} ${stamp}`, name: `Admin ${n}`, email: `admin${n}${stamp}@test.com`, password: "Strong123" });
const A = (await mkAgency("A")).data;
const B = (await mkAgency("B")).data;
await User.create({ name: "Agent A", email: `agent${stamp}@test.com`, password: "Strong123", role: "agent", tenantId: A.tenant._id });
const agent = (await api("POST", "/auth/login", { email: `agent${stamp}@test.com`, password: "Strong123" })).data;
const cust = (await api("POST", "/auth/register-customer", { name: "Cust", email: `c${stamp}@test.com`, password: "Strong123" })).data;

// --- creating ---
const pA = await api("POST", "/properties", house("Admin A house"), A.token);
check("admin A creates a property", pA.status === 201);
check("tenantId was set automatically", pA.data.tenantId === A.tenant._id);
const draftA = await api("POST", "/properties", house("Admin A draft", { status: "draft" }), A.token);
const pB = await api("POST", "/properties", house("Admin B house"), B.token);
check("tenantId in body is rejected", (await api("POST", "/properties", house("Hack", { tenantId: B.tenant._id }), A.token)).status === 400);
check("customer cannot create", (await api("POST", "/properties", house("Nope"), cust.token)).status === 403);
check("guest cannot create", (await api("POST", "/properties", house("Nope"))).status === 401);

// --- reading ---
const pub = await api("GET", `/properties?limit=50`);
const titles = pub.data.items.map((p) => p.title);
check("public list shows available listings", titles.includes("Admin A house") && titles.includes("Admin B house"));
check("public list hides drafts", !titles.includes("Admin A draft"));
const sneaky = await api("GET", `/properties?status=draft&limit=50`);
check("?status=draft does NOT leak drafts", !sneaky.data.items.some((p) => p.title === "Admin A draft"));
const mine = await api("GET", `/properties?scope=agency&limit=50`, null, A.token);
const mineTitles = mine.data.items.map((p) => p.title);
check("agency A dashboard shows only A (incl. draft)", mineTitles.includes("Admin A draft") && !mineTitles.includes("Admin B house"));
check("guest cannot open a draft", (await api("GET", `/properties/${draftA.data._id}`)).status === 404);
check("search works", (await api("GET", `/properties?q=Admin%20A%20house`)).data.items.length >= 1);
check("sort=password rejected", (await api("GET", `/properties?sort=password`)).status === 400);

// --- editing ---
check("admin B cannot edit A's listing (404)", (await api("PUT", `/properties/${pA.data._id}`, { title: "Hacked title" }, B.token)).status === 404);
check("admin A edits own listing", (await api("PUT", `/properties/${pA.data._id}`, { price: 6000000 }, A.token)).status === 200);
check("agent cannot edit admin's listing (403)", (await api("PUT", `/properties/${pA.data._id}`, { price: 1 }, agent.token)).status === 403);
const pAgent = await api("POST", "/properties", house("Agent A house"), agent.token);
check("agent edits own listing", (await api("PUT", `/properties/${pAgent.data._id}`, { price: 7000000 }, agent.token)).status === 200);

// --- deleting ---
check("agent cannot delete (403)", (await api("DELETE", `/properties/${pAgent.data._id}`, null, agent.token)).status === 403);
check("admin B cannot delete A's (404)", (await api("DELETE", `/properties/${pAgent.data._id}`, null, B.token)).status === 404);
check("admin A deletes", (await api("DELETE", `/properties/${pAgent.data._id}`, null, A.token)).status === 200);

console.log(`\n${pass} passed, ${fail} failed`);

// --- clean up ---
const ids = [A.tenant._id, B.tenant._id];
await Property.deleteMany({ tenantId: { $in: ids } });
await User.deleteMany({ $or: [{ tenantId: { $in: ids } }, { email: `c${stamp}@test.com` }] });
await Tenant.deleteMany({ _id: { $in: ids } });
await mongoose.connection.close();