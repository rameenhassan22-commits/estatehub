// Creates the platform owner account (role: super_admin). There is no public sign-up for this role on purpose.
// Usage: npm run seed:admin
import "dotenv/config";
import mongoose from "mongoose";
import User from "../models/User.js";

const email = process.env.SUPER_ADMIN_EMAIL;
const password = process.env.SUPER_ADMIN_PASSWORD;

if (!email || !password) {
  console.error("Set SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD in backend/.env first.");
  process.exit(1);
}

await mongoose.connect(process.env.MONGO_URI);

const existing = await User.findOne({ email: email.toLowerCase() });
if (existing) {
  console.log(`Super admin already exists: ${existing.email}`);
} else {
  await User.create({ name: "Platform Admin", email, password, role: "super_admin" });
  console.log(`Super admin created: ${email}`);
}

await mongoose.disconnect();