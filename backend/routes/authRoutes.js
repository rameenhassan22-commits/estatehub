import { Router } from "express";
import { 
  registerAgency, 
  registerCustomer, 
  login, 
  getMe 
} from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";

const router = Router();

router.post("/register-agency", registerAgency);
router.post("/register-customer", registerCustomer);
router.post("/login", login);
router.get("/me", protect, getMe); // Protect this route so only logged-in users can access it

export default router;