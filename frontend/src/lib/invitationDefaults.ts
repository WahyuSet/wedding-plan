// Skema database (backend/prisma/schema.prisma) masih memberi dua foto contoh ini pada undangan baru.
// Keduanya foto orang lain, jadi diperlakukan sebagai "belum diisi" agar tidak tampil ke tamu.
const SCHEMA_DEFAULT_PHOTOS = new Set([
  "https://images.unsplash.com/photo-1519741497674-611481863552?w=1600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=1600&auto=format&fit=crop&q=80",
]);

export const withoutSchemaDefaultPhoto = (url?: string | null): string | null => {
  const value = url?.trim();
  return value && !SCHEMA_DEFAULT_PHOTOS.has(value) ? value : null;
};
