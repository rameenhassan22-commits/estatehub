import express from "express";
import crypto from "node:crypto";
import cors from "cors";
import helmet from "helmet";
import pinoHttp from "pino-http";
import { config } from "./config/env.js";
import { logger } from "./config/logger.js";
import healthRoutes from "./routes/healthRoutes.js";
import { notFound, errorHandler } from "./middleware/error.js";
import authRoutes from "./routes/authRoutes.js";
import { apiLimiter } from "./middleware/rateLimiters.js";
import propertyRoutes from "./routes/propertyRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import inquiryRoutes from "./routes/inquiryRoutes.js";
import tenantRoutes from "./routes/tenantRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";

export const app = express();

// Behind a proxy (Render, Nginx, Docker) set TRUST_PROXY=1 so the real visitor IP is used
app.set("trust proxy", config.TRUST_PROXY);
app.disable("x-powered-by");

// 1. Request logging: one JSON line per request, with a request id
app.use(
  pinoHttp({
    logger,
    genReqId: (req, res) => {
      const id = req.headers["x-request-id"] || crypto.randomUUID();
      res.setHeader("x-request-id", id);
      return id;
    },
    customLogLevel: (req, res, err) => (err || res.statusCode >= 500 ? "error" : res.statusCode >= 400 ? "warn" : "info"),
    autoLogging: { ignore: (req) => req.url.startsWith("/api/health") },
    serializers: {
      req: (req) => ({ id: req.id, method: req.method, url: req.url }),
      res: (res) => ({ statusCode: res.statusCode }),
    },
  })
);

// 2. Security and parsing
app.use(helmet()); // safe HTTP headers
app.use(cors({ origin: config.clientOrigins, credentials: true }));
app.use(express.json({ limit: "100kb" })); // refuse giant bodies

// 3. Routes (more are added in later steps)
app.use("/api/health", healthRoutes);
app.use("/api", apiLimiter); // global rate limit for the whole API
app.use("/api/auth", authRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/users", userRoutes);
app.use("/api/inquiries", inquiryRoutes);
app.use("/api/tenants", tenantRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/dashboard", dashboardRoutes);

// 4. Errors (must be LAST)
app.use(notFound);
app.use(errorHandler);