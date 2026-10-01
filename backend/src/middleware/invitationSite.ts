import { readFileSync } from "node:fs";
import path from "node:path";
import express, { Router, type Request, type RequestHandler, type Response } from "express";
import { env, isProduction } from "../config/env.js";
import { GENERIC_OG_META, buildOgMeta, renderOgTags, type OgMeta } from "../controllers/share.controller.js";
import { buildInvitationUrl, invitationOrigin } from "../lib/invitationUrls.js";
import { apiLimiter } from "./rateLimit.middleware.js";

const SEO_BLOCK = /<!--seo:start-->[\s\S]*?<!--seo:end-->/;

// Hanya API publik undangan yang boleh diakses lewat domain undangan. Login dan endpoint
// ber-auth ditutup agar tidak ada sesi yang terbentuk di domain yang memuat konten dari tamu.
const PUBLIC_API = [/^\/api\/invitation\/public\//, /^\/api\/settings\/public\/?$/, /^\/api\/health\/?$/];

const SLUG = "[a-z0-9-]+";
const GUEST_KEY = "[A-Za-z0-9_-]+";

// Foto galeri dan musik boleh berupa URL luar. Di development file upload dilayani lewat http.
const remoteMedia = isProduction ? "https:" : "https: http:";
const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "script-src 'self'",
  "connect-src 'self'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  `img-src 'self' data: blob: ${remoteMedia}`,
  `media-src 'self' ${remoteMedia}`,
  "object-src 'none'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  ...(isProduction ? ["upgrade-insecure-requests"] : []),
].join("; ");

type Shell = { html: string } | { error: string };

const loadShell = (distDir: string): Shell => {
  const file = path.join(distDir, "index.html");
  try {
    const html = readFileSync(file, "utf8");
    return SEO_BLOCK.test(html)
      ? { html }
      : { error: `${file} tidak memuat penanda <!--seo:start--> dan <!--seo:end-->.` };
  } catch {
    return { error: `${file} tidak terbaca. Build frontend dulu atau periksa INVITATION_DIST_DIR.` };
  }
};

/**
 * Melayani domain undangan (INVITATION_URL) dari backend yang sama: build frontend sebagai file
 * statis, dan index.html yang meta Open Graph-nya diisi per undangan agar pratinjau tautan di
 * WhatsApp benar. Permintaan ke host lain diteruskan tanpa diubah.
 */
export const createInvitationSite = (): RequestHandler => {
  const origin = invitationOrigin();
  if (!origin) return (_req, _res, next) => next();

  const host = new URL(origin).hostname;
  const distDir = path.resolve(env.INVITATION_DIST_DIR);

  const initial = loadShell(distDir);
  if ("error" in initial) {
    console[isProduction ? "error" : "warn"](`Domain undangan: ${initial.error}`);
    if (isProduction) process.exit(1);
  }
  // Di luar production build frontend bisa berubah kapan saja, jadi dibaca ulang tiap permintaan.
  const getShell = isProduction ? () => initial : () => loadShell(distDir);

  const sendShell = (res: Response, meta: OgMeta, url: string, status = 200): void => {
    const shell = getShell();
    if ("error" in shell) {
      res.status(503).type("text/plain").send(`Halaman undangan belum tersedia. ${shell.error}`);
      return;
    }
    const head = `${renderOgTags({ ...meta, url })}\n<meta name="wp-site" content="invitation">`;
    res
      .status(status)
      .set({
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-cache",
        "X-Robots-Tag": "noindex, nofollow",
        "Content-Security-Policy": CONTENT_SECURITY_POLICY,
      })
      // Fungsi pengganti: nama mempelai bisa memuat "$&" yang punya arti khusus di string pengganti.
      .send(shell.html.replace(SEO_BLOCK, () => head));
  };

  const queryOf = (req: Request): string => {
    const index = req.originalUrl.indexOf("?");
    return index === -1 ? "" : req.originalUrl.slice(index);
  };

  const site = Router();

  site.get("/robots.txt", (_req, res) => {
    res.type("text/plain").send("User-agent: *\nDisallow: /\n");
  });

  // Milik landing dashboard; di domain undangan hanya shell hasil render yang boleh keluar.
  site.get(["/index.html", "/sitemap.xml"], (_req, res) => {
    res.status(404).type("text/plain").send("Tidak ditemukan.");
  });

  site.use(
    express.static(distDir, {
      index: false,
      dotfiles: "ignore",
      setHeaders: (res, filePath) => {
        // File di /assets bernama hash, jadi aman di-cache selamanya.
        if (filePath.includes(`${path.sep}assets${path.sep}`)) {
          res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        }
      },
    })
  );

  site.get("/", (_req, res) => res.redirect(302, env.FRONTEND_URL));

  // Tautan lama dari domain dashboard: /invitation/<slug>[?g=kode]
  site.get(`/invitation/:slug(${SLUG})/:guestKey(${GUEST_KEY})?`, (req, res) => {
    const { slug, guestKey } = req.params;
    res.redirect(301, `/${slug}${guestKey ? `/${guestKey}` : ""}${queryOf(req)}`);
  });

  site.get(`/:slug(${SLUG})/:guestKey(${GUEST_KEY})?`, apiLimiter, async (req, res, next) => {
    try {
      const { slug } = req.params;
      sendShell(res, await buildOgMeta(slug), buildInvitationUrl(slug));
    } catch (error) {
      next(error);
    }
  });

  site.use((req, res) => {
    const wantsPage = req.method === "GET" && !path.extname(req.path);
    if (wantsPage) sendShell(res, GENERIC_OG_META, origin, 404);
    else res.status(404).type("text/plain").send("Tidak ditemukan.");
  });

  return (req, res, next) => {
    if (req.hostname !== host) return next();

    if (req.path === "/api" || req.path.startsWith("/api/")) {
      if (PUBLIC_API.some((pattern) => pattern.test(req.path))) return next();
      res.status(404).json({ success: false, message: "Endpoint tidak tersedia di domain undangan." });
      return;
    }
    if (req.path.startsWith("/uploads/") || req.path.startsWith("/share/")) return next();

    site(req, res, next);
  };
};
