import { Router } from "express";
import { protect } from "../middleware/auth.js";
import { authorize } from "../middleware/authorize.js";
import { validate } from "../middleware/validate.js";
import {
  createAgencyUser,
  listAgencyUsers,
  updateAgencyUser,
  deleteAgencyUser,
} from "../controllers/userController.js";
import { createAgencyUserSchema, updateAgencyUserSchema, idParamSchema } from "../validators/schemas.js";

const router = Router();

// Every route in this file: logged in AND agency_admin
router.use(protect, authorize("agency_admin"));

router.route("/").get(listAgencyUsers).post(validate(createAgencyUserSchema), createAgencyUser);

router
  .route("/:id")
  .patch(validate(idParamSchema, "params"), validate(updateAgencyUserSchema), updateAgencyUser)
  .delete(validate(idParamSchema, "params"), deleteAgencyUser);

export default router;