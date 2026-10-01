import { describe, expect, it } from "vitest";
import { guestKey, invitationPath, publicInvitationUrl, shareInvitationUrl } from "../invitationLinks.js";

describe("guestKey", () => {
  it("menggabungkan slug nama dan kode", () => {
    expect(guestKey({ slug: "jokowi", code: "x7k2mq" })).toBe("jokowi-x7k2mq");
    expect(guestKey({ slug: "bpk-andi-istri", code: "x7k2mq" })).toBe("bpk-andi-istri-x7k2mq");
  });

  it("memotong nama panjang tanpa menyisakan tanda hubung di ujung", () => {
    const slug = "keluarga-besar-bapak-haji-muhammad-agus-santoso";
    expect(slug.slice(0, 40).endsWith("-")).toBe(true);
    expect(guestKey({ slug, code: "x7k2mq" })).toBe("keluarga-besar-bapak-haji-muhammad-agus-x7k2mq");
  });

  it("nama tanpa huruf latin memakai kode saja", () => {
    expect(guestKey({ slug: "", code: "x7k2mq" })).toBe("x7k2mq");
  });

  it("tamu tanpa kode tidak punya tautan personal", () => {
    expect(guestKey({ slug: "jokowi", code: null })).toBeNull();
  });
});

describe("tautan undangan", () => {
  it("path undangan umum dan personal", () => {
    expect(invitationPath("r-j")).toBe("/invitation/r-j");
    expect(invitationPath("r-j", "jokowi-x7k2mq")).toBe("/invitation/r-j/jokowi-x7k2mq");
    expect(invitationPath("r-j", null)).toBe("/invitation/r-j");
  });

  it("di situs undangan slug langsung di akar path", () => {
    expect(invitationPath("r-j", null, true)).toBe("/r-j");
    expect(invitationPath("r-j", "jokowi-x7k2mq", true)).toBe("/r-j/jokowi-x7k2mq");
  });

  it("tautan share memuat segmen tamu di path, bukan query", () => {
    expect(shareInvitationUrl("r-j", "jokowi-x7k2mq")).toMatch(/\/share\/r-j\/jokowi-x7k2mq$/);
    expect(shareInvitationUrl("r-j")).toMatch(/\/share\/r-j$/);
    expect(shareInvitationUrl("r-j", null, null)).toMatch(/\/share\/r-j$/);
  });

  it("dengan domain undangan, tautan buka dan tautan bagikan sama-sama langsung ke domain itu", () => {
    const domain = "https://undangan.com";
    expect(publicInvitationUrl("r-j", null, domain)).toBe("https://undangan.com/r-j");
    expect(publicInvitationUrl("r-j", "jokowi-x7k2mq", domain)).toBe("https://undangan.com/r-j/jokowi-x7k2mq");
    expect(shareInvitationUrl("r-j", "jokowi-x7k2mq", domain)).toBe("https://undangan.com/r-j/jokowi-x7k2mq");
    expect(shareInvitationUrl("r-j", null, domain)).toBe("https://undangan.com/r-j");
  });

  it("slug yang belum dirapikan di-encode agar tidak memecah URL", () => {
    expect(publicInvitationUrl("R&J", null, "https://undangan.com")).toBe("https://undangan.com/R%26J");
    expect(invitationPath("a/b", null, true)).toBe("/a%2Fb");
  });
});
