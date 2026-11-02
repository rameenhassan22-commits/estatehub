import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import Tenant from "../models/Tenant.js";
import User from "../models/User.js";
import Property from "../models/Property.js";

await connectDB();

// Two agencies
const a = await Tenant.create({ name: "Test Agency A", slug: "test-a", email: "a@test.com" });
const b = await Tenant.create({ name: "Test Agency B", slug: "test-b", email: "b@test.com" });

// An admin for agency A
const admin = await User.create({
  name: "Admin A", email: "admin-a@test.com", password: "Test1234", role: "agency_admin", tenantId: a._id,
});

// One listing per agency
await Property.create({ tenantId: a._id, createdBy: admin._id, title: "House of A", price: 100, propertyType: "house", purpose: "sale" });
await Property.create({ tenantId: b._id, createdBy: admin._id, title: "House of B", price: 200, propertyType: "house", purpose: "sale" });

// 1. The password must be hashed and hidden
const stored = await User.findById(admin._id).select("+password");
console.log("password hashed:", stored.password.startsWith("$2"));
console.log("password hidden by default:", (await User.findById(admin._id)).password === undefined);

// 2. Isolation: agency A sees only its own listing
const seenByA = await Property.find({ tenantId: a._id });
console.log("agency A sees:", seenByA.map((p) => p.title));

// Clean up everything we created
await Property.deleteMany({ tenantId: { $in: [a._id, b._id] } });
await User.deleteMany({ email: "admin-a@test.com" });
await Tenant.deleteMany({ _id: { $in: [a._id, b._id] } });
await mongoose.connection.close();