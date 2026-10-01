import request from "supertest";
import { describe, expect, it } from "vitest";
import { app } from "../src/app.js";
import { prisma } from "../src/lib/prisma.js";
import { registerUser } from "./helpers.js";

const setup = async () => {
  const user = await registerUser();
  const cfg = await user.agent.get("/api/invitation/config");
  await user.agent.put("/api/invitation/config").send({ isPublished: true }).expect(200);
  return { ...user, slug: cfg.body.data.slug as string };
};

describe("manajemen tamu", () => {
  it("tambah massal memberi kode unik tiap tamu", async () => {
    const { agent } = await setup();
    const res = await agent.post("/api/invitation/guests/bulk").send({
      guests: [
        { name: "Bpk. Andi", category: "keluarga", phone: "0812-3456-789" },
        { name: "Ibu Rina", category: "sahabat" },
      ],
    });
    expect(res.status).toBe(201);
    const codes = res.body.data.map((g: { code: string }) => g.code);
    expect(new Set(codes).size).toBe(2);
    expect(codes.every((c: string) => /^[a-hjkmnp-z2-9]{6}$/.test(c))).toBe(true);
  });

  it("menolak bulk kosong atau nomor telepon tidak valid", async () => {
    const { agent } = await setup();
    expect((await agent.post("/api/invitation/guests/bulk").send({ guests: [] })).status).toBe(400);
    expect(
      (await agent.post("/api/invitation/guests/bulk").send({ guests: [{ name: "A", phone: "abc" }] })).status
    ).toBe(400);
  });

  it("kode tamu menghasilkan nama di endpoint publik", async () => {
    const { agent, slug } = await setup();
    const guest = await agent.post("/api/invitation/guests").send({ name: "Bpk. Bambang", category: "vip" });
    const code = guest.body.data.code as string;

    const res = await request(app).get(`/api/invitation/public/${slug}/guests/${code}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({ name: "Bpk. Bambang", category: "vip", hasRsvp: false });
    expect((await request(app).get(`/api/invitation/public/${slug}/guests/kode-palsu`)).status).toBe(404);
  });

  it("segmen nama-kode: kode menentukan tamu, nama hanya hiasan", async () => {
    const { agent, slug } = await setup();
    const guest = await agent.post("/api/invitation/guests").send({ name: "Joko Widodo" });
    const code = guest.body.data.code as string;
    const get = (key: string) => request(app).get(`/api/invitation/public/${slug}/guests/${key}`);

    const canonical = await get(`joko-widodo-${code}`);
    expect(canonical.status).toBe(200);
    expect(canonical.body.data).toMatchObject({ name: "Joko Widodo", key: `joko-widodo-${code}` });

    // Nama di URL salah atau hanya kode: tetap tamu yang sama, dengan bentuk kanonik untuk dirapikan.
    expect((await get(`prabowo-${code}`)).body.data).toMatchObject({ name: "Joko Widodo", key: `joko-widodo-${code}` });
    expect((await get(code)).body.data.key).toBe(`joko-widodo-${code}`);

    expect((await get("joko-widodo-zzzzzz")).status).toBe(404);
    expect((await get("joko-widodo")).status).toBe(404);
  });

  it("kode lama yang mengandung tanda hubung tetap dikenali", async () => {
    const { agent, slug } = await setup();
    const guest = await agent.post("/api/invitation/guests").send({ name: "Ibu Sri" });
    const legacyCode = `aB-${Date.now().toString(36)}_x`;
    await prisma.invitationGuest.update({ where: { id: guest.body.data.id }, data: { code: legacyCode } });

    const bare = await request(app).get(`/api/invitation/public/${slug}/guests/${legacyCode}`);
    expect(bare.body.data).toMatchObject({ name: "Ibu Sri", key: `ibu-sri-${legacyCode}` });
    const withName = await request(app).get(`/api/invitation/public/${slug}/guests/ibu-sri-${legacyCode}`);
    expect(withName.body.data.name).toBe("Ibu Sri");
  });

  it("tamu undangan lain tidak bisa dibuka lewat slug berbeda", async () => {
    const a = await setup();
    const b = await setup();
    const guest = await a.agent.post("/api/invitation/guests").send({ name: "Bpk. Eko" });
    const key = `bpk-eko-${guest.body.data.code}`;

    expect((await request(app).get(`/api/invitation/public/${a.slug}/guests/${key}`)).status).toBe(200);
    expect((await request(app).get(`/api/invitation/public/${b.slug}/guests/${key}`)).status).toBe(404);
  });

  it("nama tanpa huruf latin memakai kode saja sebagai segmen", async () => {
    const { agent, slug } = await setup();
    const guest = await agent.post("/api/invitation/guests").send({ name: "王伟" });
    const code = guest.body.data.code as string;
    const res = await request(app).get(`/api/invitation/public/${slug}/guests/${code}`);
    expect(res.body.data).toMatchObject({ name: "王伟", key: code });
  });

  it("RSVP dengan kode tamu menjadi satu per tamu (upsert)", async () => {
    const { agent, slug } = await setup();
    const guest = await agent.post("/api/invitation/guests").send({ name: "Bpk. Candra" });
    const code = guest.body.data.code as string;
    const post = (body: object) =>
      request(app)
        .post(`/api/invitation/public/${slug}/rsvp`)
        .send({ guestCode: code, guestName: "Bpk. Candra", ...body });

    expect((await post({ attendanceStatus: "hadir", guestCount: 2 })).status).toBe(201);
    expect((await post({ attendanceStatus: "tidak_hadir" })).status).toBe(201);

    const cfg = await agent.get("/api/invitation/config");
    const rsvps = cfg.body.data.rsvps;
    expect(rsvps).toHaveLength(1);
    expect(rsvps[0].attendanceStatus).toBe("tidak_hadir");
    expect(rsvps[0].guestId).toBe(guest.body.data.id);
  });

  it("RSVP dengan segmen nama-kode terikat ke tamu yang sama", async () => {
    const { agent, slug } = await setup();
    const guest = await agent.post("/api/invitation/guests").send({ name: "Bpk. Candra" });
    const code = guest.body.data.code as string;
    const post = (guestCode: string) =>
      request(app)
        .post(`/api/invitation/public/${slug}/rsvp`)
        .send({ guestCode, guestName: "Bpk. Candra", attendanceStatus: "hadir" });

    expect((await post(`bpk-candra-${code}`)).status).toBe(201);
    expect((await post(code)).status).toBe(201);

    const cfg = await agent.get("/api/invitation/config");
    expect(cfg.body.data.rsvps).toHaveLength(1);
    expect(cfg.body.data.rsvps[0].guestId).toBe(guest.body.data.id);
  });

  it("PATCH tamu hanya untuk pemilik", async () => {
    const a = await setup();
    const b = await setup();
    const guest = await a.agent.post("/api/invitation/guests").send({ name: "Bpk. Dodi" });
    const id = guest.body.data.id as string;

    expect((await b.agent.patch(`/api/invitation/guests/${id}`).send({ isSent: true })).status).toBe(404);
    const ok = await a.agent.patch(`/api/invitation/guests/${id}`).send({ isSent: true, phone: "0811111111" });
    expect(ok.status).toBe(200);
    expect(ok.body.data.isSent).toBe(true);
  });

  it("ekspor CSV menetralkan sel berawalan rumus", async () => {
    const { agent } = await setup();
    await agent.post("/api/invitation/guests").send({ name: "=HYPERLINK(\"http://x\")" });
    const res = await agent.get("/api/invitation/guests/export");
    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toContain("text/csv");
    expect(res.text).toContain("Belum RSVP");
    expect(res.text).toContain("\"'=HYPERLINK");
  });
});
