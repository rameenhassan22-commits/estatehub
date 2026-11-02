import { Router } from "express";
import { protect } from "../middleware/auth.js";
import { authorize } from "../middleware/authorize.js";
import { validate } from "../middleware/validate.js";
import { overview, updateTenantStatus } from "../controllers/adminController.js";
import { updateTenantSchema, idParamSchema } from "../validators/schemas.js";

const router = Router();

// Platform owner only
router.use(protect, authorize("super_admin"));

router.get("/overview", overview);
router.patch("/tenants/:id", validate(idParamSchema, "params"), validate(updateTenantSchema), updateTenantStatus);

export default router;