import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./config/db.js";

dotenv.config();
const app = express();

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());

// health check
app.get("/api/health", (req, res) => res.json({ status: "ok" }));

// routes will be mounted here later
// app.use("/api/auth", authRoutes);
// app.use("/api/tenants", tenantRoutes);
// app.use("/api/properties", propertyRoutes);

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server on port ${PORT}`));
});