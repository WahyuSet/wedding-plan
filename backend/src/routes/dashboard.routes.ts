import { Router } from "express";
import { getDashboardSummary } from "../controllers/dashboard.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

router.use(authMiddleware);

router.get("/summary", getDashboardSummary);

export default router;
