import { Router } from "express";
import { protect } from "../middleware/auth.js";
import { authorize } from "../middleware/authorize.js";
import {
  listProperties, getProperty, createProperty, updateProperty, deleteProperty,
} from "../controllers/propertyController.js";

const router = Router();

// Optional Auth: Allows public to browse, but identifies agencies if they are logged in
const optionalAuth = async (req, res, next) => {
  if (req.headers.authorization) return protect(req, res, next);
  next();
};

// Public routes
router.get("/", optionalAuth, listProperties);
router.get("/:id", optionalAuth, getProperty);

// Protected routes (Agency Admin & Agent)
router.post("/", protect, authorize("agency_admin", "agent"), createProperty);
router.put("/:id", protect, authorize("agency_admin", "agent"), updateProperty);

// Protected routes (Agency Admin ONLY)
router.delete("/:id", protect, authorize("agency_admin"), deleteProperty);

export default router;