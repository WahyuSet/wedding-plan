// Hanya izinkan http(s) untuk tautan yang berasal dari input pengguna.
export const safeHref = (value?: string | null): string | undefined => {
  if (!value) return undefined;
  try {
    const url = new URL(value.trim());
    return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : undefined;
  } catch {
    return undefined;
  }
};

export const instagramHref = (handle?: string | null): string | undefined => {
  const clean = handle?.trim().replace(/^@/, "");
  if (!clean || !/^[A-Za-z0-9._]{1,30}$/.test(clean)) return undefined;
  return `https://instagram.com/${clean}`;
};
