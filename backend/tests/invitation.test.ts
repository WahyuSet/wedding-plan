import request from "supertest";
import { describe, expect, it } from "vitest";
import { app } from "../src/app.js";
import { createSlug } from "../src/controllers/invitation.controller.js";
import { registerUser } from "./helpers.js";

const setup = async () => {
  const user = await registerUser();
  const cfg = await user.agent.get("/api/invitation/config");
  expect(cfg.status).toBe(200);
  return { ...user, slug: cfg.body.data.slug as string };
};

describe("undangan digital", () => {
  it("undangan baru tidak dipublikasikan dan tanpa data dummy", async () => {
    const { agent, slug } = await setup();
    const cfg = await agent.get("/api/invitation/config");
    expect(cfg.body.data.isPublished).toBe(false);
    expect(JSON.parse(cfg.body.data.bankAccounts)).toEqual([]);
    expect((await request(app).get(`/api/invitation/public/${slug}`)).status).toBe(403);
  });

  it("output publik tidak membocorkan profileId", async () => {
    const { agent, slug } = await setup();
    await agent.put("/api/invitation/config").send({ isPublished: true }).expect(200);
    const res = await request(app).get(`/api/invitation/public/${slug}`);
    expect(res.status).toBe(200);
    expect(res.body.data.profileId).toBeUndefined();
    expect(Array.isArray(res.body.data.bankAccounts)).toBe(true);
    expect(res.body.data.rsvpTotal).toBe(0);
  });

  it("user lain tidak bisa menghapus RSVP/tamu milik akun lain (IDOR)", async () => {
    const a = await setup();
    const b = await registerUser();
    await b.agent.get("/api/invitation/config");

    await a.agent.put("/api/invitation/config").send({ isPublished: true }).expect(200);
    await request(app)
      .post(`/api/invitation/public/${a.slug}/rsvp`)
      .send({ guestName: "Tamu", attendanceStatus: "hadir", guestCount: 2, message: "Selamat" })
      .expect(201);
    const guest = await a.agent.post("/api/invitation/guests").send({ name: "Bpk. Test", category: "vip" });
    expect(guest.status).toBe(201);

    const pub = await request(app).get(`/api/invitation/public/${a.slug}`);
    const rsvpId = pub.body.data.rsvps[0].id as string;

    expect((await b.agent.delete(`/api/invitation/rsvps/${rsvpId}`)).status).toBe(404);
    expect((await b.agent.delete(`/api/invitation/guests/${guest.body.data.id}`)).status).toBe(404);

    expect((await a.agent.delete(`/api/invitation/rsvps/${rsvpId}`)).status).toBe(200);
    expect((await a.agent.delete(`/api/invitation/guests/${guest.body.data.id}`)).status).toBe(200);
  });

  it("menolak konfigurasi tidak valid", async () => {
    const { agent } = await setup();
    const put = (body: object) => agent.put("/api/invitation/config").send(body);
    expect((await put({ akadMapUrl: "javascript:alert(1)" })).status).toBe(400);
    expect((await put({ theme: "tema-palsu" })).status).toBe(400);
    expect((await put({ akadStartTime: "8 pagi" })).status).toBe(400);
    expect((await put({ slug: "admin" })).status).toBe(400);
    expect((await put({ galleryPhotos: [{ url: "ftp://x/y.jpg" }] })).status).toBe(400);
    expect((await put({ akadMapUrl: "https://maps.app.goo.gl/abc", akadEndTime: "Selesai" })).status).toBe(200);
  });

  it("validasi RSVP publik", async () => {
    const { agent, slug } = await setup();
    await agent.put("/api/invitation/config").send({ isPublished: true }).expect(200);
    const post = (body: object) => request(app).post(`/api/invitation/public/${slug}/rsvp`).send(body);
    expect((await post({ guestName: "" })).status).toBe(400);
    expect((await post({ guestName: "A", guestCount: 999 })).status).toBe(400);
    expect((await post({ guestName: "A", attendanceStatus: "mungkin" })).status).toBe(400);
    expect((await post({ guestName: "A", message: "x".repeat(501) })).status).toBe(400);
    expect((await post({ guestName: "A" })).status).toBe(201);
  });

  it("slug kustom: simbol & menjadi tanda hubung, kata tercadang ditolak", async () => {
    const { agent } = await setup();
    const put = (slug: string) => agent.put("/api/invitation/config").send({ slug });
    const initials = `R&J ${Date.now().toString(36)}`;

    const res = await put(initials);
    expect(res.status).toBe(200);
    expect(res.body.data.slug).toBe(`r-j-${initials.slice(4)}`);

    expect(createSlug("R&J")).toBe("r-j");
    expect(createSlug("André & Zoë")).toBe("andre-zoe");
    expect((await put("rj")).status).toBe(400);
    expect((await put("assets")).status).toBe(400);
    expect((await put("Invitation")).status).toBe(400);
  });

  it("slug bawaan mengandung suffix acak", async () => {
    const { slug } = await setup();
    expect(slug).toMatch(/^budi-santoso-sari-rahmawati-[0-9a-f]{4}$/);
  });
});
