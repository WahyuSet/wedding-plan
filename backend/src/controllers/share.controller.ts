import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { env } from "../config/env.js";
import { buildInvitationUrl } from "../lib/invitationUrls.js";
import { getFlag } from "../middleware/flags.middleware.js";

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const isHttpUrl = (value?: string | null): value is string => Boolean(value && /^https?:\/\//i.test(value));

const formatDate = (date?: Date | null): string =>
  date
    ? new Intl.DateTimeFormat("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "UTC",
      }).format(date)
    : "";

export interface OgMeta {
  title: string;
  description: string;
  image?: string;
}

/** Tag <title>, deskripsi, robots, Open Graph, dan Twitter untuk satu undangan. Semua nilai di-escape. */
export const renderOgTags = ({ title, description, image, url }: OgMeta & { url: string }): string => {
  const t = escapeHtml(title);
  const d = escapeHtml(description);
  return `<title>${t}</title>
<meta name="robots" content="noindex, nofollow">
<meta name="description" content="${d}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="WeddingPlan">
<meta property="og:title" content="${t}">
<meta property="og:description" content="${d}">
<meta property="og:url" content="${escapeHtml(url)}">
<meta property="og:locale" content="id_ID">
${image ? `<meta property="og:image" content="${escapeHtml(image)}">\n<meta name="twitter:image" content="${escapeHtml(image)}">` : ""}
<meta name="twitter:card" content="${image ? "summary_large_image" : "summary"}">
<meta name="twitter:title" content="${t}">
<meta name="twitter:description" content="${d}">`;
};

const renderPage = (opts: OgMeta & { url: string; target: string }): string => {
  const { target } = opts;
  return `<!doctype html>
<html lang="id">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
${renderOgTags(opts)}
<meta http-equiv="refresh" content="0;url=${escapeHtml(target)}">
</head>
<body>
<p>Membuka undangan… <a href="${escapeHtml(target)}">Klik di sini jika tidak dialihkan otomatis.</a></p>
</body>
</html>`;
};

export const GENERIC_OG_META: OgMeta = {
  title: "Undangan Pernikahan Digital",
  description: "Buka undangan pernikahan digital melalui WeddingPlan.",
};

/**
 * Meta Open Graph sebuah undangan. Undangan yang tidak ada, belum dipublikasikan,
 * atau modulnya dimatikan mendapat teks generik tanpa data apa pun.
 */
export const buildOgMeta = async (slug: string): Promise<OgMeta> => {
  const enabled = await getFlag("digital_invitation", true);
  const invitation = enabled
    ? await prisma.digitalInvitation.findUnique({
        where: { slug },
        select: {
          isPublished: true,
          groomNickName: true,
          brideNickName: true,
          akadDate: true,
          akadVenueName: true,
          coverPhotoUrl: true,
        },
      })
    : null;

  if (!invitation || !invitation.isPublished) return GENERIC_OG_META;

  const couple = [invitation.groomNickName, invitation.brideNickName].filter(Boolean).join(" & ");
  const details = [formatDate(invitation.akadDate), invitation.akadVenueName].filter(Boolean).join(" • ");

  return {
    title: couple ? `Undangan Pernikahan ${couple}` : "Undangan Pernikahan",
    description: details
      ? `Anda diundang menghadiri pernikahan kami. ${details}`
      : "Anda diundang menghadiri pernikahan kami.",
    image: isHttpUrl(invitation.coverPhotoUrl) ? invitation.coverPhotoUrl : undefined,
  };
};

/**
 * Halaman ringan untuk dibagikan ke WhatsApp/sosmed: memuat meta Open Graph per undangan
 * lalu mengalihkan ke halaman undangan di frontend.
 */
export const getShareLanding = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;
    const guestKey = req.params.guestKey?.slice(0, 120);
    // Tautan lama membawa kode tamu di ?g=; halaman undangan yang merapikannya ke bentuk baru.
    const legacyCode = typeof req.query.g === "string" ? req.query.g.slice(0, 32) : "";

    const target = new URL(buildInvitationUrl(slug, guestKey));
    if (!guestKey && legacyCode) target.searchParams.set("g", legacyCode);
    const shareUrl = `${(env.API_PUBLIC_URL ?? `${req.protocol}://${req.get("host")}`).replace(/\/$/, "")}/share/${encodeURIComponent(slug)}`;

    const meta = await buildOgMeta(slug);

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=300");
    res.send(renderPage({ ...meta, url: shareUrl, target: target.toString() }));
  } catch (error) {
    console.error("GetShareLanding Error:", error);
    res.status(500).send("Terjadi kesalahan.");
  }
};
