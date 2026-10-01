import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AuthRequest } from "../types/index.js";
import { prisma } from "../lib/prisma.js";
import { env } from "../config/env.js";

export interface JwtPayload {
  userId: string;
  email: string;
  role?: string;
  tokenVersion?: number;
}

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined;

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      res.status(401).json({
        success: false,
        message: "Akses ditolak. Silakan login terlebih dahulu.",
      });
      return;
    }

    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { weddingProfile: true },
    });

    if (!user) {
      res.status(401).json({
        success: false,
        message: "Pengguna tidak ditemukan atau telah dihapus.",
      });
      return;
    }

    if ((decoded.tokenVersion ?? 0) !== user.tokenVersion) {
      res.status(401).json({
        success: false,
        message: "Sesi tidak valid atau telah kadaluarsa. Silakan login kembali.",
      });
      return;
    }

    if (!user.weddingProfile && user.role !== "ADMIN") {
      res.status(404).json({
        success: false,
        message: "Profil pernikahan tidak ditemukan.",
      });
      return;
    }

    req.user = {
      userId: user.id,
      email: user.email,
      role: user.role,
      profileId: user.weddingProfile?.id,
    };

    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Sesi tidak valid atau telah kadaluarsa. Silakan login kembali.",
    });
  }
};

export const requireProfile = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user?.profileId) {
    res.status(403).json({
      success: false,
      message: "Akun ini tidak memiliki profil pernikahan.",
    });
    return;
  }
  next();
};
