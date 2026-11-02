import { Router } from "express";
import { protect } from "../middleware/auth.js";
import { authorize } from "../middleware/authorize.js";
import { validate } from "../middleware/validate.js";
import { inquiryLimiter } from "../middleware/rateLimiters.js";
import { createInquiry, listInquiries, updateInquiryStatus } from "../controllers/inquiryController.js";
import { createInquirySchema, updateInquirySchema, idParamSchema } from "../validators/schemas.js";

const router = Router();

router.post("/", protect, authorize("customer"), inquiryLimiter, validate(createInquirySchema), createInquiry);

// Everyone logged in (except super_admin): the controller returns only what that role may see
router.get("/", protect, authorize("customer", "agency_admin", "agent"), listInquiries);

router.patch(
  "/:id",
  protect,
  authorize("agency_admin", "agent"),
  validate(idParamSchema, "params"),
  validate(updateInquirySchema),
  updateInquiryStatus
);

export default router;