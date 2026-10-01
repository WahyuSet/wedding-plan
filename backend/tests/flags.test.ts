import request from "supertest";
import { afterEach, describe, expect, it } from "vitest";
import { app } from "../src/app.js";
import { createAdmin, registerUser, setFlag } from "./helpers.js";

afterEach(async () => {
  await setFlag("system_maintenance", false);
  await setFlag("digital_invitation", true);
  await setFlag("user_registration", true);
});

describe("feature flags", () => {
  it("digital_invitation off menutup modul undangan", async () => {
    const { agent } = await registerUser();
    await setFlag("digital_invitation", false);
    expect((await agent.get("/api/invitation/config")).status).toBe(403);
    expect((await request(app).get("/api/invitation/public/apa-saja")).status).toBe(403);
  });

  it("user_registration off menolak pendaftaran", async () => {
    await setFlag("user_registration", false);
    const res = await request(app).post("/api/auth/register").send({
      email: "baru@test.dev",
      password: "password123",
      groomName: "A",
      brideName: "B",
    });
    expect(res.status).toBe(403);
  });

  it("maintenance memblokir user biasa tapi admin tetap bisa", async () => {
    const user = await registerUser();
    const admin = await createAdmin();
    await setFlag("system_maintenance", true);

    expect((await user.agent.get("/api/budget")).status).toBe(503);
    expect((await request(app).get("/api/health")).status).toBe(200);
    expect((await request(app).get("/api/settings/public")).body.data.system_maintenance).toBe(true);
    expect((await admin.agent.get("/api/admin/stats")).status).toBe(200);
  });
});
