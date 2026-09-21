import { prisma } from "./lib/prisma.js";

async function main() {
  const users = await prisma.user.findMany({
    include: {
      weddingProfile: true,
    },
    orderBy: { createdAt: "asc" },
  });

  console.log("\n📋 DAFTAR AKUN TERDAFTAR DI DATABASE:\n");
  users.forEach((u, i) => {
    console.log(`[Akun ${i + 1}]`);
    console.log(`- Email         : ${u.email}`);
    console.log(`- Username      : ${u.username ? `@${u.username}` : "(belum diatur)"}`);
    console.log(`- Pengantin Pria: ${u.weddingProfile?.groomName || "-"}`);
    console.log(`- Pengantin Wnt : ${u.weddingProfile?.brideName || "-"}`);
    console.log(`- Tgl Nikah     : ${u.weddingProfile?.weddingDate ? new Date(u.weddingProfile.weddingDate).toLocaleDateString("id-ID") : "-"}`);
    console.log(`- Target Budget : Rp ${(u.weddingProfile?.totalBudget || 0).toLocaleString("id-ID")}`);
    console.log(`- Dibuat Pada   : ${new Date(u.createdAt).toLocaleString("id-ID")}`);
    console.log("-----------------------------------------");
  });
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
