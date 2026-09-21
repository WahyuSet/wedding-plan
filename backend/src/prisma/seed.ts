import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma.js";
import { DEFAULT_KUA_DOCUMENTS } from "../constants/kuaSeed.js";
import { DEFAULT_OPERASIONAL_TASKS } from "../constants/operasionalSeed.js";
import { SESERAHAN_TEMPLATES } from "../constants/seserahanTemplates.js";

async function main() {
  console.log("🌱 Menyiapkan Akun Demo Wedding Planner...");

  const demoEmail = "demo@wedding.com";
  const demoPassword = "password123";

  // Hapus jika sudah ada sebelumnya agar fresh
  const existing = await prisma.user.findUnique({
    where: { email: demoEmail },
  });

  if (existing) {
    await prisma.user.delete({ where: { email: demoEmail } });
    console.log("  Membersihkan akun demo lama...");
  }

  const hashedPassword = await bcrypt.hash(demoPassword, 10);

  // Buat User + Profile
  const user = await prisma.user.create({
    data: {
      email: demoEmail,
      password: hashedPassword,
      weddingProfile: {
        create: {
          groomName: "Budi Santoso",
          brideName: "Sari Rahmawati",
          weddingDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 hari dari sekarang
          venue: "Gedung Balai Kartini, Jakarta Selatan",
          totalBudget: 150000000, // Rp 150 Juta
        },
      },
    },
    include: { weddingProfile: true },
  });

  const profileId = user.weddingProfile!.id;

  // 1. Seed Sample Budget Items
  console.log("  Mengisi contoh item anggaran...");
  await prisma.budgetItem.createMany({
    data: [
      {
        profileId,
        category: "venue",
        itemName: "Sewa Gedung Utama & Fasilitas",
        estimatedCost: 35000000,
        actualCost: 35000000,
        paymentStatus: "paid",
        isPaid: true,
        vendorName: "Balai Kartini",
        notes: "Lunas termasuk biaya kebersihan dan listrik",
      },
      {
        profileId,
        category: "katering",
        itemName: "Paket Prasmanan 500 Porsi + 5 Food Stall",
        estimatedCost: 45000000,
        actualCost: 42000000,
        paymentStatus: "dp",
        isPaid: false,
        vendorName: "Katering Berkah Rasa",
        notes: "DP 50% sudah dibayar",
      },
      {
        profileId,
        category: "dekorasi",
        itemName: "Dekorasi Pelaminan Adat Modern & Photo Booth",
        estimatedCost: 25000000,
        actualCost: 23000000,
        paymentStatus: "dp",
        isPaid: false,
        vendorName: "Sanggar Rias & Dekor Cantik",
        notes: "Tema Rustic Rose Gold",
      },
      {
        profileId,
        category: "busana",
        itemName: "Sewa Busana Akad & Resepsi Pengantin + Orang Tua",
        estimatedCost: 15000000,
        actualCost: 15000000,
        paymentStatus: "paid",
        isPaid: true,
        vendorName: "Boutique Pengantin Solo",
        notes: "Fitting kedua tgl 15 bulan depan",
      },
      {
        profileId,
        category: "dokumentasi",
        itemName: "Foto & Video Sinematik + Drone Liputan Hari-H",
        estimatedCost: 12000000,
        actualCost: 10000000,
        paymentStatus: "unpaid",
        isPaid: false,
        vendorName: "Lens Wedding Studio",
        notes: "Termasuk 1 album cetak exclusive",
      },
      {
        profileId,
        category: "undangan",
        itemName: "Undangan Digital Website + 300 Pcs Fisik Foil Emas",
        estimatedCost: 3500000,
        actualCost: 3000000,
        paymentStatus: "paid",
        isPaid: true,
        vendorName: "Creative Print Jakarta",
      },
      {
        profileId,
        category: "mas_kawin",
        itemName: "Emas Logam Mulia 10 Gram + Frame Hias",
        estimatedCost: 14000000,
        actualCost: 13500000,
        paymentStatus: "paid",
        isPaid: true,
        vendorName: "Butik Antam",
      },
    ],
  });

  // 2. Seed Seserahan Items
  console.log("  Mengisi contoh daftar seserahan...");
  await prisma.seserahanItem.createMany({
    data: SESERAHAN_TEMPLATES.slice(0, 8).map((tpl, i) => ({
      profileId,
      itemName: tpl.itemName,
      category: tpl.category,
      estimatedPrice: tpl.estimatedPrice,
      actualPrice: tpl.estimatedPrice,
      quantity: tpl.quantity,
      giver: tpl.giver,
      isPrepared: i < 5, // 5 item sudah siap
      notes: tpl.notes || null,
    })),
  });

  // 3. Seed Operasional Tasks
  console.log("  Mengisi 24 template rundown operasional...");
  await prisma.operasionalTask.createMany({
    data: DEFAULT_OPERASIONAL_TASKS.map((task, i) => ({
      profileId,
      taskName: task.taskName,
      phase: task.phase,
      scheduledTime: task.scheduledTime || null,
      assignedTo: task.assignedTo || null,
      priority: task.priority || "medium",
      isDone: i < 4, // 4 tugas awal selesai
      notes: task.notes || null,
    })),
  });

  // 4. Seed KUA Documents
  console.log("  Mengisi 30 berkas checklist KUA...");
  await prisma.kuaDocument.createMany({
    data: DEFAULT_KUA_DOCUMENTS.map((doc, i) => ({
      profileId,
      documentName: doc.documentName,
      documentCode: doc.documentCode || null,
      documentType: doc.documentType,
      fromParty: doc.fromParty,
      isCompleted: i < 6, // 6 berkas sudah lengkap
      status: i < 6 ? "completed" : i < 10 ? "in_progress" : "pending",
      notes: doc.notes || null,
    })),
  });

  console.log("\n✅ AKUN DEMO SIAP DIGUNAKAN!");
  console.log("📧 Email    : demo@wedding.com");
  console.log("🔑 Password : password123\n");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
