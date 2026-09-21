import { Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { AuthRequest } from "../types/index.js";
import { SESERAHAN_TEMPLATES } from "../constants/seserahanTemplates.js";

export const seserahanItemSchema = z.object({
  itemName: z.string().min(1, "Nama item seserahan wajib diisi"),
  category: z.string().optional().default("lainnya"),
  estimatedPrice: z.number().nonnegative("Estimasi harga tidak boleh negatif").optional().default(0),
  actualPrice: z.number().nonnegative("Harga aktual tidak boleh negatif").optional().default(0),
  quantity: z.number().int().positive("Jumlah minimal 1").optional().default(1),
  isPrepared: z.boolean().optional().default(false),
  giver: z.enum(["groom", "bride"]).optional().default("groom"),
  brand: z.string().nullable().optional(),
  link: z.string().url("Format URL tidak valid (harus diawali https://)").nullable().optional().or(z.literal("")),
  notes: z.string().nullable().optional(),
});

export const updateSeserahanItemSchema = seserahanItemSchema.partial();

export const importTemplatesSchema = z.object({
  itemIndices: z.array(z.number().int().min(0)).min(1, "Pilih minimal 1 template item"),
});

export const getSeserahanItems = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const profileId = req.user!.profileId;

    const items = await prisma.seserahanItem.findMany({
      where: { profileId },
      orderBy: [{ isPrepared: "asc" }, { createdAt: "desc" }],
    });

    const totalItems = items.length;
    const preparedCount = items.filter((i) => i.isPrepared).length;
    const remainingCount = totalItems - preparedCount;
    const totalEstimatedPrice = items.reduce((acc, i) => acc + (i.estimatedPrice || 0) * (i.quantity || 1), 0);
    const totalActualPrice = items.reduce((acc, i) => acc + (i.actualPrice || 0) * (i.quantity || 1), 0);
    const progressPercentage = totalItems > 0 ? Math.round((preparedCount / totalItems) * 100) : 0;

    // Breakdown per category
    const categoryCount: Record<string, { total: number; prepared: number }> = {};
    items.forEach((item) => {
      if (!categoryCount[item.category]) {
        categoryCount[item.category] = { total: 0, prepared: 0 };
      }
      categoryCount[item.category].total += 1;
      if (item.isPrepared) categoryCount[item.category].prepared += 1;
    });

    res.json({
      success: true,
      data: {
        summary: {
          totalItems,
          preparedCount,
          remainingCount,
          totalEstimatedPrice,
          totalActualPrice,
          progressPercentage,
        },
        categoryBreakdown: categoryCount,
        items,
      },
    });
  } catch (error) {
    console.error("GetSeserahanItems Error:", error);
    res.status(500).json({
      success: false,
      message: "Gagal memuat data seserahan.",
    });
  }
};

export const getSeserahanTemplates = async (_req: AuthRequest, res: Response): Promise<void> => {
  res.json({
    success: true,
    data: SESERAHAN_TEMPLATES,
  });
};

export const importSeserahanTemplates = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const profileId = req.user!.profileId;
    const { itemIndices } = req.body;

    const selectedTemplates = itemIndices
      .map((idx: number) => SESERAHAN_TEMPLATES[idx])
      .filter(Boolean);

    if (selectedTemplates.length === 0) {
      res.status(400).json({
        success: false,
        message: "Template yang dipilih tidak valid.",
      });
      return;
    }

    await prisma.seserahanItem.createMany({
      data: selectedTemplates.map((template: typeof SESERAHAN_TEMPLATES[0]) => ({
        profileId,
        itemName: template.itemName,
        category: template.category,
        estimatedPrice: template.estimatedPrice,
        actualPrice: template.estimatedPrice,
        quantity: template.quantity,
        giver: template.giver,
        notes: template.notes || null,
        isPrepared: false,
      })),
    });

    res.status(201).json({
      success: true,
      message: `${selectedTemplates.length} item seserahan berhasil ditambahkan dari template.`,
    });
  } catch (error) {
    console.error("ImportSeserahanTemplates Error:", error);
    res.status(500).json({
      success: false,
      message: "Gagal mengimpor template seserahan.",
    });
  }
};

export const createSeserahanItem = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const profileId = req.user!.profileId;
    const { itemName, category, estimatedPrice, actualPrice, quantity, isPrepared, giver, brand, link, notes } =
      req.body;

    const item = await prisma.seserahanItem.create({
      data: {
        profileId,
        itemName,
        category: category || "lainnya",
        estimatedPrice: estimatedPrice || 0,
        actualPrice: actualPrice || 0,
        quantity: quantity || 1,
        isPrepared: isPrepared || false,
        giver: giver || "groom",
        brand: brand || null,
        link: link || null,
        notes: notes || null,
      },
    });

    res.status(201).json({
      success: true,
      message: "Item seserahan berhasil ditambahkan.",
      data: item,
    });
  } catch (error) {
    console.error("CreateSeserahanItem Error:", error);
    res.status(500).json({
      success: false,
      message: "Gagal menambahkan item seserahan.",
    });
  }
};

export const updateSeserahanItem = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const profileId = req.user!.profileId;
    const { id } = req.params;

    const existing = await prisma.seserahanItem.findFirst({
      where: { id, profileId },
    });

    if (!existing) {
      res.status(404).json({
        success: false,
        message: "Item seserahan tidak ditemukan.",
      });
      return;
    }

    const { itemName, category, estimatedPrice, actualPrice, quantity, isPrepared, giver, brand, link, notes } =
      req.body;

    const updated = await prisma.seserahanItem.update({
      where: { id },
      data: {
        ...(itemName !== undefined && { itemName }),
        ...(category !== undefined && { category }),
        ...(estimatedPrice !== undefined && { estimatedPrice }),
        ...(actualPrice !== undefined && { actualPrice }),
        ...(quantity !== undefined && { quantity }),
        ...(isPrepared !== undefined && { isPrepared }),
        ...(giver !== undefined && { giver }),
        ...(brand !== undefined && { brand: brand || null }),
        ...(link !== undefined && { link: link || null }),
        ...(notes !== undefined && { notes }),
      },
    });

    res.json({
      success: true,
      message: "Item seserahan berhasil diperbarui.",
      data: updated,
    });
  } catch (error) {
    console.error("UpdateSeserahanItem Error:", error);
    res.status(500).json({
      success: false,
      message: "Gagal memperbarui item seserahan.",
    });
  }
};

export const deleteSeserahanItem = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const profileId = req.user!.profileId;
    const { id } = req.params;

    const existing = await prisma.seserahanItem.findFirst({
      where: { id, profileId },
    });

    if (!existing) {
      res.status(404).json({
        success: false,
        message: "Item seserahan tidak ditemukan.",
      });
      return;
    }

    await prisma.seserahanItem.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: "Item seserahan berhasil dihapus.",
    });
  } catch (error) {
    console.error("DeleteSeserahanItem Error:", error);
    res.status(500).json({
      success: false,
      message: "Gagal menghapus item seserahan.",
    });
  }
};
