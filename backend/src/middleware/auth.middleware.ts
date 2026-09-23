import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AuthRequest, AuthenticatedUser } from "../types/index.js";
import { prisma } from "../lib/prisma.js";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret_wedding_planner_jwt_key_2026";

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined;

    // Check Authorization header (Bearer token)
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }
    // Check Cookies
    else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      res.status(401).json({
        success: false,
        message: "Akses ditolak. Silakan login terlebih dahulu.",
      });
      return;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string;
      email: string;
      role?: string;
    };

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
