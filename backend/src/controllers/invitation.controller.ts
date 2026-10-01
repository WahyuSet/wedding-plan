import { randomBytes, randomInt } from "node:crypto";
import { Prisma } from "@prisma/client";
import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { guestCodeCandidates, guestKey } from "../lib/invitationUrls.js";
import { ProfileRequest } from "../types/index.js";

// ─────────────────────────────────────────────
// Helpers & Schemas
// ─────────────────────────────────────────────

export const THEME_IDS = ["noir-calla", "chalk-and-vow", "nocturne-botanica"] as const;
// Slug pasangan menjadi segmen pertama path undangan, jadi tidak boleh bentrok dengan route lain.
const RESERVED_SLUGS = new Set([
  "admin",
  "api",
  "login",
  "register",
  "dashboard",
  "settings",
  "share",
  "uploads",
  "assets",
  "invitation",
  "invitation-preview",
  "invitation-admin",
  "budget",
  "seserahan",
  "operasional",
  "dokumen-kua",
  "favicon",
  "robots",
  "sitemap",
  "static",
  "public",
  "www",
  "health",
  "index",
]);

export function createSlug(text: string): string {
  return text
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/&/g, " ")
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const randomSuffix = (): string => randomBytes(2).toString("hex");

// Tanpa i, l, o, 0, 1 agar tidak tertukar saat tautan diketik ulang.
const GUEST_CODE_ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789";
const GUEST_CODE_LENGTH = 6;
const GUEST_CODE_ATTEMPTS = 5;

const newGuestCode = (): string =>
  Array.from({ length: GUEST_CODE_LENGTH }, () => GUEST_CODE_ALPHABET[randomInt(GUEST_CODE_ALPHABET.length)]).join("");

const newGuestCodes = (count: number): string[] => {
  const codes = new Set<string>();
  while (codes.size < count) codes.add(newGuestCode());
  return [...codes];
};

// Kode tamu unik se-aplikasi: bila bentrok dengan kode yang sudah ada, ulangi dengan kode baru.
async function withFreshGuestCode<T>(run: () => Promise<T>): Promise<T> {
  for (let attempt = 1; ; attempt++) {
    try {
      return await run();
    } catch (error) {
      const isCodeCollision = error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
      if (!isCodeCollision || attempt >= GUEST_CODE_ATTEMPTS) throw error;
    }
  }
}

