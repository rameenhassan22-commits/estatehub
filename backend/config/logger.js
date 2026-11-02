import pino from "pino";
import { config } from "./env.js";

export const logger = pino({
  level: config.LOG_LEVEL,
  base: { service: "estatehub-api", env: config.NODE_ENV },
  timestamp: pino.stdTimeFunctions.isoTime,
  redact: {
    paths: ["req.headers.authorization", "req.headers.cookie", "res.headers['set-cookie']", "*.password", "*.token"],
    censor: "[redacted]",
  },
  ...(config.NODE_ENV === "development"
    ? { transport: { target: "pino-pretty", options: { colorize: true, translateTime: "HH:MM:ss", ignore: "pid,hostname,service,env" } } }
    : {}),
});