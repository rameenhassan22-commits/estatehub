import { Router } from "express";
import { protect } from "../middleware/auth.js";
import { authorize } from "../middleware/authorize.js";
import {
  createAgencyUser,
  listAgencyUsers,
  deleteAgencyUser,
} from "../controllers/userController.js";

const router = Router();

// Apply authentication and role authorization to ALL routes in this file
router.use(protect, authorize("agency_admin"));

router.route("/")
  .get(listAgencyUsers)
  .post(createAgencyUser);

router.delete("/:id", deleteAgencyUser);

export default router;