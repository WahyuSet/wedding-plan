import { Response, NextFunction } from "express";
import { AuthRequest } from "../types/index.js";

export const requireAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user || req.user.role !== "ADMIN") {
    res.status(403).json({
      success: false,
      message: "Akses ditolak. Fitur ini hanya dapat diakses oleh Superadmin.",
    });
    return;
  }
  next();
};
