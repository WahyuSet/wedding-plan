import request from "supertest";
import { describe, expect, it } from "vitest";
import { app } from "../src/app.js";
import { buildInvitationUrl, invitationBaseUrl } from "../src/lib/invitationUrls.js";
import { registerUser } from "./helpers.js";

const HOST = "undangan.test";
const site = (path: string) => request(app).get(path).set("Host", HOST);

const publishedInvitation = async (config: object = {}) => {
  const user = await registerUser();
  const cfg = await user.agent.get("/api/invitation/config");
  await user.agent
    .put("/api/invitation/config")
    .send({ isPublished: true, groomNickName: "Budi", brideNickName: "Sari", ...config })
    .expect(200);
  return { ...user, slug: cfg.body.data.slug as string };
};

describe("domain undangan", () => {
  it("shell undangan memuat meta OG pasangan menggantikan SEO landing", async () => {
    const { slug } = await publishedInvitation({ akadDate: "2026-12-20", akadVenueName: "Masjid Agung" });

    for (const path of [`/${slug}`, `/${slug}/jokowi-x7k2mq`]) {
      const res = await site(path);
      expect(res.status).toBe(200);
      expect(res.headers["content-type"]).toContain("text/html");
      expect(res.text).toContain('property="og:title" content="Undangan Pernikahan Budi &amp; Sari"');
      expect(res.text).toContain("Minggu, 20 Desember 2026");
      expect(res.text).toContain(`property="og:url" content="http://${HOST}/${slug}"`);
      expect(res.text).toContain('<meta name="wp-site" content="invitation">');
      expect(res.text).toContain('content="noindex, nofollow"');
      expect(res.text).not.toContain("Landing Fixture");
      expect(res.text).not.toContain("index, follow");
      // Bagian di luar penanda tetap utuh.
      expect(res.text).toContain('src="/assets/app.js"');
      expect(res.text).toContain('<div id="root"></div>');
    }
  });

  it("header shell: tidak diindeks, tidak di-cache, CSP tanpa script inline", async () => {
    const { slug } = await publishedInvitation();
    const res = await site(`/${slug}`);
    expect(res.headers["x-robots-tag"]).toBe("noindex, nofollow");
    expect(res.headers["cache-control"]).toBe("no-cache");
    const csp = res.headers["content-security-policy"];
    expect(csp).toContain("script-src 'self'");
    expect(csp).toContain("connect-src 'self'");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).not.toMatch(/script-src[^;]*unsafe-inline/);
  });

  it("undangan belum dipublikasikan atau tidak ada tidak membocorkan data", async () => {
    const draft = await registerUser();
    const cfg = await draft.agent.get("/api/invitation/config");
    await draft.agent.put("/api/invitation/config").send({ groomNickName: "Rahasia" }).expect(200);

    for (const path of [`/${cfg.body.data.slug}`, "/slug-yang-tidak-ada"]) {
      const res = await site(path);
      expect(res.status).toBe(200);
      expect(res.text).toContain("Undangan Pernikahan Digital");
      expect(res.text).not.toContain("Rahasia");
      expect(res.text).toContain('content="invitation"');
    }
  });

  it("meng-escape data pengguna dan tidak menafsirkan pola $ pada nama", async () => {
    const { slug } = await publishedInvitation({ groomNickName: '"><script>alert(1)</script>', brideNickName: "$& $1" });
    const res = await site(`/${slug}`);
    expect(res.text).not.toContain("<script>alert(1)</script>");
    expect(res.text).toContain("&lt;script&gt;");
    expect(res.text).toContain("$&amp; $1");
    expect(res.text).not.toContain("seo:start");
  });

  it("akar domain ke dashboard, tautan lama /invitation dialihkan dengan query", async () => {
    const root = await site("/");
    expect(root.status).toBe(302);
    expect(root.headers.location).toBe("http://localhost:5173");

    const legacy = await site("/invitation/budi-sari?g=abc123");
    expect(legacy.status).toBe(301);
    expect(legacy.headers.location).toBe("/budi-sari?g=abc123");

    const legacyGuest = await site("/invitation/budi-sari/jokowi-x7k2mq");
    expect(legacyGuest.headers.location).toBe("/budi-sari/jokowi-x7k2mq");
  });

  it("robots melarang semua, file landing tidak disajikan, aset statis disajikan", async () => {
    const robots = await site("/robots.txt");
    expect(robots.status).toBe(200);
    expect(robots.text).toContain("Disallow: /");

    expect((await site("/index.html")).status).toBe(404);
    expect((await site("/sitemap.xml")).status).toBe(404);

    const asset = await site("/assets/app.js");
    expect(asset.status).toBe(200);
    expect(asset.headers["cache-control"]).toContain("immutable");
    expect((await site("/assets/tidak-ada.js")).status).toBe(404);
  });

  it("path tak dikenal: halaman 404 berupa shell tanpa data", async () => {
    const res = await site("/a/b/c");
    expect(res.status).toBe(404);
    expect(res.text).toContain('content="invitation"');
    expect(res.text).toContain("Undangan Pernikahan Digital");

    expect((await request(app).post("/apa-saja").set("Host", HOST)).status).toBe(404);
  });

  it("hanya API publik undangan yang terbuka di domain undangan", async () => {
    const { slug, email, password } = await publishedInvitation();

    expect((await site(`/api/invitation/public/${slug}`)).status).toBe(200);
    expect((await site("/api/settings/public")).status).toBe(200);
    expect((await site("/api/health")).status).toBe(200);

    const login = await request(app)
      .post("/api/auth/login")
      .set("Host", HOST)
      .send({ identifier: email, password });
    expect(login.status).toBe(404);
    expect(login.headers["set-cookie"]).toBeUndefined();
    expect((await site("/api/invitation/config")).status).toBe(404);
    expect((await site("/api/auth/me")).status).toBe(404);
    expect((await site("/api")).status).toBe(404);
  });

  it("RSVP lewat domain undangan tersimpan", async () => {
    const { agent, slug } = await publishedInvitation();
    const res = await request(app)
      .post(`/api/invitation/public/${slug}/rsvp`)
      .set("Host", HOST)
      .set("Origin", `http://${HOST}`)
      .send({ guestName: "Tamu", attendanceStatus: "hadir" });
    expect(res.status).toBe(201);
    expect((await agent.get("/api/invitation/config")).body.data.rsvps).toHaveLength(1);
  });

  it("host lain tidak terpengaruh", async () => {
    const root = await request(app).get("/");
    expect(root.status).toBe(200);
    expect(root.body.status).toBe("online");
    expect((await request(app).get("/robots.txt")).status).toBe(404);
    expect((await request(app).get("/budi-sari")).headers["content-type"]).toContain("application/json");
  });

  it("pengaturan publik memberi tahu dashboard domain undangan", async () => {
    const res = await request(app).get("/api/settings/public");
    expect(res.body.data.invitation_url).toBe(`http://${HOST}`);
  });
});

describe("basis tautan undangan", () => {
  const frontend = { FRONTEND_URL: "http://localhost:5173/", INVITATION_URL: undefined };
  const separate = { FRONTEND_URL: "http://localhost:5173", INVITATION_URL: "https://undangan.com/" };

  it("tanpa INVITATION_URL: di bawah /invitation pada domain dashboard", () => {
    expect(invitationBaseUrl(frontend)).toBe("http://localhost:5173/invitation");
    expect(buildInvitationUrl("r-j", "jokowi-x7k2mq", frontend)).toBe(
      "http://localhost:5173/invitation/r-j/jokowi-x7k2mq"
    );
  });

  it("dengan INVITATION_URL: slug langsung di akar domain undangan", () => {
    expect(invitationBaseUrl(separate)).toBe("https://undangan.com");
    expect(buildInvitationUrl("r-j", null, separate)).toBe("https://undangan.com/r-j");
    expect(buildInvitationUrl("r-j", "jokowi-x7k2mq", separate)).toBe("https://undangan.com/r-j/jokowi-x7k2mq");
  });
});
