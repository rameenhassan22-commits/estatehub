import jwt from "jsonwebtoken";
import { config } from "../config/env.js";

export const generateToken = (id) => jwt.sign({ id }, config.JWT_SECRET, { expiresIn: config.JWT_EXPIRES_IN });