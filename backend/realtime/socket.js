import { Server } from "socket.io";
import { resolveUser } from "../middleware/auth.js";
import { config } from "../config/env.js";
import { logger } from "../config/logger.js";

let io = null;

export const attachSocket = (httpServer, { loadUser = resolveUser } = {}) => {
  io = new Server(httpServer, {
    cors: { origin: config.clientOrigins, credentials: true },
  });

  // Handshake guard: no valid token -> connection refused
  io.use(async (socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("unauthorized"));
    try {
      const { user, error } = await loadUser(token);
      if (!user) return next(new Error(error || "unauthorized"));
      socket.data.user = { id: String(user._id), role: user.role, tenantId: user.tenantId ? String(user.tenantId) : null };
      next();
    } catch (err) {
      logger.error({ err: err.message }, "socket auth failed");
      next(new Error("unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    const { id, role, tenantId } = socket.data.user;
    socket.join(`user:${id}`);
    if (role === "agency_admin" && tenantId) socket.join(`admins:${tenantId}`);
    logger.debug({ userId: id, role }, "socket connected");
    socket.on("disconnect", (reason) => logger.debug({ userId: id, reason }, "socket disconnected"));
  });

  return io;
};

// ---- emit helpers (safe no-ops if sockets are not attached, e.g. in unit tests) ----
export const emitToRooms = (rooms, event, payload) => {
  if (!io) return;
  io.to(rooms).emit(event, payload); // an array of rooms: a socket in several of them still gets it ONCE
};

export const closeSocket = () =>
  new Promise((resolve) => {
    if (!io) return resolve();
    io.close(() => resolve()); // also closes the underlying HTTP server
  });