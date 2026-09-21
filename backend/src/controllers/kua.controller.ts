import { Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { AuthRequest } from "../types/index.js";
import { DEFAULT_KUA_DOCUMENTS } from "../constants/kuaSeed.js";

export const kuaDocumentSchema = z.object({
  documentName: z.string().min(1, "Nama dokumen wajib diisi"),
  documentCode: z.string().nullable().optional(),
  documentType: z.string().optional().default("persyaratan"),
  fromParty: z.enum(["calon_pria", "calon_wanita", "wali", "kua"], {
    errorMap: () => ({ message: "Pihak harus salah satu dari: calon_pria, calon_wanita, wali, kua" }),
  }),
  deadline: z.string().nullable().optional(),
  isCompleted: z.boolean().optional().default(false),
  status: z.enum(["pending", "in_progress", "completed"]).optional().default("pending"),
  reminderEnabled: z.boolean().optional().default(true),
  notes: z.string().nullable().optional(),
});

export const updateKuaDocumentSchema = kuaDocumentSchema.partial();

export const getKuaDocuments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const profileId = req.user!.profileId;

    const [profile, documents] = await Promise.all([
      prisma.weddingProfile.findUnique({
        where: { id: profileId },
        select: { weddingDate: true },
      }),
      prisma.kuaDocument.findMany({
        where: { profileId },
        orderBy: [{ isCompleted: "asc" }, { fromParty: "asc" }, { createdAt: "asc" }],
      }),
    ]);

    const now = new Date();
    const weddingDate = profile?.weddingDate ? new Date(profile.weddingDate) : null;

    // Calculate default recommended KUA deadline (H-10 workdays / ~14 calendar days before wedding)
    const defaultKuaDeadline = weddingDate
      ? new Date(weddingDate.getTime() - 14 * 24 * 60 * 60 * 1000)
      : null;

    // Enhance documents with deadline alerts
    const enhancedDocs = documents.map((doc) => {
      const docDeadline = doc.deadline ? new Date(doc.deadline) : defaultKuaDeadline;
      let isOverdue = false;
      let isNearDeadline = false;
      let daysRemaining: number | null = null;

      if (docDeadline && !doc.isCompleted) {
        const diffTime = docDeadline.getTime() - now.getTime();
        daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (daysRemaining < 0) {
          isOverdue = true;
        } else if (daysRemaining <= 7) {
          isNearDeadline = true;
        }
      }

      return {
        ...doc,
        effectiveDeadline: docDeadline,
        daysRemaining,
        isOverdue,
        isNearDeadline,
      };
    });

    const totalDocuments = enhancedDocs.length;
    const completedCount = enhancedDocs.filter((d) => d.isCompleted).length;
    const inProgressCount = enhancedDocs.filter((d) => d.status === "in_progress" && !d.isCompleted).length;
    const pendingCount = totalDocuments - completedCount - inProgressCount;
    const urgentCount = enhancedDocs.filter((d) => (d.isOverdue || d.isNearDeadline) && !d.isCompleted).length;
    const progressPercentage = totalDocuments > 0 ? Math.round((completedCount / totalDocuments) * 100) : 0;

    // Grouping by party
    const parties = ["calon_pria", "calon_wanita", "wali", "kua"] as const;
    const partyLabels: Record<string, string> = {
      calon_pria: "Mempelai Pria",
      calon_wanita: "Mempelai Wanita",
      wali: "Wali Nikah",
      kua: "Administrasi KUA",
    };

    const groupedByParty = parties.reduce((acc, partyKey) => {
      const partyDocs = enhancedDocs.filter((d) => d.fromParty === partyKey);
      const partyCompleted = partyDocs.filter((d) => d.isCompleted).length;
      acc[partyKey] = {
        partyKey,
        partyLabel: partyLabels[partyKey],
        total: partyDocs.length,
        completed: partyCompleted,
        progress: partyDocs.length > 0 ? Math.round((partyCompleted / partyDocs.length) * 100) : 0,
        documents: partyDocs,
      };
      return acc;
    }, {} as Record<string, any>);

    res.json({
      success: true,
      data: {
        summary: {
          totalDocuments,
          completedCount,
          inProgressCount,
          pendingCount,
          urgentCount,
          progressPercentage,
          weddingDate,
          defaultKuaDeadline,
        },
        groupedByParty,
        documents: enhancedDocs,
      },
    });
  } catch (error) {
    console.error("GetKuaDocuments Error:", error);
    res.status(500).json({
      success: false,
      message: "Gagal memuat dokumen KUA.",
    });
  }
};

