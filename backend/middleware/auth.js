import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Tenant from "../models/Tenant.js";
import { config } from "../config/env.js";

const getToken = (req) =>
  req.headers.authorization?.startsWith("Bearer ") ? req.headers.authorization.split(" ")[1] : null;

// Staff of a suspended agency must be locked out immediately
const tenantIsBlocked = async (user) => {
  if (!user.tenantId) return false;
  const tenant = await Tenant.findById(user.tenantId).select("status");
  return !tenant || tenant.status !== "active";
};

// Token -> user, or a reason why not. Reused later by Socket.IO.
export const resolveUser = async (token) => {
  let decoded;
  try {
    decoded = jwt.verify(token, config.JWT_SECRET);
  } catch {
    return { error: "invalid" };
  }
  const user = await User.findById(decoded.id);
  if (!user || !user.isActive) return { error: "inactive" };
  if (await tenantIsBlocked(user)) return { error: "suspended" };
  return { user };
};

// Must be logged in
export const protect = async (req, res, next) => {
  const token = getToken(req);
  if (!token) return res.status(401).json({ message: "Not authenticated. No token provided." });

  const { user, error } = await resolveUser(token);
  if (error === "invalid") return res.status(401).json({ message: "Invalid or expired token" });
  if (error === "inactive") return res.status(401).json({ message: "User not found or inactive" });
  if (error === "suspended") {
    return res.status(403).json({ message: "Your agency account is suspended. Contact support." });
  }

  req.user = user;
  next();
};

// Public route that still wants to know WHO is calling (if anyone)
export const optionalAuth = async (req, res, next) => {
  const token = getToken(req);
  if (token) {
    const { user } = await resolveUser(token);
    if (user) req.user = user;
  }
  next();
};