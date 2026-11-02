import "dotenv/config";
import { z } from "zod";

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().min(1).max(65535).default(5000),
  MONGO_URI: z.string().min(1, "MONGO_URI is required"),
  JWT_SECRET: z.string().min(16, "JWT_SECRET must be at least 16 characters"),
  JWT_EXPIRES_IN: z.string().default("7d"),
  CLIENT_URL: z.string().default("http://localhost:5173"),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"]).default("info"),
  TRUST_PROXY: z.coerce.number().int().min(0).default(0),
  RATE_LIMIT_WINDOW_MIN: z.coerce.number().int().min(1).default(15),
  API_RATE_LIMIT: z.coerce.number().int().min(1).default(300),
  AUTH_RATE_LIMIT: z.coerce.number().int().min(1).default(30),
  INQUIRY_RATE_LIMIT: z.coerce.number().int().min(1).default(20),
  SHUTDOWN_TIMEOUT_MS: z.coerce.number().int().min(1000).default(10000),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().int().default(587),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  MAIL_FROM: z.string().default("EstateHub <no-reply@estatehub.local>"),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  console.error("\nInvalid environment configuration:");
  for (const issue of parsed.error.issues) console.error(`   - ${issue.path.join(".")}: ${issue.message}`);
  process.exit(1); // fail fast: don't start with bad config
}

export const config = {
  ...parsed.data,
  isProd: parsed.data.NODE_ENV === "production",
  // "a.com, b.com/" -> ["a.com", "b.com"]  (used for CORS and Socket.IO)
  clientOrigins: parsed.data.CLIENT_URL.split(",").map((s) => s.trim().replace(/\/$/, "")).filter(Boolean),
};