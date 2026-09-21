import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { AuthRequest } from "../types/index.js";

// Helper to format string to clean URL slug
function createSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// ─────────────────────────────────────────────
// ADMIN ENDPOINTS (Require Authentication)
// ─────────────────────────────────────────────

/**
 * Get or auto-initialize the digital invitation configuration for logged-in user
 */
export const getInvitationConfig = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const profileId = req.user!.profileId;

    const profile = await prisma.weddingProfile.findUnique({
      where: { id: profileId },
      include: {
        digitalInvitation: {
          include: {
            rsvps: {
              orderBy: { createdAt: "desc" },
            },
            guests: {
              orderBy: { createdAt: "desc" },
            },
          },
        },
      },
    });

    if (!profile) {
      res.status(404).json({ success: false, message: "Profil pernikahan tidak ditemukan." });
      return;
    }

    let invitation = profile.digitalInvitation;

    // If not exists, auto create default
    if (!invitation) {
      const baseSlug = createSlug(
        `${profile.groomName || "groom"}-${profile.brideName || "bride"}`
      ) || `wedding-${Date.now().toString(36)}`;

      // Check if slug is taken, if so make it unique
      let finalSlug = baseSlug;
      const existing = await prisma.digitalInvitation.findUnique({ where: { slug: finalSlug } });
      if (existing) {
        finalSlug = `${baseSlug}-${Math.floor(1000 + Math.random() * 9000)}`;
      }

      invitation = await prisma.digitalInvitation.create({
        data: {
          profileId,
          slug: finalSlug,
          theme: "noir-calla",
          title: "The Wedding of",
          groomFullName: profile.groomName || "Mempelai Pria",
          groomNickName: profile.groomName?.split(" ")[0] || "Pria",
          brideFullName: profile.brideName || "Mempelai Wanita",
          brideNickName: profile.brideName?.split(" ")[0] || "Wanita",
          akadDate: profile.weddingDate || new Date(),
          akadVenueName: profile.venue || "Masjid Agung",
          akadAddress: profile.venue || "Jl. Bahagia No. 1",
          resepsiDate: profile.weddingDate || new Date(),
          resepsiVenueName: profile.venue || "Grand Ballroom Hotel",
          resepsiAddress: profile.venue || "Jl. Bahagia No. 1",
          loveStory: JSON.stringify([
            { year: "2022", title: "Pertama Bertemu", story: "Tak sengaja berjumpa di sebuah acara dan mulai saling menyapa." },
            { year: "2024", title: "Momen Lamaran", story: "Dengan restu kedua keluarga, kami memutuskan untuk mengikat janji suci." },
            { year: "2026", title: "Menuju Halal", story: "Melangkah bersama dalam ikatan suci pernikahan yang penuh berkah." },
          ]),
          galleryPhotos: JSON.stringify([
            { url: "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&auto=format&fit=crop&q=80", caption: "Prewedding Chapter 1" },
            { url: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800&auto=format&fit=crop&q=80", caption: "Prewedding Chapter 2" },
            { url: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&auto=format&fit=crop&q=80", caption: "Prewedding Chapter 3" },
          ]),
          bankAccounts: JSON.stringify([
            { bankName: "BCA", accountNumber: "1234567890", accountHolder: profile.groomName || "Mempelai Pria" },
            { bankName: "Mandiri", accountNumber: "0987654321", accountHolder: profile.brideName || "Mempelai Wanita" },
          ]),
          giftAddress: profile.venue || "Jl. Cinta Abadi No. 99, Jakarta",
        },
        include: {
          rsvps: true,
          guests: true,
        },
      });
    }

    res.json({
      success: true,
      data: invitation,
    });
  } catch (error) {
    console.error("GetInvitationConfig Error:", error);
    res.status(500).json({ success: false, message: "Gagal memuat pengaturan undangan." });
  }
};

/**
 * Update invitation configuration
 */
