import request from "supertest";
import sharp from "sharp";
import { describe, expect, it } from "vitest";
import { app } from "../src/app.js";
import { registerUser } from "./helpers.js";

const makePng = () =>
  sharp({ create: { width: 3000, height: 2000, channels: 3, background: "#cc3355" } })
    .png()
    .toBuffer();

const fakeMp3 = () => Buffer.concat([Buffer.from("ID3"), Buffer.alloc(2000, 1)]);

const pathOf = (url: string): string => new URL(url).pathname;

describe("upload foto & musik", () => {
  it("menolak tanpa login", async () => {
    const res = await request(app).post("/api/invitation/uploads").attach("file", await makePng(), "a.png");
    expect(res.status).toBe(401);
  });

  it("foto diubah ke webp maks 1920px dan bisa diakses lewat /uploads", async () => {
    const { agent } = await registerUser();
    const res = await agent.post("/api/invitation/uploads").attach("file", await makePng(), "foto.png");
    expect(res.status).toBe(201);
    expect(res.body.data.kind).toBe("image");
    expect(res.body.data.url).toMatch(/\/uploads\/.+\.webp$/);

    const served = await request(app).get(pathOf(res.body.data.url));
    expect(served.status).toBe(200);
    expect(served.headers["content-type"]).toContain("image/webp");
    const meta = await sharp(served.body as Buffer).metadata();
    expect(meta.width).toBe(1920);
  });

  it("menerima mp3 dan menyajikannya apa adanya", async () => {
    const { agent } = await registerUser();
    const res = await agent.post("/api/invitation/uploads").attach("file", fakeMp3(), "lagu.mp3");
    expect(res.status).toBe(201);
    expect(res.body.data.kind).toBe("audio");
    const served = await request(app).get(pathOf(res.body.data.url));
    expect(served.status).toBe(200);
  });

  it("menolak file yang isinya bukan gambar/mp3 meski berekstensi .png", async () => {
    const { agent } = await registerUser();
    const res = await agent
      .post("/api/invitation/uploads")
      .attach("file", Buffer.from("<script>alert(1)</script>".repeat(10)), "palsu.png");
    expect(res.status).toBe(400);
  });

  it("menolak foto lebih dari 5 MB", async () => {
    const { agent } = await registerUser();
    const big = Buffer.concat([Buffer.from([0xff, 0xd8, 0xff, 0xe0]), Buffer.alloc(6 * 1024 * 1024, 7)]);
    const res = await agent.post("/api/invitation/uploads").attach("file", big, "besar.jpg");
    expect(res.status).toBe(413);
  });

  it("hapus file hanya untuk pemilik dan file hilang dari /uploads", async () => {
    const a = await registerUser();
    const b = await registerUser();
    const up = await a.agent.post("/api/invitation/uploads").attach("file", await makePng(), "x.png");
    const id = up.body.data.id as string;

    expect((await b.agent.delete(`/api/invitation/uploads/${id}`)).status).toBe(404);

    const list = await a.agent.get("/api/invitation/uploads");
    expect(list.body.data.assets).toHaveLength(1);
    expect(list.body.data.usage.count).toBe(1);

    expect((await a.agent.delete(`/api/invitation/uploads/${id}`)).status).toBe(200);
    expect((await request(app).get(pathOf(up.body.data.url))).status).toBe(404);
  });

  it("konfigurasi menerima URL hasil upload sebagai foto sampul", async () => {
    const { agent } = await registerUser();
    await agent.get("/api/invitation/config");
    const up = await agent.post("/api/invitation/uploads").attach("file", await makePng(), "c.png");
    const put = await agent.put("/api/invitation/config").send({ coverPhotoUrl: up.body.data.url });
    expect(put.status).toBe(200);
    expect(put.body.data.coverPhotoUrl).toBe(up.body.data.url);
  });
});
