import { Router } from "express";
import mongoose from "mongoose";

const router = Router();

// LIVENESS: "is the process alive?"
router.get("/", (req, res) => {
  res.json({ status: "ok", uptime: Math.round(process.uptime()), timestamp: new Date().toISOString() });
});

// READINESS: "can it serve traffic right now?" (database must be connected)
router.get("/ready", (req, res) => {
  const dbUp = mongoose.connection.readyState === 1;
  res.status(dbUp ? 200 : 503).json({ status: dbUp ? "ready" : "not_ready", db: dbUp ? "connected" : "disconnected" });
});

export default router;