import { Router } from "express";
import { protect, optionalAuth } from "../middleware/auth.js";
import { authorize } from "../middleware/authorize.js";
import { validate } from "../middleware/validate.js";
import {
  listProperties,
  getProperty,
  createProperty,
  updateProperty,
  deleteProperty,
} from "../controllers/propertyController.js";
import {
  createPropertySchema,
  updatePropertySchema,
  listPropertiesQuerySchema,
  idParamSchema,
} from "../validators/schemas.js";

const router = Router();

// Public routes (optionalAuth: staff are recognised if logged in, guests are fine too)
router.get("/", optionalAuth, validate(listPropertiesQuerySchema, "query"), listProperties);
router.get("/:id", optionalAuth, validate(idParamSchema, "params"), getProperty);

// agency_admin + agent
router.post("/", protect, authorize("agency_admin", "agent"), validate(createPropertySchema), createProperty);
router.put(
  "/:id",
  protect,
  authorize("agency_admin", "agent"),
  validate(idParamSchema, "params"),
  validate(updatePropertySchema),
  updateProperty
);

// agency_admin only
router.delete("/:id", protect, authorize("agency_admin"), validate(idParamSchema, "params"), deleteProperty);

export default router;