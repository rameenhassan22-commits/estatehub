import { Router } from "express";
import { protect } from "../middleware/auth.js";
import { authorize } from "../middleware/authorize.js";
import { summary } from "../controllers/dashboardController.js";

const router = Router();

router.get("/summary", protect, authorize("agency_admin", "agent"), summary);

export default router;