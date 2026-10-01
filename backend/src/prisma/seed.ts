import "dotenv/config";
import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma.js";
import { DEFAULT_KUA_DOCUMENTS } from "../constants/kuaSeed.js";
import { DEFAULT_OPERASIONAL_TASKS } from "../constants/operasionalSeed.js";
import { SESERAHAN_TEMPLATES } from "../constants/seserahanTemplates.js";

const isProduction = process.env.NODE_ENV === "production";

async function seedAdmin(): Promise<void> {
  const adminEmail = (process.env.ADMIN_EMAIL || "admin@weddingplan.id").toLowerCase();
  const providedPassword = process.env.ADMIN_PASSWORD;
  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });

  if (existing && !providedPassword) {
    console.log(`  Superadmin ${adminEmail} sudah ada, dilewati.`);
    return;
  }

  let password = providedPassword;
  if (!password) {
    if (isProduction) {
      throw new Error("ADMIN_PASSWORD wajib diisi saat seed di production.");
    }
    password = randomBytes(9).toString("base64url");
    console.log(`  ADMIN_PASSWORD tidak diisi, dibuat password acak (hanya tampil sekali): ${password}`);
  }
  if (isProduction && password.length < 12) {
    throw new Error("ADMIN_PASSWORD minimal 12 karakter di production.");
  }

  const hashed = await bcrypt.hash(password, 10);

  if (existing) {
    await prisma.user.update({
      where: { id: existing.id },
      data: { password: hashed, role: "ADMIN", tokenVersion: { increment: 1 } },
    });
    console.log(`  Password superadmin ${adminEmail} diperbarui.`);
    return;
  }

  const candidate = adminEmail.split("@")[0].replace(/[^a-z0-9_]/g, "").slice(0, 30);
  const taken = candidate ? await prisma.user.findUnique({ where: { username: candidate } }) : null;
  await prisma.user.create({
    data: { email: adminEmail, username: candidate && !taken ? candidate : null, password: hashed, role: "ADMIN" },
  });
  console.log(`  Akun Superadmin dibuat: ${adminEmail}`);
}

async function seedSystemSettings(): Promise<void> {
  const defaultSettings = [
    { key: "digital_invitation", value: "true", label: "Modul Undangan Digital" },
    { key: "user_registration", value: "true", label: "Pendaftaran User Baru" },
    { key: "system_maintenance", value: "false", label: "Mode Maintenance Sistem" },
  ];

  for (const setting of defaultSettings) {
    await prisma.systemSetting.upsert({
      where: { key: setting.key },
      create: setting,
      update: { label: setting.label },
    });
  }
  console.log("  3 Feature Flags default diinisialisasi.");
}

async function main() {
  console.log("Menyiapkan data awal Wedding Planner...");

  await seedAdmin();
  await seedSystemSettings();

  if (isProduction) {
    console.log("Production: akun demo dan data contoh dilewati.");
    return;
  }

  const demoEmail = "demo@wedding.com";
  const demoPassword = "password123";

  const existing = await prisma.user.findUnique({
    where: { email: demoEmail },
  });

  if (existing) {
    await prisma.user.delete({ where: { email: demoEmail } });
    console.log("  Membersihkan akun demo lama...");
  }

  const hashedPassword = await bcrypt.hash(demoPassword, 10);

  // Buat User Demo + Profile
  const user = await prisma.user.create({
    data: {
      email: demoEmail,
      password: hashedPassword,
      role: "USER",
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

  console.log("\nAkun demo siap (hanya development): demo@wedding.com / password123\n");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
