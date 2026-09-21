import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { AuthRequest } from "../types/index.js";
import { DEFAULT_KUA_DOCUMENTS } from "../constants/kuaSeed.js";
import { DEFAULT_OPERASIONAL_TASKS } from "../constants/operasionalSeed.js";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret_wedding_planner_jwt_key_2026";
const COOKIE_EXPIRES_DAYS = 7;

export const registerSchema = z.object({
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  groomName: z.string().min(1, "Nama pengantin pria wajib diisi"),
  brideName: z.string().min(1, "Nama pengantin wanita wajib diisi"),
  weddingDate: z.string().optional(),
  venue: z.string().optional(),
  totalBudget: z.number().nonnegative("Total budget tidak boleh negatif").optional().default(0),
});

// Login accepts email OR username
export const loginSchema = z.object({
  identifier: z.string().min(1, "Email atau username wajib diisi"),
  password: z.string().min(1, "Password wajib diisi"),
});

export const updateProfileSchema = z.object({
  groomName: z.string().min(1, "Nama pengantin pria tidak boleh kosong").optional(),
  brideName: z.string().min(1, "Nama pengantin wanita tidak boleh kosong").optional(),
  weddingDate: z.string().nullable().optional(),
  venue: z.string().nullable().optional(),
  totalBudget: z.number().nonnegative("Total budget tidak boleh negatif").optional(),
});

export const updateAccountSchema = z.object({
  username: z
    .string()
    .min(3, "Username minimal 3 karakter")
    .max(30, "Username maksimal 30 karakter")
    .regex(/^[a-z0-9_]+$/, "Username hanya boleh huruf kecil, angka, dan underscore")
    .nullable()
    .optional(),
  email: z.string().email("Format email tidak valid").optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Password saat ini wajib diisi"),
  newPassword: z.string().min(6, "Password baru minimal 6 karakter"),
  confirmPassword: z.string().min(1, "Konfirmasi password wajib diisi"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Konfirmasi password tidak cocok",
  path: ["confirmPassword"],
});

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, groomName, brideName, weddingDate, venue, totalBudget } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      res.status(400).json({
        success: false,
        message: "Email sudah terdaftar. Silakan gunakan email lain atau login.",
      });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: email.toLowerCase(),
          password: hashedPassword,
        },
      });

      const profile = await tx.weddingProfile.create({
        data: {
          userId: user.id,
          groomName,
          brideName,
          weddingDate: weddingDate ? new Date(weddingDate) : null,
          venue: venue || null,
          totalBudget: totalBudget || 0,
        },
      });

      await tx.kuaDocument.createMany({
        data: DEFAULT_KUA_DOCUMENTS.map((doc) => ({
          profileId: profile.id,
          documentName: doc.documentName,
          documentCode: doc.documentCode || null,
          documentType: doc.documentType,
          fromParty: doc.fromParty,
          notes: doc.notes || null,
          isCompleted: false,
          status: "pending",
        })),
      });

      await tx.operasionalTask.createMany({
        data: DEFAULT_OPERASIONAL_TASKS.map((task) => ({
          profileId: profile.id,
          taskName: task.taskName,
          phase: task.phase,
          scheduledTime: task.scheduledTime || null,
          assignedTo: task.assignedTo || null,
          priority: task.priority || "medium",
          notes: task.notes || null,
          isDone: false,
        })),
      });

      return { user, profile };
    });

    const token = jwt.sign(
      { userId: newUser.user.id, email: newUser.user.email },
      JWT_SECRET,
      { expiresIn: `${COOKIE_EXPIRES_DAYS}d` }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: COOKIE_EXPIRES_DAYS * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      success: true,
      message: "Registrasi berhasil!",
      data: {
        token,
        user: {
          id: newUser.user.id,
          email: newUser.user.email,
          username: null,
        },
        profile: newUser.profile,
      },
    });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat registrasi.",
    });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { identifier, password } = req.body;
    const normalized = identifier.toLowerCase().trim();

    // Try to match by email OR username
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: normalized },
          { username: normalized },
        ],
      },
      include: { weddingProfile: true },
    });

    if (!user) {
      res.status(401).json({
        success: false,
        message: "Email / username atau password salah.",
      });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({
        success: false,
        message: "Email / username atau password salah.",
      });
      return;
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: `${COOKIE_EXPIRES_DAYS}d` }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: COOKIE_EXPIRES_DAYS * 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      message: "Login berhasil!",
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
        },
        profile: user.weddingProfile,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat login.",
    });
  }
};

