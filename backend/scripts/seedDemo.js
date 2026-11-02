// Fills the database with 2 demo agencies (+ admin, agent, listings each) and 1 customer.
// Usage: npm run seed:demo (refuses to run when NODE_ENV=production)
import "dotenv/config";
import mongoose from "mongoose";
import Tenant from "../models/Tenant.js";
import User from "../models/User.js";
import Property from "../models/Property.js";

if (process.env.NODE_ENV === "production") {
  console.error("Refusing to seed demo data in production.");
  process.exit(1);
}

const PASSWORD = "Demo@1234";

const agencies = [
  {
    name: "Prime Estate",
    slug: "prime-estate",
    city: "Islamabad",
    adminEmail: "admin@prime.test",
    agentEmail: "agent@prime.test",
    areas: ["F-7", "G-11", "DHA Phase 2", "Bahria Town"],
  },
  {
    name: "Lahore Homes",
    slug: "lahore-homes",
    city: "Lahore",
    adminEmail: "admin@lahorehomes.test",
    agentEmail: "agent@lahorehomes.test",
    areas: ["Gulberg", "DHA Phase 5", "Johar Town", "Model Town"],
  },
];

const types = ["house", "apartment", "plot", "commercial"];

await mongoose.connect(process.env.MONGO_URI);

for (const a of agencies) {
  // Safe to run twice: an agency that already exists is skipped
  if (await Tenant.exists({ slug: a.slug })) {
    console.log(`Skipping ${a.name} (already exists)`);
    continue;
  }

  const tenant = await Tenant.create({ name: a.name, slug: a.slug, email: a.adminEmail });
  const admin = await User.create({
    name: `${a.name} Admin`, email: a.adminEmail, password: PASSWORD, role: "agency_admin", tenantId: tenant._id,
  });
  const agent = await User.create({
    name: `${a.name} Agent`, email: a.agentEmail, password: PASSWORD, role: "agent", tenantId: tenant._id,
  });

  await Property.insertMany(
    a.areas.map((area, i) => ({
      tenantId: tenant._id, // every listing belongs to this agency
      createdBy: i % 2 === 0 ? admin._id : agent._id, // alternate between admin and agent
      title: `${types[i]} in ${area}, ${a.city}`.replace(/^./, (c) => c.toUpperCase()),
      description: "Demo listing created by the seed script.",
      price: (i + 1) * 7_500_000,
      propertyType: types[i],
      purpose: i === 1 ? "rent" : "sale",
      location: { city: a.city, area },
      bedrooms: types[i] === "plot" ? 0 : i + 2,
      area: 5 + i * 3,
      status: i === 3 ? "draft" : "available",
    }))
  );
  console.log(`Created ${a.name}: ${a.adminEmail} / ${a.agentEmail}`);
}

if (!(await User.exists({ email: "customer@demo.test" }))) {
  await User.create({ name: "Demo Customer", email: "customer@demo.test", password: PASSWORD, role: "customer" });
  console.log("Created customer@demo.test");
}

console.log(`\nAll demo accounts use the password: ${PASSWORD}`);
await mongoose.disconnect();
