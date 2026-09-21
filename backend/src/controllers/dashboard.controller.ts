import { Response } from "express";
import { prisma } from "../lib/prisma.js";
import { AuthRequest } from "../types/index.js";

export const getDashboardSummary = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const profileId = req.user!.profileId;

    const [profile, budgetItems, seserahanItems, operasionalTasks, kuaDocs] = await Promise.all([
      prisma.weddingProfile.findUnique({
        where: { id: profileId },
      }),
      prisma.budgetItem.findMany({
        where: { profileId },
      }),
      prisma.seserahanItem.findMany({
        where: { profileId },
      }),
      prisma.operasionalTask.findMany({
        where: { profileId },
        orderBy: [{ isDone: "asc" }, { scheduledDate: "asc" }, { scheduledTime: "asc" }],
      }),
      prisma.kuaDocument.findMany({
        where: { profileId },
      }),
    ]);

    const now = new Date();

    // 1. Profile & Countdown
    let daysRemaining: number | null = null;
    let isPastWedding = false;
    if (profile?.weddingDate) {
      const diffTime = new Date(profile.weddingDate).getTime() - now.getTime();
      daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (daysRemaining < 0) isPastWedding = true;
    }

    // 2. Budget Metrics
    const totalBudget = profile?.totalBudget || 0;
    const totalEstimated = budgetItems.reduce((acc, item) => acc + (item.estimatedCost || 0), 0);
    const totalActual = budgetItems.reduce((acc, item) => acc + (item.actualCost || 0), 0);
    const totalCostCommitted = totalActual || totalEstimated || 0;

    const totalPaid = budgetItems.reduce((acc, item) => {
      if (item.paymentStatus === "paid" || item.isPaid) {
        return acc + (item.actualCost || item.estimatedCost || 0);
      }
      if (item.paymentStatus === "dp") {
        return acc + (item.amountPaid || 0);
      }
      return acc;
    }, 0);

    const totalRemainingToPay = budgetItems.reduce((acc, item) => {
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
    const budgetSpentPercentage = totalBudget > 0 ? Math.min(100, Math.round((totalActual / totalBudget) * 100)) : 0;
    const budgetPaymentPercentage =
      totalCostCommitted > 0
        ? Math.min(100, Math.round((totalPaid / totalCostCommitted) * 100))
        : budgetItems.length > 0
        ? 100
        : 0;

    // Budget category chart distribution
    const categoryTotals: Record<string, number> = {};
    budgetItems.forEach((item) => {
      categoryTotals[item.category] = (categoryTotals[item.category] || 0) + (item.actualCost || item.estimatedCost || 0);
    });
    const budgetCategoryChart = Object.entries(categoryTotals).map(([name, value]) => ({
      name,
      value,
    }));

    // 3. Seserahan Metrics
    const seserahanTotal = seserahanItems.length;
    const seserahanPrepared = seserahanItems.filter((i) => i.isPrepared).length;
    const seserahanProgress = seserahanTotal > 0 ? Math.round((seserahanPrepared / seserahanTotal) * 100) : 0;

    // 4. Operasional Metrics
    const operasionalTotal = operasionalTasks.length;
    const operasionalCompleted = operasionalTasks.filter((t) => t.isDone).length;
    const operasionalProgress = operasionalTotal > 0 ? Math.round((operasionalCompleted / operasionalTotal) * 100) : 0;
    const upcomingTasks = operasionalTasks.filter((t) => !t.isDone).slice(0, 5);

    // 5. KUA Documents Metrics
    const kuaTotal = kuaDocs.length;
    const kuaCompleted = kuaDocs.filter((d) => d.isCompleted).length;
    const kuaProgress = kuaTotal > 0 ? Math.round((kuaCompleted / kuaTotal) * 100) : 0;

    const defaultKuaDeadline = profile?.weddingDate
      ? new Date(new Date(profile.weddingDate).getTime() - 14 * 24 * 60 * 60 * 1000)
      : null;

    const urgentKuaDocs = kuaDocs.filter((doc) => {
      if (doc.isCompleted) return false;
      const deadline = doc.deadline ? new Date(doc.deadline) : defaultKuaDeadline;
      if (!deadline) return false;
      const diff = deadline.getTime() - now.getTime();
      const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
      return days <= 7;
    });

    // 6. Overall Readiness Hub (Weighted 25% each)
    const overallReadiness = Math.round(
      kuaProgress * 0.25 +
        budgetPaymentPercentage * 0.25 +
        seserahanProgress * 0.25 +
        operasionalProgress * 0.25
    );

    let statusLabel = "Tahap Awal Perencanaan";
    if (overallReadiness === 100) {
      statusLabel = "Semua Siap Menikah! 🎉";
    } else if (overallReadiness >= 75) {
      statusLabel = "Hampir Siap 100%";
    } else if (overallReadiness >= 50) {
      statusLabel = "Progres Sangat Baik";
    } else if (overallReadiness >= 25) {
      statusLabel = "Dalam Proses Persiapan";
    }

    // 7. Next Prioritized Action Recommendations
    const nextActions: Array<{
      id: string;
      module: string;
      text: string;
      link: string;
      badgeText: string;
      isUrgent: boolean;
    }> = [];

    // Prioritas 1: KUA yang mendesak
    if (urgentKuaDocs.length > 0) {
      nextActions.push({
        id: `kua-${urgentKuaDocs[0].id}`,
        module: "Dokumen KUA",
        text: `Lengkapi berkas: ${urgentKuaDocs[0].documentName}`,
        link: "/dokumen-kua",
        badgeText: "Mendesak",
        isUrgent: true,
      });
    } else {
      const incompleteKua = kuaDocs.find((d) => !d.isCompleted);
      if (incompleteKua) {
        nextActions.push({
          id: `kua-${incompleteKua.id}`,
          module: "Dokumen KUA",
          text: `Siapkan berkas: ${incompleteKua.documentName}`,
          link: "/dokumen-kua",
          badgeText: "Legalitas",
          isUrgent: false,
        });
      }
    }

    // Prioritas 2: Vendor budget yang belum lunas
    const unpaidBudgetItem = budgetItems.find((b) => b.paymentStatus !== "paid");
    if (unpaidBudgetItem) {
      nextActions.push({
        id: `budget-${unpaidBudgetItem.id}`,
        module: "Budget Planner",
        text: `Pelunasan vendor: ${unpaidBudgetItem.itemName}`,
        link: "/budget",
        badgeText: unpaidBudgetItem.paymentStatus === "dp" ? "Sisa DP" : "Pembayaran",
        isUrgent: false,
      });
    }

    // Prioritas 3: Seserahan yang belum disiapkan
    const unpreparedSeserahan = seserahanItems.find((s) => !s.isPrepared);
    if (unpreparedSeserahan) {
      nextActions.push({
        id: `seserahan-${unpreparedSeserahan.id}`,
        module: "Daftar Seserahan",
        text: `Beli / Siapkan: ${unpreparedSeserahan.itemName}`,
        link: "/seserahan",
        badgeText: "Seserahan",
        isUrgent: false,
      });
    }

    // Prioritas 4: Agenda rundown yang belum selesai
    if (upcomingTasks.length > 0) {
      nextActions.push({
        id: `op-${upcomingTasks[0].id}`,
        module: "Rundown Hari-H",
        text: `Tugas: ${upcomingTasks[0].taskName}`,
        link: "/operasional",
        badgeText: "Operasional",
        isUrgent: false,
      });
    }

    res.json({
      success: true,
      data: {
        profile: {
          id: profile?.id,
          groomName: profile?.groomName,
          brideName: profile?.brideName,
          weddingDate: profile?.weddingDate,
          venue: profile?.venue,
          daysRemaining,
          isPastWedding,
        },
        readiness: {
          overallPercentage: overallReadiness,
          statusLabel,
          scores: {
            budget: budgetPaymentPercentage,
            seserahan: seserahanProgress,
            operasional: operasionalProgress,
            kua: kuaProgress,
          },
          nextActions: nextActions.slice(0, 3),
        },
        budget: {
          totalBudget,
          totalEstimated,
          totalActual,
          totalPaid,
          totalRemainingToPay,
          remainingBudget,
          spentPercentage: budgetSpentPercentage,
          paymentPercentage: budgetPaymentPercentage,
          categoryChart: budgetCategoryChart,
          itemCount: budgetItems.length,
        },
        seserahan: {
          total: seserahanTotal,
          prepared: seserahanPrepared,
          progressPercentage: seserahanProgress,
        },
        operasional: {
          total: operasionalTotal,
          completed: operasionalCompleted,
          progressPercentage: operasionalProgress,
          upcomingTasks,
        },
        kua: {
          total: kuaTotal,
          completed: kuaCompleted,
          urgentCount: urgentKuaDocs.length,
          progressPercentage: kuaProgress,
          urgentDocs: urgentKuaDocs.slice(0, 4),
        },
      },
    });
  } catch (error) {
    console.error("GetDashboardSummary Error:", error);
    res.status(500).json({
      success: false,
      message: "Gagal memuat ringkasan dashboard.",
    });
  }
};
