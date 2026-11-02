import mongoose from "mongoose";
import { config } from "./env.js";
import { logger } from "./logger.js";

export const connectDB = async () => {
  try {
    mongoose.connection.on("disconnected", () => logger.warn("MongoDB disconnected"));
    mongoose.connection.on("reconnected", () => logger.info("MongoDB reconnected"));
    const conn = await mongoose.connect(config.MONGO_URI, { serverSelectionTimeoutMS: 10000 });
    logger.info({ host: conn.connection.host }, "MongoDB connected");
  } catch (err) {
    logger.fatal({ err: err.message }, "MongoDB connection failed");
    process.exit(1);
  }
};