export const updateInvitationConfig = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const profileId = req.user!.profileId;
    const body = req.body;

    const current = await prisma.digitalInvitation.findUnique({
      where: { profileId },
    });

    if (!current) {
      res.status(404).json({ success: false, message: "Data undangan belum diinisialisasi." });
      return;
    }

    // If slug changed, verify uniqueness
    if (body.slug && body.slug !== current.slug) {
      const cleanNewSlug = createSlug(body.slug);
      const slugExists = await prisma.digitalInvitation.findFirst({
        where: {
          slug: cleanNewSlug,
          NOT: { id: current.id },
        },
      });

      if (slugExists) {
        res.status(400).json({
          success: false,
          message: "Tautan URL / slug ini sudah digunakan. Silakan gunakan nama lain.",
        });
        return;
      }
      body.slug = cleanNewSlug;
    }

    const updated = await prisma.digitalInvitation.update({
      where: { id: current.id },
      data: {
        slug: body.slug ? createSlug(body.slug) : undefined,
        theme: body.theme,
        title: body.title,
        openingQuote: body.openingQuote,
        quoteSource: body.quoteSource,
        bgMusicUrl: body.bgMusicUrl,
        isMusicAutoPlay: body.isMusicAutoPlay !== undefined ? Boolean(body.isMusicAutoPlay) : undefined,
        isPublished: body.isPublished !== undefined ? Boolean(body.isPublished) : undefined,

        coverPhotoUrl: body.coverPhotoUrl,
        heroPhotoUrl: body.heroPhotoUrl,

        groomFullName: body.groomFullName,
        groomNickName: body.groomNickName,
        groomFather: body.groomFather,
        groomMother: body.groomMother,
        groomInstagram: body.groomInstagram,
        groomPhotoUrl: body.groomPhotoUrl,

        brideFullName: body.brideFullName,
        brideNickName: body.brideNickName,
        brideFather: body.brideFather,
        brideMother: body.brideMother,
        brideInstagram: body.brideInstagram,
        bridePhotoUrl: body.bridePhotoUrl,

        akadDate: body.akadDate ? new Date(body.akadDate) : undefined,
        akadStartTime: body.akadStartTime,
        akadEndTime: body.akadEndTime,
        akadVenueName: body.akadVenueName,
        akadAddress: body.akadAddress,
        akadMapUrl: body.akadMapUrl,

        resepsiDate: body.resepsiDate ? new Date(body.resepsiDate) : undefined,
        resepsiStartTime: body.resepsiStartTime,
        resepsiEndTime: body.resepsiEndTime,
        resepsiVenueName: body.resepsiVenueName,
        resepsiAddress: body.resepsiAddress,
        resepsiMapUrl: body.resepsiMapUrl,

        loveStory: typeof body.loveStory === "object" ? JSON.stringify(body.loveStory) : body.loveStory,
        galleryPhotos: typeof body.galleryPhotos === "object" ? JSON.stringify(body.galleryPhotos) : body.galleryPhotos,
        bankAccounts: typeof body.bankAccounts === "object" ? JSON.stringify(body.bankAccounts) : body.bankAccounts,
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
export const addGuest = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const profileId = req.user!.profileId;
    const { name, phone, category } = req.body;

    if (!name || !name.trim()) {
      res.status(400).json({ success: false, message: "Nama tamu wajib diisi." });
      return;
    }

    const invitation = await prisma.digitalInvitation.findUnique({
      where: { profileId },
    });

    if (!invitation) {
      res.status(404).json({ success: false, message: "Undangan tidak ditemukan." });
      return;
    }

    const guest = await prisma.invitationGuest.create({
      data: {
        invitationId: invitation.id,
        name: name.trim(),
        slug: createSlug(name.trim()),
        phone: phone || null,
        category: category || "keluarga",
      },
    });

    res.status(201).json({
      success: true,
      message: "Tamu berhasil ditambahkan.",
      data: guest,
    });
  } catch (error) {
    console.error("AddGuest Error:", error);
    res.status(500).json({ success: false, message: "Gagal menambahkan tamu." });
  }
};

export const deleteGuest = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { guestId } = req.params;
    await prisma.invitationGuest.delete({ where: { id: guestId } });
    res.json({ success: true, message: "Tamu berhasil dihapus." });
  } catch (error) {
    console.error("DeleteGuest Error:", error);
    res.status(500).json({ success: false, message: "Gagal menghapus tamu." });
  }
};

export const deleteRsvp = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { rsvpId } = req.params;
    await prisma.invitationRsvp.delete({ where: { id: rsvpId } });
    res.json({ success: true, message: "Ucapan RSVP berhasil dihapus." });
  } catch (error) {
    console.error("DeleteRsvp Error:", error);
    res.status(500).json({ success: false, message: "Gagal menghapus ucapan." });
  }
};

// ─────────────────────────────────────────────
// PUBLIC ENDPOINTS (NO AUTH REQUIRED)
// ─────────────────────────────────────────────

/**
 * Fetch public invitation details by slug
 */
export const getPublicInvitation = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;

    const invitation = await prisma.digitalInvitation.findUnique({
      where: { slug },
      include: {
        rsvps: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!invitation) {
      res.status(404).json({
        success: false,
        message: "Undangan tidak ditemukan atau tautan salah.",
      });
      return;
    }

    if (!invitation.isPublished) {
      res.status(403).json({
        success: false,
        message: "Undangan ini saat ini belum dipublikasikan oleh pemiliknya.",
      });
      return;
    }

    // Safely parse JSON fields
    let parsedLoveStory = [];
    let parsedGallery = [];
    let parsedBankAccounts = [];

    try {
      if (invitation.loveStory) parsedLoveStory = JSON.parse(invitation.loveStory);
    } catch (_) {}

    try {
      if (invitation.galleryPhotos) parsedGallery = JSON.parse(invitation.galleryPhotos);
    } catch (_) {}

    try {
      if (invitation.bankAccounts) parsedBankAccounts = JSON.parse(invitation.bankAccounts);
    } catch (_) {}

    res.json({
      success: true,
      data: {
        ...invitation,
        loveStory: parsedLoveStory,
        galleryPhotos: parsedGallery,
        bankAccounts: parsedBankAccounts,
      },
    });
  } catch (error) {
    console.error("GetPublicInvitation Error:", error);
    res.status(500).json({ success: false, message: "Gagal memuat undangan." });
  }
};

/**
 * Submit RSVP and warm wishes publicly from guest
 */
export const submitPublicRsvp = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;
    const { guestName, attendanceStatus, guestCount, message } = req.body;

    if (!guestName || !guestName.trim()) {
      res.status(400).json({ success: false, message: "Nama tamu wajib diisi." });
      return;
    }

    const invitation = await prisma.digitalInvitation.findUnique({
      where: { slug },
    });

    if (!invitation || !invitation.isPublished) {
      res.status(404).json({ success: false, message: "Undangan tidak ditemukan." });
      return;
    }

    const rsvp = await prisma.invitationRsvp.create({
      data: {
        invitationId: invitation.id,
        guestName: guestName.trim(),
        attendanceStatus: attendanceStatus || "hadir",
        guestCount: Number(guestCount) || 1,
        message: message ? message.trim() : null,
      },
    });

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
