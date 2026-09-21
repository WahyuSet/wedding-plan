import { Router } from "express";
import {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  updateAccount,
  changePassword,
  registerSchema,
  loginSchema,
  updateProfileSchema,
  updateAccountSchema,
  changePasswordSchema,
} from "../controllers/auth.controller.js";
import { validate } from "../middleware/validate.middleware.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.post("/logout", logout);
router.get("/me", authMiddleware, getMe);
router.put("/profile", authMiddleware, validate(updateProfileSchema), updateProfile);
router.put("/account", authMiddleware, validate(updateAccountSchema), updateAccount);
router.put("/change-password", authMiddleware, validate(changePasswordSchema), changePassword);

export default router;
