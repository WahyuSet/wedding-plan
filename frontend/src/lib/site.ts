// Di domain undangan, backend menyajikan index.html dengan <meta name="wp-site" content="invitation">.
const siteMeta =
  typeof document === "undefined"
    ? null
    : document.querySelector('meta[name="wp-site"]')?.getAttribute("content");

/** Halaman ini disajikan backend di domain undangan, jadi API berada di origin yang sama. */
export const servedByBackend = siteMeta === "invitation";

/**
 * Aplikasi berjalan sebagai situs undangan: slug pasangan langsung di akar path dan tanpa
 * route dashboard. VITE_SITE=invitation hanya untuk mengerjakan tampilannya lewat Vite dev server.
 */
export const isInvitationSite = servedByBackend || import.meta.env.VITE_SITE === "invitation";
