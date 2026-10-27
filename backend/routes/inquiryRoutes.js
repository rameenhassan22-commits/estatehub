import { Router } from "express";
import { protect } from "../middleware/auth.js";
import { authorize } from "../middleware/authorize.js";
import {
  createInquiry, 
  listInquiries, 
  updateInquiryStatus,
} from "../controllers/inquiryController.js";

const router = Router();

// Only logged-in customers can create inquiries
router.post("/", protect, authorize("customer"), createInquiry);

// Anyone logged in can list their inquiries (controller filters it by role)
router.get("/", protect, listInquiries);

// Only agency staff can change the status
router.patch("/:id", protect, authorize("agency_admin", "agent"), updateInquiryStatus);

export default router;