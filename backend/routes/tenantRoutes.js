import { Router } from "express";
import { getTenantBySlug } from "../controllers/tenantController.js";

const router = Router();

router.get("/:slug", getTenantBySlug);

export default router;