import request from "supertest";
import { describe, expect, it } from "vitest";
import { app } from "../src/app.js";
import { registerUser } from "./helpers.js";

describe("auth", () => {
  it("register lalu /auth/me memakai cookie", async () => {
    const { agent, email } = await registerUser();
    const me = await agent.get("/api/auth/me");
    expect(me.status).toBe(200);
    expect(me.body.data.email).toBe(email.toLowerCase());
  });

  it("menolak akses tanpa login", async () => {
    const res = await request(app).get("/api/budget");
    expect(res.status).toBe(401);
  });

  it("login salah mengembalikan 401", async () => {
    const { email } = await registerUser();
    const res = await request(app).post("/api/auth/login").send({ identifier: email, password: "salah-salah" });
    expect(res.status).toBe(401);
  });

  it("ganti password mencabut sesi lain", async () => {
    const { agent: a1, email } = await registerUser();
    const a2 = request.agent(app);
    const login = await a2.post("/api/auth/login").send({ identifier: email, password: "password123" });
    expect(login.status).toBe(200);

    const change = await a1.put("/api/auth/change-password").send({
      currentPassword: "password123",
      newPassword: "passwordBaru456",
      confirmPassword: "passwordBaru456",
    });
    expect(change.status).toBe(200);

    expect((await a2.get("/api/auth/me")).status).toBe(401);
    expect((await a1.get("/api/auth/me")).status).toBe(200);
  });
});
