export const GUEST_CATEGORIES = ["keluarga", "sahabat", "vip", "rekan_kerja"] as const;
export type GuestCategory = (typeof GUEST_CATEGORIES)[number];

export interface GuestDraft {
  name: string;
  category?: GuestCategory;
  phone?: string;
}

const CATEGORY_ALIASES: Record<string, GuestCategory> = {
  keluarga: "keluarga",
  sahabat: "sahabat",
  teman: "sahabat",
  vip: "vip",
  rekan_kerja: "rekan_kerja",
  "rekan kerja": "rekan_kerja",
  rekan: "rekan_kerja",
};

const looksLikePhone = (text: string): boolean => /^\+?[0-9][0-9\s-]{5,}$/.test(text);

// Satu baris = "Nama, kategori, 08xx". Kategori dan nomor opsional dan boleh berbeda urutan.
export const parseGuestLines = (input: string): { guests: GuestDraft[]; skipped: number } => {
  const guests: GuestDraft[] = [];
  let skipped = 0;

  for (const rawLine of input.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) continue;
    const [name, ...rest] = line.split(",").map((part) => part.trim());
    if (!name || name.length > 80) {
      skipped++;
      continue;
    }
    const guest: GuestDraft = { name };
    for (const token of rest) {
      const alias = CATEGORY_ALIASES[token.toLowerCase()];
      if (alias) guest.category = alias;
      else if (looksLikePhone(token)) guest.phone = token;
    }
    guests.push(guest);
  }

  return { guests, skipped };
};
