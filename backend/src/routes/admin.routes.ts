import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { requireAdmin } from "../middleware/admin.middleware.js";
import {
  getPlatformStats,
  getUsersList,
  deleteUser,
  getSystemSettings,
  updateSystemSetting,
  getPublicSettings,
} from "../controllers/admin.controller.js";

// Protected Admin Routes
export const adminRoutes = Router();
adminRoutes.use(authMiddleware);
adminRoutes.use(requireAdmin);

adminRoutes.get("/stats", getPlatformStats);
adminRoutes.get("/users", getUsersList);
adminRoutes.delete("/users/:id", deleteUser);
adminRoutes.get("/settings", getSystemSettings);
adminRoutes.put("/settings/:key", updateSystemSetting);

// Public Settings Routes (accessible by frontend without auth)
export const publicSettingsRoutes = Router();
publicSettingsRoutes.get("/public", getPublicSettings);

export default adminRoutes;
