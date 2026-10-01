import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";
import { env } from "../config/env.js";
import type { JwtPayload } from "./auth.middleware.js";

const FLAG_CACHE_MS = 5_000;
let cache: { at: number; values: Map<string, boolean> } | null = null;

// Aman dipanggil di tiap request; hasil di-cache singkat agar tidak membebani DB.
export const getFlag = async (key: string, fallback: boolean): Promise<boolean> => {
  const now = Date.now();
  if (!cache || now - cache.at > FLAG_CACHE_MS) {
    const rows = await prisma.systemSetting.findMany();
    cache = { at: now, values: new Map(rows.map((r) => [r.key, r.value === "true"])) };
  }
  return cache.values.get(key) ?? fallback;
};

export const invalidateFlagCache = (): void => {
  cache = null;
};

export const requireFlag =
  (key: string, fallback = true) =>
  async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (await getFlag(key, fallback)) {
        next();
        return;
      }
      res.status(403).json({
        success: false,
        message: "Fitur ini sedang dinonaktifkan oleh administrator.",
      });
    } catch (error) {
      next(error);
    }
  };

const MAINTENANCE_ALLOWED = ["/api/health", "/api/settings/public", "/api/auth/login", "/api/auth/logout", "/api/auth/me"];

const isAdminRequest = async (req: Request): Promise<boolean> => {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.split(" ")[1] : req.cookies?.token;
  if (!token) return false;
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { role: true, tokenVersion: true },
    });
    return user?.role === "ADMIN" && (decoded.tokenVersion ?? 0) === user.tokenVersion;
  } catch {
    return false;
  }
};

export const maintenanceGuard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (MAINTENANCE_ALLOWED.includes(req.originalUrl.split("?")[0])) {
      next();
      return;
    }
    if (!(await getFlag("system_maintenance", false))) {
      next();
      return;
    }
    if (await isAdminRequest(req)) {
      next();
      return;
    }
    res.status(503).json({
      success: false,
      message: "Sistem sedang dalam pemeliharaan. Silakan coba lagi nanti.",
    });
  } catch (error) {
    next(error);
  }
};
