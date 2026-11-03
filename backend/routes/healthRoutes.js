import { Router } from "express";
import mongoose from "mongoose";
import { state } from "../utils/gracefulShutdown.js";

const router = Router();

// LIVENESS: "is the process alive?"  -> if this fails the platform restarts the container
router.get("/", (req, res) => {
  res.json({ status: "ok", uptime: Math.round(process.uptime()), timestamp: new Date().toISOString() });
});

// READINESS: "can it serve traffic right now?" -> if this fails the load balancer stops routing to it,
// but does NOT restart it (e.g. DB briefly down, or we are shutting down).
router.get("/ready", (req, res) => {
  const dbUp = mongoose.connection.readyState === 1;
  const ready = dbUp && !state.shuttingDown;
  res.status(ready ? 200 : 503).json({
    status: ready ? "ready" : "not_ready",
    db: dbUp ? "connected" : "disconnected",
    shuttingDown: state.shuttingDown,
  });
});

export default router;