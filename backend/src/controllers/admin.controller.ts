import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { AuthRequest } from "../types/index.js";

// 1. Get Global Platform Statistics
export const getPlatformStats = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const totalUsers = await prisma.user.count({
      where: { role: "USER" },
    });

    const totalProfiles = await prisma.weddingProfile.count();

    const budgetAgg = await prisma.weddingProfile.aggregate({
      _sum: {
        totalBudget: true,
      },
    });

    const totalDigitalInvitations = await prisma.digitalInvitation.count({
      where: { isPublished: true },
    });

    const totalGuests = await prisma.invitationGuest.count();
    const totalRsvps = await prisma.invitationRsvp.count();

    res.json({
      success: true,
      data: {
        totalUsers,
        totalProfiles,
        totalBudgetManaged: budgetAgg._sum.totalBudget || 0,
        totalDigitalInvitations,
        totalGuests,
        totalRsvps,
      },
    });
  } catch (error) {
    console.error("Admin Stats Error:", error);
    res.status(500).json({
      success: false,
      message: "Gagal mengambil statistik platform.",
    });
  }
};

// 2. Get Users Directory with Search
export const getUsersList = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const search = ((req.query.search as string) || "").trim().toLowerCase();

    const users = await prisma.user.findMany({
      where: search
        ? {
            OR: [
              { email: { contains: search } },
              { username: { contains: search } },
              {
                weddingProfile: {
                  OR: [
                    { groomName: { contains: search } },
                    { brideName: { contains: search } },
                    { venue: { contains: search } },
                  ],
                },
              },
            ],
          }
        : undefined,
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        createdAt: true,
        weddingProfile: {
          select: {
            id: true,
            groomName: true,
            brideName: true,
            weddingDate: true,
            venue: true,
            totalBudget: true,
            _count: {
              select: {
                budgetItems: true,
                seserahanItems: true,
                operasionalTasks: true,
                kuaDocuments: true,
              },
            },
            digitalInvitation: {
              select: {
                slug: true,
                isPublished: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error("Admin Users Error:", error);
    res.status(500).json({
      success: false,
      message: "Gagal mengambil daftar pengguna.",
    });
  }
};

// 3. Delete User (Cascade deletion)
export const deleteUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Check target user
    const targetUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!targetUser) {
      res.status(404).json({
        success: false,
        message: "Pengguna tidak ditemukan.",
      });
      return;
    }

    // Prevent deleting own admin account
    if (req.user?.userId === id) {
      res.status(400).json({
        success: false,
        message: "Anda tidak dapat menghapus akun admin Anda sendiri.",
      });
      return;
    }

    // Delete user (cascade automatically removes profile, budget, etc.)
    await prisma.user.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: `Akun ${targetUser.email} berhasil dihapus.`,
    });
  } catch (error) {
    console.error("Admin Delete User Error:", error);
    res.status(500).json({
      success: false,
      message: "Gagal menghapus pengguna.",
    });
  }
};

// 4. Get System Settings / Feature Flags
export const getSystemSettings = async (_req: Request, res: Response): Promise<void> => {
  try {
    const settings = await prisma.systemSetting.findMany({
      orderBy: { key: "asc" },
    });

    res.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error("Admin Settings Error:", error);
    res.status(500).json({
      success: false,
      message: "Gagal mengambil pengaturan sistem.",
    });
  }
};

// 5. Update Feature Flag Value
export const updateSystemSetting = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { key } = req.params;
    const { value } = req.body;

    if (value === undefined) {
      res.status(400).json({
        success: false,
        message: "Nilai pengaturan wajib dikirim.",
      });
      return;
    }

    const updated = await prisma.systemSetting.update({
      where: { key },
      data: { value: String(value) },
    });

    res.json({
      success: true,
      message: `Pengaturan ${updated.label} berhasil diperbarui.`,
      data: updated,
    });
  } catch (error) {
    console.error("Admin Update Setting Error:", error);
    res.status(500).json({
      success: false,
      message: "Gagal memperbarui pengaturan sistem.",
    });
  }
};

// 6. Public Settings (for Frontend Checks)
export const getPublicSettings = async (_req: Request, res: Response): Promise<void> => {
  try {
    const settings = await prisma.systemSetting.findMany();
    const settingsMap: Record<string, boolean> = {};

    settings.forEach((s) => {
      settingsMap[s.key] = s.value === "true";
    });

    res.json({
      success: true,
      data: {
        digital_invitation: settingsMap["digital_invitation"] ?? true,
        user_registration: settingsMap["user_registration"] ?? true,
        system_maintenance: settingsMap["system_maintenance"] ?? false,
      },
    });
  } catch (error) {
    res.json({
      success: true,
      data: {
        digital_invitation: true,
        user_registration: true,
        system_maintenance: false,
      },
    });
  }
};