const httpUrl = z
  .string()
  .trim()
  .max(2048)
  .url("URL tidak valid")
  .refine((u) => /^https?:\/\//i.test(u), "URL harus diawali http:// atau https://");
const optionalUrl = z.union([z.literal(""), httpUrl]).nullable().optional();

const shortText = (max: number) => z.string().trim().max(max).nullable().optional();
const timeStart = z.union([z.literal(""), z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Format jam HH:mm")]).nullable().optional();
const timeEnd = z
  .union([z.literal(""), z.string().regex(/^(([01]\d|2[0-3]):[0-5]\d|Selesai)$/, "Format jam HH:mm atau 'Selesai'")])
  .nullable()
  .optional();
const dateField = z
  .union([z.literal(""), z.string().refine((v) => !Number.isNaN(Date.parse(v)), "Tanggal tidak valid")])
  .nullable()
  .optional();

const loveStoryItem = z.object({
  year: z.string().trim().max(10),
  title: z.string().trim().max(100),
  story: z.string().trim().max(1000),
});
const galleryItem = z.object({
  url: httpUrl,
  caption: z.string().trim().max(120).nullable().optional(),
});
const bankItem = z.object({
  bankName: z.string().trim().max(40),
  accountNumber: z.string().trim().max(40),
  accountHolder: z.string().trim().max(80),
  qrCodeUrl: optionalUrl,
});

export const invitationConfigSchema = z.object({
  slug: z
    .string()
    .trim()
    .max(60)
    .refine((v) => createSlug(v).length >= 3, "Slug minimal 3 karakter huruf/angka")
    .refine((v) => !RESERVED_SLUGS.has(createSlug(v)), "Slug ini tidak dapat digunakan")
    .optional(),
  theme: z.enum(THEME_IDS).optional(),
  tone: z.enum(["islami", "umum"]).optional(),
  timezone: z.enum(["WIB", "WITA", "WIT"]).optional(),
  title: shortText(80),
  openingQuote: shortText(600),
  quoteSource: shortText(100),
  bgMusicUrl: optionalUrl,
  isMusicAutoPlay: z.boolean().optional(),
  isPublished: z.boolean().optional(),

  coverPhotoUrl: optionalUrl,
  heroPhotoUrl: optionalUrl,

  groomFullName: shortText(120),
  groomNickName: shortText(40),
  groomFather: shortText(120),
  groomMother: shortText(120),
  groomInstagram: shortText(40),
  groomPhotoUrl: optionalUrl,

  brideFullName: shortText(120),
  brideNickName: shortText(40),
  brideFather: shortText(120),
  brideMother: shortText(120),
  brideInstagram: shortText(40),
  bridePhotoUrl: optionalUrl,

  akadDate: dateField,
  akadStartTime: timeStart,
  akadEndTime: timeEnd,
  akadVenueName: shortText(160),
  akadAddress: shortText(300),
  akadMapUrl: optionalUrl,

  resepsiDate: dateField,
  resepsiStartTime: timeStart,
  resepsiEndTime: timeEnd,
  resepsiVenueName: shortText(160),
  resepsiAddress: shortText(300),
  resepsiMapUrl: optionalUrl,

  loveStory: z.array(loveStoryItem).max(30).optional(),
  galleryPhotos: z.array(galleryItem).max(30).optional(),
  bankAccounts: z.array(bankItem).max(10).optional(),
  giftAddress: shortText(300),
});

export const guestSchema = z.object({
  name: z.string().trim().min(1, "Nama tamu wajib diisi").max(80),
  phone: z
    .string()
    .trim()
    .max(20)
    .regex(/^[0-9+\-\s]*$/, "Nomor telepon hanya boleh angka")
    .nullable()
    .optional(),
  category: z.enum(["keluarga", "sahabat", "vip", "rekan_kerja"]).optional(),
});

export const updateGuestSchema = guestSchema.partial().extend({
  isSent: z.boolean().optional(),
});

export const bulkGuestSchema = z.object({
  guests: z.array(guestSchema).min(1, "Daftar tamu kosong").max(300, "Maksimal 300 tamu sekali tambah"),
});

export const publicRsvpSchema = z.object({
  guestCode: z.string().trim().max(120).optional(),
  guestName: z.string().trim().min(1, "Nama tamu wajib diisi").max(80),
  attendanceStatus: z.enum(["hadir", "tidak_hadir", "ragu"]).default("hadir"),
  guestCount: z.coerce.number().int().min(1).max(10).default(1),
  message: z.string().trim().max(500).nullable().optional(),
});

const orNull = (v: string | null | undefined): string | null | undefined =>
  v === undefined ? undefined : v === "" ? null : v;

const withDate = (v: string | null | undefined): Date | null | undefined =>
  v === undefined ? undefined : v ? new Date(v) : null;

async function generateUniqueSlug(base: string): Promise<string> {
  const root = createSlug(base) || "wedding";
  for (let attempt = 0; attempt < 5; attempt++) {
    const candidate = `${root}-${randomSuffix()}`;
    const existing = await prisma.digitalInvitation.findUnique({ where: { slug: candidate } });
    if (!existing) return candidate;
  }
  return `${root}-${Date.now().toString(36)}`;
}

// ─────────────────────────────────────────────
// ADMIN ENDPOINTS (Require Authentication)
// ─────────────────────────────────────────────

/**
 * Get or auto-initialize the digital invitation configuration for logged-in user
 */
export const getInvitationConfig = async (req: ProfileRequest, res: Response): Promise<void> => {
  try {
    const profileId = req.user!.profileId;

    const profile = await prisma.weddingProfile.findUnique({
      where: { id: profileId },
      include: {
        digitalInvitation: {
          include: {
            rsvps: { orderBy: { createdAt: "desc" } },
            guests: { orderBy: { createdAt: "desc" } },
          },
        },
      },
    });

    if (!profile) {
      res.status(404).json({ success: false, message: "Profil pernikahan tidak ditemukan." });
      return;
    }

    let invitation = profile.digitalInvitation;

    if (!invitation) {
      const slug = await generateUniqueSlug(`${profile.groomName || "groom"}-${profile.brideName || "bride"}`);

      invitation = await prisma.digitalInvitation.create({
        data: {
          profileId,
          slug,
          theme: "noir-calla",
          title: "The Wedding of",
          isPublished: false,
          groomFullName: profile.groomName || null,
          groomNickName: profile.groomName?.split(" ")[0] || null,
          brideFullName: profile.brideName || null,
          brideNickName: profile.brideName?.split(" ")[0] || null,
          akadDate: profile.weddingDate,
          akadVenueName: profile.venue || null,
          akadAddress: profile.venue || null,
          resepsiDate: profile.weddingDate,
          resepsiVenueName: profile.venue || null,
          resepsiAddress: profile.venue || null,
          loveStory: JSON.stringify([]),
          galleryPhotos: JSON.stringify([]),
          bankAccounts: JSON.stringify([]),
        },
        include: { rsvps: true, guests: true },
      });
    }

    res.json({ success: true, data: invitation });
  } catch (error) {
    console.error("GetInvitationConfig Error:", error);
    res.status(500).json({ success: false, message: "Gagal memuat pengaturan undangan." });
  }
};

/**
 * Update invitation configuration
 */
export const updateInvitationConfig = async (req: ProfileRequest, res: Response): Promise<void> => {
  try {
    const profileId = req.user!.profileId;
    const body = req.body as z.infer<typeof invitationConfigSchema>;

    const current = await prisma.digitalInvitation.findUnique({ where: { profileId } });

    if (!current) {
      res.status(404).json({ success: false, message: "Data undangan belum diinisialisasi." });
      return;
    }

    let newSlug: string | undefined;
    if (body.slug) {
      const cleanSlug = createSlug(body.slug);
      if (cleanSlug !== current.slug) {
        const slugExists = await prisma.digitalInvitation.findFirst({
          where: { slug: cleanSlug, NOT: { id: current.id } },
        });
        if (slugExists) {
          res.status(400).json({
            success: false,
            message: "Tautan URL / slug ini sudah digunakan. Silakan gunakan nama lain.",
          });
          return;
        }
        newSlug = cleanSlug;
      }
    }

    const updated = await prisma.digitalInvitation.update({
      where: { id: current.id },
      data: {
        slug: newSlug,
        theme: body.theme,
        tone: body.tone,
        timezone: body.timezone,
        title: body.title ?? undefined,
        openingQuote: body.openingQuote,
        quoteSource: body.quoteSource,
        bgMusicUrl: orNull(body.bgMusicUrl),
        isMusicAutoPlay: body.isMusicAutoPlay,
        isPublished: body.isPublished,

        coverPhotoUrl: orNull(body.coverPhotoUrl),
        heroPhotoUrl: orNull(body.heroPhotoUrl),

        groomFullName: body.groomFullName,
        groomNickName: body.groomNickName,
        groomFather: body.groomFather,
        groomMother: body.groomMother,
        groomInstagram: body.groomInstagram,
        groomPhotoUrl: orNull(body.groomPhotoUrl),

        brideFullName: body.brideFullName,
        brideNickName: body.brideNickName,
        brideFather: body.brideFather,
        brideMother: body.brideMother,
        brideInstagram: body.brideInstagram,
        bridePhotoUrl: orNull(body.bridePhotoUrl),

        akadDate: withDate(body.akadDate),
        akadStartTime: body.akadStartTime,
        akadEndTime: body.akadEndTime,
        akadVenueName: body.akadVenueName,
        akadAddress: body.akadAddress,
        akadMapUrl: orNull(body.akadMapUrl),

        resepsiDate: withDate(body.resepsiDate),
        resepsiStartTime: body.resepsiStartTime,
        resepsiEndTime: body.resepsiEndTime,
        resepsiVenueName: body.resepsiVenueName,
        resepsiAddress: body.resepsiAddress,
        resepsiMapUrl: orNull(body.resepsiMapUrl),

        loveStory: body.loveStory ? JSON.stringify(body.loveStory) : undefined,
        galleryPhotos: body.galleryPhotos ? JSON.stringify(body.galleryPhotos) : undefined,
        bankAccounts: body.bankAccounts ? JSON.stringify(body.bankAccounts) : undefined,
        giftAddress: body.giftAddress,
      },
      include: {
        rsvps: { orderBy: { createdAt: "desc" } },
        guests: { orderBy: { createdAt: "desc" } },
      },
    });

    res.json({
      success: true,
      message: "Pengaturan undangan berhasil disimpan.",
      data: updated,
    });
  } catch (error) {
    console.error("UpdateInvitationConfig Error:", error);
    res.status(500).json({ success: false, message: "Gagal memperbarui pengaturan undangan." });
  }
};

/**
 * Manage Guests
 */
export const addGuest = async (req: ProfileRequest, res: Response): Promise<void> => {
  try {
    const profileId = req.user!.profileId;
    const { name, phone, category } = req.body as z.infer<typeof guestSchema>;

    const invitation = await prisma.digitalInvitation.findUnique({ where: { profileId } });
    if (!invitation) {
      res.status(404).json({ success: false, message: "Undangan tidak ditemukan." });
      return;
    }

    const guest = await withFreshGuestCode(() =>
      prisma.invitationGuest.create({
        data: {
          invitationId: invitation.id,
          name,
          slug: createSlug(name),
          code: newGuestCode(),
          phone: phone || null,
          category: category || "keluarga",
        },
      })
    );

    res.status(201).json({ success: true, message: "Tamu berhasil ditambahkan.", data: guest });
  } catch (error) {
    console.error("AddGuest Error:", error);
    res.status(500).json({ success: false, message: "Gagal menambahkan tamu." });
  }
};

export const updateGuest = async (req: ProfileRequest, res: Response): Promise<void> => {
  try {
    const profileId = req.user!.profileId;
    const { guestId } = req.params;
    const body = req.body as z.infer<typeof updateGuestSchema>;

    const guest = await prisma.invitationGuest.findFirst({
      where: { id: guestId, invitation: { profileId } },
      select: { id: true },
    });
    if (!guest) {
      res.status(404).json({ success: false, message: "Tamu tidak ditemukan." });
      return;
    }

    const updated = await prisma.invitationGuest.update({
      where: { id: guest.id },
      data: {
        name: body.name,
        slug: body.name ? createSlug(body.name) : undefined,
        phone: body.phone === undefined ? undefined : body.phone || null,
        category: body.category,
        isSent: body.isSent,
      },
    });

    res.json({ success: true, message: "Tamu berhasil diperbarui.", data: updated });
  } catch (error) {
    console.error("UpdateGuest Error:", error);
    res.status(500).json({ success: false, message: "Gagal memperbarui tamu." });
  }
};

export const bulkAddGuests = async (req: ProfileRequest, res: Response): Promise<void> => {
  try {
    const profileId = req.user!.profileId;
    const { guests } = req.body as z.infer<typeof bulkGuestSchema>;

    const invitation = await prisma.digitalInvitation.findUnique({ where: { profileId } });
    if (!invitation) {
      res.status(404).json({ success: false, message: "Undangan tidak ditemukan." });
      return;
    }

    const created = await withFreshGuestCode(() => {
      const codes = newGuestCodes(guests.length);
      return prisma.$transaction(
        guests.map((g, i) =>
          prisma.invitationGuest.create({
            data: {
              invitationId: invitation.id,
              name: g.name,
              slug: createSlug(g.name),
              code: codes[i],
              phone: g.phone || null,
              category: g.category || "keluarga",
            },
          })
        )
      );
    });

    res.status(201).json({
      success: true,
      message: `${created.length} tamu berhasil ditambahkan.`,
      data: created,
    });
  } catch (error) {
    console.error("BulkAddGuests Error:", error);
    res.status(500).json({ success: false, message: "Gagal menambahkan tamu." });
  }
};

// Sel yang diawali =,+,-,@ dinetralkan agar tidak dieksekusi sebagai rumus di Excel.
const csvCell = (value: string | number | null | undefined): string => {
  let text = value === null || value === undefined ? "" : String(value);
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
};

export const exportGuestsCsv = async (req: ProfileRequest, res: Response): Promise<void> => {
  try {
    const profileId = req.user!.profileId;
    const invitation = await prisma.digitalInvitation.findUnique({
      where: { profileId },
      include: {
        guests: { orderBy: { createdAt: "asc" }, include: { rsvp: true } },
      },
    });
    if (!invitation) {
      res.status(404).json({ success: false, message: "Undangan tidak ditemukan." });
      return;
    }

    const statusLabel: Record<string, string> = { hadir: "Hadir", tidak_hadir: "Berhalangan", ragu: "Ragu-ragu" };
    const header = ["Nama", "Kategori", "Telepon", "Terkirim", "Status RSVP", "Jumlah Hadir", "Ucapan"];
    const rows = invitation.guests.map((g) => [
      g.name,
      g.category,
      g.phone,
      g.isSent ? "Ya" : "Belum",
      g.rsvp ? statusLabel[g.rsvp.attendanceStatus] ?? g.rsvp.attendanceStatus : "Belum RSVP",
      g.rsvp && g.rsvp.attendanceStatus === "hadir" ? g.rsvp.guestCount : "",
      g.rsvp?.message,
    ]);
    const csv = "\uFEFF" + [header, ...rows].map((r) => r.map(csvCell).join(",")).join("\r\n");

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="daftar-tamu-${invitation.slug}.csv"`);
    res.send(csv);
  } catch (error) {
    console.error("ExportGuestsCsv Error:", error);
    res.status(500).json({ success: false, message: "Gagal mengekspor daftar tamu." });
  }
};

export const deleteGuest = async (req: ProfileRequest, res: Response): Promise<void> => {
  try {
    const profileId = req.user!.profileId;
    const { guestId } = req.params;

    const guest = await prisma.invitationGuest.findFirst({
      where: { id: guestId, invitation: { profileId } },
      select: { id: true },
    });
    if (!guest) {
      res.status(404).json({ success: false, message: "Tamu tidak ditemukan." });
      return;
    }

    await prisma.invitationGuest.delete({ where: { id: guest.id } });
    res.json({ success: true, message: "Tamu berhasil dihapus." });
  } catch (error) {
    console.error("DeleteGuest Error:", error);
    res.status(500).json({ success: false, message: "Gagal menghapus tamu." });
  }
};

export const deleteRsvp = async (req: ProfileRequest, res: Response): Promise<void> => {
  try {
    const profileId = req.user!.profileId;
    const { rsvpId } = req.params;

    const rsvp = await prisma.invitationRsvp.findFirst({
      where: { id: rsvpId, invitation: { profileId } },
      select: { id: true },
    });
    if (!rsvp) {
      res.status(404).json({ success: false, message: "Ucapan tidak ditemukan." });
      return;
    }

    await prisma.invitationRsvp.delete({ where: { id: rsvp.id } });
    res.json({ success: true, message: "Ucapan RSVP berhasil dihapus." });
  } catch (error) {
    console.error("DeleteRsvp Error:", error);
    res.status(500).json({ success: false, message: "Gagal menghapus ucapan." });
  }
};

// ─────────────────────────────────────────────
// PUBLIC ENDPOINTS (NO AUTH REQUIRED)
// ─────────────────────────────────────────────

const parseJsonArray = (raw: string | null): unknown[] => {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

/**
 * Fetch public invitation details by slug (hanya field yang aman untuk publik)
 */
export const getPublicInvitation = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;

    const invitation = await prisma.digitalInvitation.findUnique({
      where: { slug },
      include: {
        rsvps: {
          orderBy: { createdAt: "desc" },
          take: 100,
          select: {
            id: true,
            guestName: true,
            attendanceStatus: true,
            guestCount: true,
            message: true,
            createdAt: true,
          },
        },
        _count: { select: { rsvps: true } },
      },
    });

    if (!invitation) {
      res.status(404).json({ success: false, message: "Undangan tidak ditemukan atau tautan salah." });
      return;
    }

    if (!invitation.isPublished) {
      res.status(403).json({
        success: false,
        message: "Undangan ini saat ini belum dipublikasikan oleh pemiliknya.",
      });
      return;
    }

    const { profileId: _profileId, _count, createdAt: _c, updatedAt: _u, ...publicData } = invitation;

    res.json({
      success: true,
      data: {
        ...publicData,
        loveStory: parseJsonArray(invitation.loveStory),
        galleryPhotos: parseJsonArray(invitation.galleryPhotos),
        bankAccounts: parseJsonArray(invitation.bankAccounts),
        rsvpTotal: _count.rsvps,
      },
    });
  } catch (error) {
    console.error("GetPublicInvitation Error:", error);
    res.status(500).json({ success: false, message: "Gagal memuat undangan." });
  }
};

/**
 * Resolve tamu dari segmen personal di tautan undangan ("nama-kode" atau kode saja).
 * Hanya nama, kategori, dan bentuk kanonik segmennya yang dikembalikan.
 */
export const getPublicGuest = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug, guestKey: key } = req.params;
    const codes = guestCodeCandidates(key);
    const guest = codes.length
      ? await prisma.invitationGuest.findFirst({
          where: { code: { in: codes }, invitation: { slug, isPublished: true } },
          select: {
            name: true,
            slug: true,
            code: true,
            category: true,
            rsvp: { select: { attendanceStatus: true } },
          },
        })
      : null;
    if (!guest) {
      res.status(404).json({ success: false, message: "Tamu tidak ditemukan." });
      return;
    }
    res.json({
      success: true,
      data: { name: guest.name, category: guest.category, hasRsvp: Boolean(guest.rsvp), key: guestKey(guest) },
    });
  } catch (error) {
    console.error("GetPublicGuest Error:", error);
    res.status(500).json({ success: false, message: "Gagal memuat data tamu." });
  }
};

/**
 * Submit RSVP and warm wishes publicly from guest
 */
export const submitPublicRsvp = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;
    const { guestCode, guestName, attendanceStatus, guestCount, message } = req.body as z.infer<
      typeof publicRsvpSchema
    >;

    const invitation = await prisma.digitalInvitation.findUnique({ where: { slug } });

    if (!invitation || !invitation.isPublished) {
      res.status(404).json({ success: false, message: "Undangan tidak ditemukan." });
      return;
    }

    const values = {
      guestName,
      attendanceStatus,
      guestCount: attendanceStatus === "hadir" ? guestCount : 1,
      message: message || null,
    };

    const codes = guestCode ? guestCodeCandidates(guestCode) : [];
    const guest = codes.length
      ? await prisma.invitationGuest.findFirst({
          where: { code: { in: codes }, invitationId: invitation.id },
          select: { id: true },
        })
      : null;

    // Satu RSVP per tamu: kirim ulang memperbarui konfirmasi sebelumnya.
    const rsvp = guest
      ? await prisma.invitationRsvp.upsert({
          where: { guestId: guest.id },
          create: { invitationId: invitation.id, guestId: guest.id, ...values },
          update: values,
        })
      : await prisma.invitationRsvp.create({ data: { invitationId: invitation.id, ...values } });

    res.status(201).json({
      success: true,
      message: "Terima kasih! Konfirmasi kehadiran dan doa restu Anda telah tersimpan.",
      data: rsvp,
    });
  } catch (error) {
    console.error("SubmitPublicRsvp Error:", error);
    res.status(500).json({ success: false, message: "Gagal mengirimkan RSVP." });
  }
};
