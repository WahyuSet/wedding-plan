import { Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { AuthRequest } from "../types/index.js";
import { DEFAULT_OPERASIONAL_TASKS } from "../constants/operasionalSeed.js";

export const operasionalTaskSchema = z.object({
  taskName: z.string().min(1, "Nama tugas wajib diisi"),
  phase: z.enum(["h90", "h30", "h7", "hariH", "pascaNikah"], {
    errorMap: () => ({ message: "Fase harus salah satu dari: h90, h30, h7, hariH, pascaNikah" }),
  }),
  scheduledTime: z.string().nullable().optional(),
  scheduledDate: z.string().nullable().optional(),
  assignedTo: z.string().nullable().optional(),
  priority: z.enum(["low", "medium", "high"]).optional().default("medium"),
  isDone: z.boolean().optional().default(false),
  notes: z.string().nullable().optional(),
});

export const updateOperasionalTaskSchema = operasionalTaskSchema.partial();

export const getOperasionalTasks = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const profileId = req.user!.profileId;

    const tasks = await prisma.operasionalTask.findMany({
      where: { profileId },
      orderBy: [{ isDone: "asc" }, { scheduledTime: "asc" }, { createdAt: "asc" }],
    });

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.isDone).length;
    const pendingTasks = totalTasks - completedTasks;
    const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Grouping by phase
    const phases = ["h90", "h30", "h7", "hariH", "pascaNikah"] as const;
    const phaseNames: Record<string, string> = {
      h90: "Persiapan Awal (H-90 s/d H-31)",
      h30: "Persiapan Intensif (H-30 s/d H-8)",
      h7: "Final Countdown (H-7 s/d H-1)",
      hariH: "Hari-H Rundown & Operasional",
      pascaNikah: "Pasca Pernikahan",
    };

    const groupedByPhase = phases.reduce((acc, phaseKey) => {
      const phaseTasks = tasks.filter((t) => t.phase === phaseKey);
      const phaseCompleted = phaseTasks.filter((t) => t.isDone).length;
      acc[phaseKey] = {
        phaseKey,
        phaseName: phaseNames[phaseKey],
        total: phaseTasks.length,
        completed: phaseCompleted,
        progress: phaseTasks.length > 0 ? Math.round((phaseCompleted / phaseTasks.length) * 100) : 0,
        tasks: phaseTasks,
      };
      return acc;
    }, {} as Record<string, any>);

    res.json({
      success: true,
      data: {
        summary: {
          totalTasks,
          completedTasks,
          pendingTasks,
          progressPercentage,
        },
        groupedByPhase,
        tasks,
      },
    });
  } catch (error) {
    console.error("GetOperasionalTasks Error:", error);
    res.status(500).json({
      success: false,
      message: "Gagal memuat tugas operasional.",
    });
  }
};

export const createOperasionalTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const profileId = req.user!.profileId;
    const { taskName, phase, scheduledTime, scheduledDate, assignedTo, priority, isDone, notes } =
      req.body;

    const task = await prisma.operasionalTask.create({
      data: {
        profileId,
        taskName,
        phase,
        scheduledTime: scheduledTime || null,
        scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
        assignedTo: assignedTo || null,
        priority: priority || "medium",
        isDone: isDone || false,
        notes: notes || null,
      },
    });

    res.status(201).json({
      success: true,
      message: "Tugas operasional berhasil ditambahkan.",
      data: task,
    });
  } catch (error) {
    console.error("CreateOperasionalTask Error:", error);
    res.status(500).json({
      success: false,
      message: "Gagal menambahkan tugas operasional.",
    });
  }
};

export const updateOperasionalTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const profileId = req.user!.profileId;
    const { id } = req.params;

    const existing = await prisma.operasionalTask.findFirst({
      where: { id, profileId },
    });

    if (!existing) {
      res.status(404).json({
        success: false,
        message: "Tugas operasional tidak ditemukan.",
      });
      return;
    }

    const { taskName, phase, scheduledTime, scheduledDate, assignedTo, priority, isDone, notes } =
      req.body;

    const updated = await prisma.operasionalTask.update({
      where: { id },
      data: {
        ...(taskName !== undefined && { taskName }),
        ...(phase !== undefined && { phase }),
        ...(scheduledTime !== undefined && { scheduledTime }),
        ...(scheduledDate !== undefined && {
          scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
        }),
        ...(assignedTo !== undefined && { assignedTo }),
        ...(priority !== undefined && { priority }),
        ...(isDone !== undefined && { isDone }),
        ...(notes !== undefined && { notes }),
      },
    });

    res.json({
      success: true,
      message: "Tugas operasional berhasil diperbarui.",
      data: updated,
    });
  } catch (error) {
    console.error("UpdateOperasionalTask Error:", error);
    res.status(500).json({
      success: false,
      message: "Gagal memperbarui tugas operasional.",
    });
  }
};

export const deleteOperasionalTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const profileId = req.user!.profileId;
    const { id } = req.params;

    const existing = await prisma.operasionalTask.findFirst({
      where: { id, profileId },
    });

    if (!existing) {
      res.status(404).json({
        success: false,
        message: "Tugas operasional tidak ditemukan.",
      });
      return;
    }

    await prisma.operasionalTask.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: "Tugas operasional berhasil dihapus.",
    });
  } catch (error) {
    console.error("DeleteOperasionalTask Error:", error);
    res.status(500).json({
      success: false,
      message: "Gagal menghapus tugas operasional.",
    });
  }
};

export const resetOperasionalTasks = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const profileId = req.user!.profileId;

    // Delete existing tasks
    await prisma.operasionalTask.deleteMany({
      where: { profileId },
    });

    // Re-seed default tasks
    await prisma.operasionalTask.createMany({
      data: DEFAULT_OPERASIONAL_TASKS.map((task) => ({
        profileId,
        taskName: task.taskName,
        phase: task.phase,
        scheduledTime: task.scheduledTime || null,
        assignedTo: task.assignedTo || null,
        priority: task.priority || "medium",
        notes: task.notes || null,
        isDone: false,
      })),
    });

    res.json({
      success: true,
      message: "Tugas operasional berhasil di-reset ke template standar.",
    });
  } catch (error) {
    console.error("ResetOperasionalTasks Error:", error);
    res.status(500).json({
      success: false,
      message: "Gagal me-reset tugas operasional.",
    });
  }
};
