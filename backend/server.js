import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js"; 
import userRoutes from "./routes/userRoutes.js"; 
import propertyRoutes from "./routes/propertyRoutes.js";
import inquiryRoutes from "./routes/inquiryRoutes.js"; 

dotenv.config();
connectDB();

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "EstateHub API is running" });
});

// Mount Routes
app.use("/api/auth", authRoutes); 
app.use("/api/users", userRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/inquiries", inquiryRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});