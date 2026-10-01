import { env } from "../config/env.js";

const MAX_GUEST_KEY_LENGTH = 120;
const MAX_NAME_PART_LENGTH = 40;
const MIN_CODE_LENGTH = 4;
const MAX_CODE_LENGTH = 32;

/**
 * Segmen tamu di URL berbentuk "nama-kode"; hanya kodenya yang menentukan tamu.
 * Kode lama (base64url) bisa mengandung "-", jadi kandidatnya adalah seluruh segmen
 * ditambah setiap sufiks setelah "-", lalu dicocokkan dengan satu query `code IN (...)`.
 */
export const guestCodeCandidates = (key: string): string[] => {
  const value = key.trim();
  if (!value || value.length > MAX_GUEST_KEY_LENGTH) return [];

  const candidates = new Set<string>();
  const add = (code: string) => {
    if (code.length >= MIN_CODE_LENGTH && code.length <= MAX_CODE_LENGTH) candidates.add(code);
  };

  add(value);
  for (let i = value.indexOf("-"); i !== -1; i = value.indexOf("-", i + 1)) add(value.slice(i + 1));
  return [...candidates];
};

/** Bentuk kanonik segmen tamu. Nama tanpa huruf latin menghasilkan kode saja. */
export const guestKey = (guest: { slug: string; code: string | null }): string | null => {
  if (!guest.code) return null;
  const name = guest.slug.slice(0, MAX_NAME_PART_LENGTH).replace(/-+$/, "");
  return name ? `${name}-${guest.code}` : guest.code;
};

type UrlConfig = Pick<typeof env, "INVITATION_URL" | "FRONTEND_URL">;

/** Origin domain undangan, atau null bila undangan masih disajikan di domain dashboard. */
export const invitationOrigin = (config: UrlConfig = env): string | null =>
  config.INVITATION_URL ? new URL(config.INVITATION_URL).origin : null;

export const invitationBaseUrl = (config: UrlConfig = env): string =>
  invitationOrigin(config) ?? `${config.FRONTEND_URL.replace(/\/$/, "")}/invitation`;

export const buildInvitationUrl = (slug: string, key?: string | null, config: UrlConfig = env): string => {
  const base = `${invitationBaseUrl(config)}/${encodeURIComponent(slug)}`;
  return key ? `${base}/${encodeURIComponent(key)}` : base;
};