export const logout = async (_req: Request, res: Response): Promise<void> => {
  res.clearCookie("token");
  res.json({
    success: true,
    message: "Logout berhasil.",
  });
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: {
        id: true,
        email: true,
        username: true,
        createdAt: true,
        weddingProfile: true,
      },
    });

    if (!user) {
      res.status(404).json({
        success: false,
        message: "Pengguna tidak ditemukan.",
      });
      return;
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("GetMe Error:", error);
    res.status(500).json({
      success: false,
      message: "Gagal mengambil data profil.",
    });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { groomName, brideName, weddingDate, venue, totalBudget } = req.body;

    const updatedProfile = await prisma.weddingProfile.update({
      where: { id: req.user!.profileId },
      data: {
        ...(groomName !== undefined && { groomName }),
        ...(brideName !== undefined && { brideName }),
        ...(weddingDate !== undefined && { weddingDate: weddingDate ? new Date(weddingDate) : null }),
        ...(venue !== undefined && { venue }),
        ...(totalBudget !== undefined && { totalBudget }),
      },
    });

    res.json({
      success: true,
      message: "Profil pernikahan berhasil diperbarui.",
      data: updatedProfile,
    });
  } catch (error) {
    console.error("UpdateProfile Error:", error);
    res.status(500).json({
      success: false,
      message: "Gagal memperbarui profil pernikahan.",
    });
  }
};

export const updateAccount = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { username, email } = req.body;

    // Check username uniqueness
    if (username !== undefined && username !== null) {
      const normalizedUsername = username.toLowerCase().trim();
      const existingByUsername = await prisma.user.findFirst({
        where: { username: normalizedUsername, id: { not: userId } },
      });
      if (existingByUsername) {
        res.status(400).json({
          success: false,
          message: "Username sudah digunakan orang lain. Pilih username lain.",
        });
        return;
      }
    }

    // Check email uniqueness
    if (email !== undefined) {
      const normalizedEmail = email.toLowerCase().trim();
      const existingByEmail = await prisma.user.findFirst({
        where: { email: normalizedEmail, id: { not: userId } },
      });
      if (existingByEmail) {
        res.status(400).json({
          success: false,
          message: "Email sudah terdaftar untuk akun lain.",
        });
        return;
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(username !== undefined && {
          username: username ? username.toLowerCase().trim() : null,
        }),
        ...(email !== undefined && { email: email.toLowerCase().trim() }),
      },
      select: {
        id: true,
        email: true,
        username: true,
        createdAt: true,
      },
    });

    res.json({
      success: true,
      message: "Informasi akun berhasil diperbarui.",
      data: updatedUser,
    });
  } catch (error) {
    console.error("UpdateAccount Error:", error);
    res.status(500).json({
      success: false,
      message: "Gagal memperbarui informasi akun.",
    });
  }
};

export const changePassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { currentPassword, newPassword } = req.body;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      res.status(404).json({ success: false, message: "Pengguna tidak ditemukan." });
      return;
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      res.status(401).json({
        success: false,
        message: "Password saat ini tidak sesuai.",
      });
      return;
    }

    if (currentPassword === newPassword) {
      res.status(400).json({
        success: false,
        message: "Password baru tidak boleh sama dengan password lama.",
      });
      return;
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
    });

    res.json({
      success: true,
      message: "Password berhasil diperbarui. Silakan login ulang.",
    });
  } catch (error) {
    console.error("ChangePassword Error:", error);
    res.status(500).json({
      success: false,
      message: "Gagal memperbarui password.",
    });
  }
};
