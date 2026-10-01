import { Router } from "express";
import { getDashboardSummary } from "../controllers/dashboard.controller.js";
import { authMiddleware, requireProfile } from "../middleware/auth.middleware.js";

const router = Router();

router.use(authMiddleware, requireProfile);

router.get("/summary", getDashboardSummary);

export default router;
