import { describe, expect, it } from "vitest";
import { parseGuestLines } from "../guestImport.js";
import { buildWaLink, toWaNumber } from "../whatsapp.js";

describe("toWaNumber", () => {
  it("menormalkan format nomor Indonesia", () => {
    expect(toWaNumber("0812-3456-7890")).toBe("6281234567890");
    expect(toWaNumber("+62 812 3456 7890")).toBe("6281234567890");
    expect(toWaNumber("6281234567890")).toBe("6281234567890");
    expect(toWaNumber("81234567890")).toBe("6281234567890");
  });

  it("null untuk input tidak valid", () => {
    expect(toWaNumber("")).toBeNull();
    expect(toWaNumber(null)).toBeNull();
    expect(toWaNumber("abc")).toBeNull();
    expect(toWaNumber("0812")).toBeNull();
  });

  it("membuat tautan wa.me dengan teks ter-encode", () => {
    const link = buildWaLink("0812345678901", "Halo & selamat")!;
    expect(link).toBe("https://wa.me/62812345678901?text=Halo%20%26%20selamat");
    expect(buildWaLink(null, "x")).toBeNull();
  });
});

describe("parseGuestLines", () => {
  it("mengurai baris nama, kategori, telepon", () => {
    const { guests, skipped } = parseGuestLines(
      "Bpk. Andi, keluarga, 0812-1111-2222\nIbu Rina, teman\n\nDoni, 08133334444\nKeluarga Besar Santoso"
    );
    expect(skipped).toBe(0);
    expect(guests).toEqual([
      { name: "Bpk. Andi", category: "keluarga", phone: "0812-1111-2222" },
      { name: "Ibu Rina", category: "sahabat" },
      { name: "Doni", phone: "08133334444" },
      { name: "Keluarga Besar Santoso" },
    ]);
  });

  it("melewati baris tanpa nama atau terlalu panjang", () => {
    const { guests, skipped } = parseGuestLines(`, vip\n${"x".repeat(81)}\nOke`);
    expect(guests).toEqual([{ name: "Oke" }]);
    expect(skipped).toBe(2);
  });
});
