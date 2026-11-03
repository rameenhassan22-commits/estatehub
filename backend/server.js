import http from "node:http";
import mongoose from "mongoose";
import { config } from "./config/env.js"; // validates the environment FIRST - bad config = immediate, readable failure
import { logger } from "./config/logger.js";
import { connectDB } from "./config/db.js";
import { app } from "./app.js";
import { attachSocket, closeSocket } from "./realtime/socket.js";
import { registerGracefulShutdown } from "./utils/gracefulShutdown.js";

await connectDB();

// We create the HTTP server ourselves (instead of app.listen) so Socket.IO can share it
const server = http.createServer(app);
attachSocket(server);

server.listen(config.PORT, () => {
  logger.info({ port: config.PORT, env: config.NODE_ENV }, "server started");
});

registerGracefulShutdown({
  server,
  closeConnections: closeSocket,
  cleanup: () => mongoose.connection.close(),
  logger,
  timeoutMs: config.SHUTDOWN_TIMEOUT_MS,
});