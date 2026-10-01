import request from "supertest";
import { beforeAll, describe, expect, it } from "vitest";
import { app } from "../src/app.js";

beforeAll(() => {
  process.env.ENABLE_RATE_LIMIT = "true";
});

describe("rate limit", () => {
  it("login dibatasi setelah 10 percobaan", async () => {
    let last = 0;
    for (let i = 0; i < 11; i++) {
      const res = await request(app).post("/api/auth/login").send({ identifier: "x@test.dev", password: "salah" });
      last = res.status;
    }
    expect(last).toBe(429);
  });
});
