import { describe, expect, it } from "vitest";
import { withoutSchemaDefaultPhoto } from "../invitationDefaults.js";
import { parseInvitation } from "../../pages/invitation/shared/parseInvitation.js";
import type { DigitalInvitation } from "../../types/index.js";

const SCHEMA_COVER = "https://images.unsplash.com/photo-1519741497674-611481863552?w=1600&auto=format&fit=crop&q=80";
const SCHEMA_HERO = "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=1600&auto=format&fit=crop&q=80";

describe("withoutSchemaDefaultPhoto", () => {
  it("menganggap foto bawaan skema sebagai kosong", () => {
    expect(withoutSchemaDefaultPhoto(SCHEMA_COVER)).toBeNull();
    expect(withoutSchemaDefaultPhoto(SCHEMA_HERO)).toBeNull();
  });

  it("mempertahankan foto pilihan pengguna, termasuk pilihan Master Galeri", () => {
    const preset = "https://images.unsplash.com/photo-1519741497674-611481863552?w=1600&auto=format&fit=crop&q=85";
    expect(withoutSchemaDefaultPhoto(preset)).toBe(preset);
    expect(withoutSchemaDefaultPhoto("https://contoh.id/foto.jpg")).toBe("https://contoh.id/foto.jpg");
  });

  it("aman untuk nilai kosong", () => {
    expect(withoutSchemaDefaultPhoto(null)).toBeNull();
    expect(withoutSchemaDefaultPhoto(undefined)).toBeNull();
    expect(withoutSchemaDefaultPhoto("  ")).toBeNull();
  });
});

describe("parseInvitation", () => {
  it("tidak meneruskan foto bawaan skema ke tema", () => {
    const parsed = parseInvitation({ coverPhotoUrl: SCHEMA_COVER, heroPhotoUrl: SCHEMA_HERO } as DigitalInvitation);
    expect(parsed.invitation.coverPhotoUrl).toBeNull();
    expect(parsed.invitation.heroPhotoUrl).toBeNull();
  });

  it("meneruskan foto pengguna apa adanya", () => {
    const parsed = parseInvitation({ coverPhotoUrl: "https://contoh.id/sampul.jpg", heroPhotoUrl: null } as DigitalInvitation);
    expect(parsed.invitation.coverPhotoUrl).toBe("https://contoh.id/sampul.jpg");
    expect(parsed.invitation.heroPhotoUrl).toBeNull();
  });
});
