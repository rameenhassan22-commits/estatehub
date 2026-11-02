import { Router } from "express";
import { registerAgency, registerCustomer, login, getMe } from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { authLimiter } from "../middleware/rateLimiters.js";
import { registerAgencySchema, registerCustomerSchema, loginSchema } from "../validators/schemas.js";

const router = Router();

router.post("/register-agency", authLimiter, validate(registerAgencySchema), registerAgency);
router.post("/register-customer", authLimiter, validate(registerCustomerSchema), registerCustomer);
router.post("/login", authLimiter, validate(loginSchema), login);
router.get("/me", protect, getMe);

export default router;