export const createKuaDocument = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const profileId = req.user!.profileId;
    const { documentName, documentCode, documentType, fromParty, deadline, isCompleted, status, notes } =
      req.body;

    const doc = await prisma.kuaDocument.create({
      data: {
        profileId,
        documentName,
        documentCode: documentCode || null,
        documentType: documentType || "persyaratan",
        fromParty,
        deadline: deadline ? new Date(deadline) : null,
        isCompleted: isCompleted || status === "completed",
        status: status || (isCompleted ? "completed" : "pending"),
        notes: notes || null,
      },
    });

    res.status(201).json({
      success: true,
      message: "Dokumen KUA berhasil ditambahkan.",
      data: doc,
    });
  } catch (error) {
    console.error("CreateKuaDocument Error:", error);
    res.status(500).json({
      success: false,
      message: "Gagal menambahkan dokumen KUA.",
    });
  }
};

export const updateKuaDocument = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const profileId = req.user!.profileId;
    const { id } = req.params;

    const existing = await prisma.kuaDocument.findFirst({
      where: { id, profileId },
    });

    if (!existing) {
      res.status(404).json({
        success: false,
        message: "Dokumen KUA tidak ditemukan.",
      });
      return;
    }

    const {
      documentName,
      documentCode,
      documentType,
      fromParty,
      deadline,
      isCompleted,
      status,
      reminderEnabled,
      notes,
    } = req.body;

    // Synchronize isCompleted and status
    let finalIsCompleted = isCompleted;
    let finalStatus = status;

    if (isCompleted !== undefined && status === undefined) {
      finalStatus = isCompleted ? "completed" : "pending";
    } else if (status !== undefined && isCompleted === undefined) {
      finalIsCompleted = status === "completed";
    }

    const updated = await prisma.kuaDocument.update({
      where: { id },
      data: {
        ...(documentName !== undefined && { documentName }),
        ...(documentCode !== undefined && { documentCode }),
        ...(documentType !== undefined && { documentType }),
        ...(fromParty !== undefined && { fromParty }),
        ...(deadline !== undefined && { deadline: deadline ? new Date(deadline) : null }),
        ...(finalIsCompleted !== undefined && { isCompleted: finalIsCompleted }),
        ...(finalStatus !== undefined && { status: finalStatus }),
        ...(reminderEnabled !== undefined && { reminderEnabled }),
        ...(notes !== undefined && { notes }),
      },
    });

    res.json({
      success: true,
      message: "Status dokumen KUA berhasil diperbarui.",
      data: updated,
    });
  } catch (error) {
    console.error("UpdateKuaDocument Error:", error);
    res.status(500).json({
      success: false,
      message: "Gagal memperbarui dokumen KUA.",
    });
  }
};

export const deleteKuaDocument = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const profileId = req.user!.profileId;
    const { id } = req.params;

    const existing = await prisma.kuaDocument.findFirst({
      where: { id, profileId },
    });

    if (!existing) {
      res.status(404).json({
        success: false,
        message: "Dokumen KUA tidak ditemukan.",
      });
      return;
    }

    await prisma.kuaDocument.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: "Dokumen KUA berhasil dihapus.",
    });
  } catch (error) {
    console.error("DeleteKuaDocument Error:", error);
    res.status(500).json({
      success: false,
      message: "Gagal menghapus dokumen KUA.",
    });
  }
};

export const resetKuaDocuments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const profileId = req.user!.profileId;

    await prisma.kuaDocument.deleteMany({
      where: { profileId },
    });

    await prisma.kuaDocument.createMany({
      data: DEFAULT_KUA_DOCUMENTS.map((doc) => ({
        profileId,
        documentName: doc.documentName,
        documentCode: doc.documentCode || null,
        documentType: doc.documentType,
        fromParty: doc.fromParty,
        notes: doc.notes || null,
        isCompleted: false,
        status: "pending",
      })),
    });

    res.json({
      success: true,
      message: "Daftar dokumen KUA berhasil di-reset ke 31 dokumen standar.",
    });
  } catch (error) {
    console.error("ResetKuaDocuments Error:", error);
    res.status(500).json({
      success: false,
      message: "Gagal me-reset dokumen KUA.",
    });
  }
};
