import bcrypt from "bcryptjs";
import request from "supertest";
import { app } from "../src/app.js";
import { prisma } from "../src/lib/prisma.js";
import { invalidateFlagCache } from "../src/middleware/flags.middleware.js";

let counter = 0;

export const uniqueEmail = (prefix = "user"): string => `${prefix}${Date.now()}${counter++}@test.dev`;

export const registerUser = async (email = uniqueEmail()) => {
  const agent = request.agent(app);
  const res = await agent.post("/api/auth/register").send({
    email,
    password: "password123",
    groomName: "Budi Santoso",
    brideName: "Sari Rahmawati",
    weddingDate: "2026-12-20",
    venue: "Gedung Test",
    totalBudget: 1000000,
  });
  if (res.status !== 201) throw new Error(`register gagal: ${res.status} ${JSON.stringify(res.body)}`);
  return { agent, email, password: "password123", userId: res.body.data.user.id as string };
};

export const createAdmin = async () => {
  const email = uniqueEmail("admin");
  await prisma.user.create({
    data: { email, password: await bcrypt.hash("adminpass123", 10), role: "ADMIN" },
  });
  const agent = request.agent(app);
  const res = await agent.post("/api/auth/login").send({ identifier: email, password: "adminpass123" });
  if (res.status !== 200) throw new Error(`login admin gagal: ${res.status}`);
  return { agent, email };
};

export const setFlag = async (key: string, value: boolean) => {
  await prisma.systemSetting.upsert({
    where: { key },
    create: { key, value: String(value), label: key },
    update: { value: String(value) },
  });
  invalidateFlagCache();
};
