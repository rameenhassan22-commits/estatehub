import { config } from "../config/env.js";

// 404 for unknown API routes
export const notFound = (req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
};

// One place that turns any thrown error into a clean JSON response.
// Express 5 forwards errors from async handlers here automatically (no try/catch needed).
// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || "value";
    return res.status(409).json({ message: `${field} already in use`, errors: { [field]: "Already in use" } });
  }
  if (err.name === "CastError") {
    return res.status(400).json({ message: "Invalid id" });
  }
  if (err.name === "ValidationError") {
    const errors = Object.fromEntries(Object.entries(err.errors).map(([k, v]) => [k, v.message]));
    return res.status(400).json({ message: "Validation failed", errors });
  }
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ message: "Malformed JSON body" });
  }
  if (err.type === "entity.too.large") {
    return res.status(413).json({ message: "Request body too large" });
  }

  // Unexpected error: log it with the request id, but never leak internals in production.
  req.log?.error({ err }, "unhandled error");
  res.status(err.status || 500).json({
    message: config.isProd ? "Something went wrong" : err.message,
    requestId: req.id,
  });
};