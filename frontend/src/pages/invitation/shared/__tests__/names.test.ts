import { describe, expect, it } from "vitest";
import { longestWordLength } from "../names.js";

describe("longestWordLength", () => {
  it("mengambil kata terpanjang dari semua nama", () => {
    expect(longestWordLength("Raditya", "Anindya")).toBe(7);
    expect(longestWordLength("Fadhlurrahman", "Rahayuningtyas")).toBe(14);
  });

  it("menghitung per kata, bukan per nama", () => {
    expect(longestWordLength("Muhammad Rizky", "Siti Nurhaliza")).toBe(9);
  });

  it("aman untuk nilai kosong", () => {
    expect(longestWordLength()).toBe(0);
    expect(longestWordLength("", null, undefined, "   ")).toBe(0);
  });
});
