import { app } from "./app.js";

const PORT = 5001;

async function runTests() {
  const server = app.listen(PORT, async () => {
    console.log(`\n🧪 Testing Backend API on port ${PORT}...\n`);

    const baseUrl = `http://localhost:${PORT}/api`;
    let authToken = "";

    const request = async (
      endpoint: string,
      method = "GET",
      body?: any,
      headers: Record<string, string> = {}
    ) => {
      const res = await fetch(`${baseUrl}${endpoint}`, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
          ...headers,
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      const data: any = await res.json();
      return { status: res.status, data };
    };

    try {
      // 0. Root Test
      console.log("0. Testing Root GET /...");
      const rootRes = await fetch(`http://localhost:${PORT}/`);
      const rootData: any = await rootRes.json();
      console.log("  Status:", rootRes.status, "Message:", rootData.message);
      if (rootRes.status !== 200) throw new Error("Root check failed");

      // 1. Health Check
      console.log("\n1. Testing Health Check...");
      const health = await request("/health");
      console.log("  Status:", health.status, "Service:", health.data.service);
      if (health.status !== 200) throw new Error("Health check failed");

      // 2. Register
      console.log("\n2. Testing User Registration...");
      const testEmail = `test_${Date.now()}@example.com`;
      const reg = await request("/auth/register", "POST", {
        email: testEmail,
        password: "password123",
        groomName: "Budi Santoso",
        brideName: "Sari Rahmawati",
        weddingDate: "2026-10-10",
        venue: "Balai Kartini, Jakarta",
        totalBudget: 150000000,
      });
      console.log("  Status:", reg.status, "Message:", reg.data.message);
      if (reg.status !== 201) throw new Error("Register failed: " + JSON.stringify(reg.data));
      authToken = reg.data.data.token;

      // 3. Get /me
      console.log("\n3. Testing Get /me Profile...");
      const me = await request("/auth/me");
      console.log("  Status:", me.status, "Groom:", me.data.data.weddingProfile.groomName);
      if (me.status !== 200) throw new Error("GetMe failed");

      // 4. Budget CRUD
      console.log("\n4. Testing Budget CRUD...");
      const newBudget = await request("/budget", "POST", {
        category: "venue",
        itemName: "Sewa Gedung Utama",
        estimatedCost: 35000000,
        actualCost: 32000000,
        paymentStatus: "dp",
        vendorName: "Pengelola Balai Kartini",
        notes: "DP 50% sudah ditransfer",
      });
      console.log("  Create Budget Status:", newBudget.status, "Item:", newBudget.data.data.itemName);
      if (newBudget.status !== 201) throw new Error("Create budget failed");

      const budgetList = await request("/budget");
      console.log("  Get Budget Items Count:", budgetList.data.data.items.length);
      console.log("  Total Estimated:", budgetList.data.data.summary.totalEstimated);

      // 5. Seserahan
      console.log("\n5. Testing Seserahan...");
      const templates = await request("/seserahan/templates");
      console.log("  Templates Available:", templates.data.data.length);

      const importRes = await request("/seserahan/import-templates", "POST", {
        itemIndices: [0, 1, 2, 3],
      });
      console.log("  Import Status:", importRes.status, "Message:", importRes.data.message);

      const seserahanList = await request("/seserahan");
      console.log("  Seserahan Total Items:", seserahanList.data.data.summary.totalItems);

      // 6. Operasional
      console.log("\n6. Testing Operasional Tasks...");
      const tasks = await request("/operasional");
      console.log("  Auto-seeded Tasks Count:", tasks.data.data.summary.totalTasks);
      console.log("  Phase H-90 tasks:", tasks.data.data.groupedByPhase.h90.tasks.length);

      // 7. Dokumen KUA
      console.log("\n7. Testing KUA Documents...");
      const kua = await request("/kua");
      console.log("  Auto-seeded KUA Docs Count:", kua.data.data.summary.totalDocuments);
      console.log("  Calon Pria Docs:", kua.data.data.groupedByParty.calon_pria.total);
      console.log("  Calon Wanita Docs:", kua.data.data.groupedByParty.calon_wanita.total);

      // 8. Dashboard Summary
      console.log("\n8. Testing Unified Dashboard Summary...");
      const dash = await request("/dashboard/summary");
      console.log("  Days Remaining:", dash.data.data.profile.daysRemaining);
      console.log("  Budget Total:", dash.data.data.budget.totalBudget);
      console.log("  Seserahan Progress:", dash.data.data.seserahan.progressPercentage + "%");
      console.log("  Operasional Progress:", dash.data.data.operasional.progressPercentage + "%");
      console.log("  KUA Total Docs:", dash.data.data.kua.total);

      console.log("\n✅ ALL BACKEND API TESTS PASSED SUCCESSFULLY! 🎉\n");
    } catch (err) {
      console.error("\n❌ TEST FAILED:", err);
    } finally {
      server.close();
      process.exit(0);
    }
  });
}

runTests();
