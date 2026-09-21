import { Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { AuthRequest } from "../types/index.js";

export const budgetItemSchema = z.object({
  category: z.string().min(1, "Kategori wajib dipilih"),
  itemName: z.string().min(1, "Nama item wajib diisi"),
  estimatedCost: z.number().nonnegative("Biaya estimasi tidak boleh negatif").optional().default(0),
  actualCost: z.number().nonnegative("Biaya aktual tidak boleh negatif").optional().default(0),
  amountPaid: z.number().nonnegative("Nominal yang sudah dibayar tidak boleh negatif").optional().default(0),
  isPaid: z.boolean().optional().default(false),
  paymentStatus: z.enum(["unpaid", "dp", "paid"]).optional().default("unpaid"),
  vendorName: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
});

export const updateBudgetItemSchema = budgetItemSchema.partial();

export const getBudgetItems = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const profileId = req.user!.profileId;

    const [profile, items] = await Promise.all([
      prisma.weddingProfile.findUnique({
        where: { id: profileId },
        select: { totalBudget: true, groomName: true, brideName: true, weddingDate: true },
      }),
      prisma.budgetItem.findMany({
        where: { profileId },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    const totalBudget = profile?.totalBudget || 0;
    const totalEstimated = items.reduce((acc, item) => acc + (item.estimatedCost || 0), 0);
    const totalActual = items.reduce((acc, item) => acc + (item.actualCost || 0), 0);

    // Calculate accurate total paid and remaining debt/unpaid to vendors
    const totalPaid = items.reduce((acc, item) => {
      if (item.paymentStatus === "paid" || item.isPaid) {
        return acc + (item.actualCost || item.estimatedCost || 0);
      }
      if (item.paymentStatus === "dp") {
        return acc + (item.amountPaid || 0);
      }
      return acc;
    }, 0);

    const totalUnpaid = items.reduce((acc, item) => {
      const fullCost = item.actualCost || item.estimatedCost || 0;
      if (item.paymentStatus === "paid" || item.isPaid) {
        return acc;
      }
      if (item.paymentStatus === "dp") {
        return acc + Math.max(0, fullCost - (item.amountPaid || 0));
      }
      return acc + fullCost;
    }, 0);

    const remainingBudget = totalBudget - totalActual;

    // Calculate category breakdown
    const categoryMap: Record<
      string,
      { category: string; estimated: number; actual: number; count: number }
    > = {};

    items.forEach((item) => {
      if (!categoryMap[item.category]) {
        categoryMap[item.category] = {
          category: item.category,
          estimated: 0,
          actual: 0,
          count: 0,
        };
      }
      categoryMap[item.category].estimated += item.estimatedCost || 0;
      categoryMap[item.category].actual += item.actualCost || 0;
      categoryMap[item.category].count += 1;
    });

    const categoryBreakdown = Object.values(categoryMap);

    res.json({
      success: true,
      data: {
        summary: {
          totalBudget,
          totalEstimated,
          totalActual,
          totalPaid,
          totalUnpaid,
          totalRemainingToPay: totalUnpaid,
          remainingBudget,
          itemCount: items.length,
        },
        categoryBreakdown,
        items,
      },
    });
  } catch (error) {
    console.error("GetBudgetItems Error:", error);
    res.status(500).json({
      success: false,
      message: "Gagal memuat data anggaran.",
    });
  }
};

export const createBudgetItem = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const profileId = req.user!.profileId;
    const { category, itemName, estimatedCost, actualCost, amountPaid, isPaid, paymentStatus, vendorName, notes } =
      req.body;

    const finalStatus = paymentStatus || (isPaid ? "paid" : "unpaid");
    let finalAmountPaid = 0;
    if (finalStatus === "paid") {
      finalAmountPaid = actualCost || estimatedCost || 0;
    } else if (finalStatus === "dp") {
      finalAmountPaid = amountPaid || 0;
    } else {
      finalAmountPaid = 0;
    }

    const item = await prisma.budgetItem.create({
      data: {
        profileId,
        category,
        itemName,
        estimatedCost: estimatedCost || 0,
        actualCost: actualCost || 0,
        amountPaid: finalAmountPaid,
        isPaid: finalStatus === "paid",
        paymentStatus: finalStatus,
        vendorName: vendorName || null,
        notes: notes || null,
      },
    });

    res.status(201).json({
      success: true,
      message: "Item anggaran berhasil ditambahkan.",
      data: item,
    });
  } catch (error) {
    console.error("CreateBudgetItem Error:", error);
    res.status(500).json({
      success: false,
      message: "Gagal menambahkan item anggaran.",
    });
  }
};

export const updateBudgetItem = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const profileId = req.user!.profileId;
    const { id } = req.params;

    // Verify ownership
    const existing = await prisma.budgetItem.findFirst({
      where: { id, profileId },
    });

    if (!existing) {
      res.status(404).json({
        success: false,
        message: "Item anggaran tidak ditemukan.",
      });
      return;
    }

    const { category, itemName, estimatedCost, actualCost, amountPaid, isPaid, paymentStatus, vendorName, notes } =
      req.body;

    const finalStatus = paymentStatus !== undefined ? paymentStatus : existing.paymentStatus;
    const finalActual = actualCost !== undefined ? actualCost : existing.actualCost;
    const finalEst = estimatedCost !== undefined ? estimatedCost : existing.estimatedCost;

    let finalAmountPaid = existing.amountPaid;
    if (finalStatus === "paid") {
      finalAmountPaid = finalActual || finalEst || 0;
    } else if (finalStatus === "dp") {
      finalAmountPaid = amountPaid !== undefined ? amountPaid : existing.amountPaid;
    } else if (finalStatus === "unpaid") {
      finalAmountPaid = 0;
    }

    const updated = await prisma.budgetItem.update({
      where: { id },
      data: {
        ...(category !== undefined && { category }),
        ...(itemName !== undefined && { itemName }),
        ...(estimatedCost !== undefined && { estimatedCost }),
        ...(actualCost !== undefined && { actualCost }),
        amountPaid: finalAmountPaid,
        isPaid: finalStatus === "paid",
        paymentStatus: finalStatus,
        ...(vendorName !== undefined && { vendorName }),
        ...(notes !== undefined && { notes }),
      },
    });

    res.json({
      success: true,
      message: "Item anggaran berhasil diperbarui.",
      data: updated,
    });
  } catch (error) {
    console.error("UpdateBudgetItem Error:", error);
    res.status(500).json({
      success: false,
      message: "Gagal memperbarui item anggaran.",
    });
  }
};

export const deleteBudgetItem = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const profileId = req.user!.profileId;
    const { id } = req.params;

    const existing = await prisma.budgetItem.findFirst({
      where: { id, profileId },
    });

    if (!existing) {
      res.status(404).json({
        success: false,
        message: "Item anggaran tidak ditemukan.",
      });
      return;
    }

    await prisma.budgetItem.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: "Item anggaran berhasil dihapus.",
    });
  } catch (error) {
    console.error("DeleteBudgetItem Error:", error);
    res.status(500).json({
      success: false,
      message: "Gagal menghapus item anggaran.",
    });
  }
};
