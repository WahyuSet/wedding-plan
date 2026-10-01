import { API_BASE_URL } from "./api.js";
import { isInvitationSite } from "./site.js";

const MAX_NAME_PART_LENGTH = 40;

// Alamat backend tanpa akhiran /api. Bila API dipasang relatif (VITE_API_URL="/api", backend di
// balik reverse proxy pada domain yang sama), alamatnya dilengkapi dengan origin halaman agar
// tautan yang disalin tetap utuh.
export const resolveApiOrigin = (apiBaseUrl: string, pageOrigin: () => string): string => {
  const base = apiBaseUrl.replace(/\/api\/?$/, "");
  return /^https?:\/\//i.test(base) ? base : `${pageOrigin()}${base}`;
};

const apiOrigin = (): string => resolveApiOrigin(API_BASE_URL, () => window.location.origin);

const guestSegment = (key?: string | null): string => (key ? `/${encodeURIComponent(key)}` : "");

// Segmen tamu di tautan: "nama-kode". Hanya kodenya yang menentukan tamu, jadi nama
// tanpa huruf latin (slug kosong) cukup memakai kode. Harus sama dengan guestKey di backend.
export const guestKey = (guest: { slug: string; code: string | null }): string | null => {
  if (!guest.code) return null;
  const name = guest.slug.slice(0, MAX_NAME_PART_LENGTH).replace(/-+$/, "");
  return name ? `${name}-${guest.code}` : guest.code;
};

// Path halaman undangan: di situs undangan slug langsung di akar, di dashboard di bawah /invitation.
export const invitationPath = (slug: string, key?: string | null, onInvitationSite = isInvitationSite): string =>
  `${onInvitationSite ? "" : "/invitation"}/${encodeURIComponent(slug)}${guestSegment(key)}`;

// Tautan langsung ke halaman undangan. `invitationUrl` adalah origin domain undangan dari
// pengaturan publik backend; bila kosong, undangan dibuka di domain dashboard.
export const publicInvitationUrl = (slug: string, key?: string | null, invitationUrl?: string | null): string =>
  invitationUrl
    ? `${invitationUrl}${invitationPath(slug, key, true)}`
    : `${window.location.origin}${invitationPath(slug, key, false)}`;

// Tautan yang dibagikan ke tamu. Domain undangan sudah memuat pratinjau WhatsApp/sosmed sendiri.
// Tanpa domain undangan, tautannya lewat /share di backend yang memuat pratinjau itu lalu
// mengarahkan ke halaman undangan.
export const shareInvitationUrl = (slug: string, key?: string | null, invitationUrl?: string | null): string =>
  invitationUrl
    ? publicInvitationUrl(slug, key, invitationUrl)
    : `${apiOrigin()}/share/${encodeURIComponent(slug)}${guestSegment(key)}`;
