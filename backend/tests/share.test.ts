import request from "supertest";
import { describe, expect, it } from "vitest";
import { app } from "../src/app.js";
import { registerUser } from "./helpers.js";

describe("halaman share (OG)", () => {
  it("memuat meta OG dari data undangan dan mengalihkan ke domain undangan", async () => {
    const { agent } = await registerUser();
    const cfg = await agent.get("/api/invitation/config");
    const slug = cfg.body.data.slug as string;
    await agent
      .put("/api/invitation/config")
      .send({
        isPublished: true,
        groomNickName: "Budi",
        brideNickName: "Sari",
        akadDate: "2026-12-20",
        akadVenueName: "Masjid Agung",
      })
      .expect(200);

    const res = await request(app).get(`/share/${slug}?g=abc123`);
    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toContain("text/html");
    expect(res.text).toContain('property="og:title" content="Undangan Pernikahan Budi &amp; Sari"');
    expect(res.text).toContain("Minggu, 20 Desember 2026");
    expect(res.text).toContain("Masjid Agung");
    expect(res.text).toContain("og:image");
    expect(res.text).toContain(`http://undangan.test/${slug}?g=abc123`);
    expect(res.text).toContain("noindex");
  });

  it("tautan share dengan segmen tamu mengalihkan ke <domain-undangan>/<slug>/<nama-kode>", async () => {
    const { agent } = await registerUser();
    const cfg = await agent.get("/api/invitation/config");
    const slug = cfg.body.data.slug as string;
    await agent.put("/api/invitation/config").send({ isPublished: true, groomNickName: "Budi", brideNickName: "Sari" }).expect(200);

    const res = await request(app).get(`/share/${slug}/jokowi-x7k2mq`);
    expect(res.status).toBe(200);
    expect(res.text).toContain('property="og:title" content="Undangan Pernikahan Budi &amp; Sari"');
    expect(res.text).toContain(`url=http://undangan.test/${slug}/jokowi-x7k2mq"`);
  });

  it("meng-escape HTML pada data pengguna", async () => {
    const { agent } = await registerUser();
    const cfg = await agent.get("/api/invitation/config");
    const slug = cfg.body.data.slug as string;
    await agent
      .put("/api/invitation/config")
      .send({ isPublished: true, groomNickName: '"><script>alert(1)</script>', brideNickName: "Sari" })
      .expect(200);

    const res = await request(app).get(`/share/${slug}`);
    expect(res.text).not.toContain("<script>alert(1)</script>");
    expect(res.text).toContain("&lt;script&gt;");
  });

  it("undangan tidak dipublikasikan atau tidak ada tidak membocorkan data", async () => {
    const { agent } = await registerUser();
    const cfg = await agent.get("/api/invitation/config");
    const slug = cfg.body.data.slug as string;
    const draft = await request(app).get(`/share/${slug}`);
    expect(draft.status).toBe(200);
    expect(draft.text).not.toContain("Budi");
    expect(draft.text).toContain("Undangan Pernikahan Digital");

    const missing = await request(app).get("/share/tidak-ada-slug");
    expect(missing.text).toContain("Undangan Pernikahan Digital");
  });
});
