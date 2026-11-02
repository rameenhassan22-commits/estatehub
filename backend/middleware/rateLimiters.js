import rateLimit from "express-rate-limit";
import { config } from "../config/env.js";

const windowMs = config.RATE_LIMIT_WINDOW_MIN * 60 * 1000;
const base = { standardHeaders: "draft-7", legacyHeaders: false };

// All /api calls, per IP (generous)
export const apiLimiter = rateLimit({
  ...base,
  windowMs,
  limit: config.API_RATE_LIMIT,
  skip: (req) => req.path.startsWith("/health"),
  message: { message: "Too many requests. Please slow down." },
});

// Login and register, per IP (strict, blocks password guessing)
export const authLimiter = rateLimit({
  ...base,
  windowMs,
  limit: config.AUTH_RATE_LIMIT,
  message: { message: "Too many attempts. Please try again in a few minutes." },
});

// Sending inquiries, per logged-in customer (used in a later step)
export const inquiryLimiter = rateLimit({
  ...base,
  windowMs: 60 * 60 * 1000,
  limit: config.INQUIRY_RATE_LIMIT,
  keyGenerator: (req) => String(req.user?._id),
  message: { message: "You have sent too many inquiries. Please try again later." },
});