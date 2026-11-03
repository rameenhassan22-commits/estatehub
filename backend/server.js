import http from "node:http";
import { config } from "./config/env.js"; // validates the environment FIRST
import { logger } from "./config/logger.js";
import { connectDB } from "./config/db.js";
import { app } from "./app.js";
import { attachSocket } from "./realtime/socket.js";

await connectDB();

// We create the HTTP server ourselves (not app.listen) so Socket.IO can share it later
const server = http.createServer(app);
attachSocket(server);


server.listen(config.PORT, () => {
  logger.info({ port: config.PORT, env: config.NODE_ENV }, "server started");
});