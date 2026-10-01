// Panjang kata terpanjang; tema memakainya untuk mengecilkan nama yang tidak muat di layar HP.
export const longestWordLength = (...names: Array<string | null | undefined>): number =>
  Math.max(0, ...names.flatMap((n) => (n ?? "").trim().split(/\s+/)).map((w) => w.length));
