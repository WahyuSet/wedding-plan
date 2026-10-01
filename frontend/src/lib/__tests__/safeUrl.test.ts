import { describe, expect, it } from "vitest";
import { instagramHref, safeHref } from "../safeUrl.js";

describe("safeHref", () => {
  it("mengizinkan http(s)", () => {
    expect(safeHref("https://maps.app.goo.gl/abc")).toBe("https://maps.app.goo.gl/abc");
    expect(safeHref("http://example.com")).toBe("http://example.com/");
  });

  it("menolak skema berbahaya dan input kosong", () => {
    expect(safeHref("javascript:alert(1)")).toBeUndefined();
    expect(safeHref("data:text/html,<script>1</script>")).toBeUndefined();
    expect(safeHref("//evil.com")).toBeUndefined();
    expect(safeHref("")).toBeUndefined();
    expect(safeHref(null)).toBeUndefined();
  });
});

describe("instagramHref", () => {
  it("membentuk tautan dari handle", () => {
    expect(instagramHref("@budi.santoso")).toBe("https://instagram.com/budi.santoso");
  });

  it("menolak handle tidak valid", () => {
    expect(instagramHref("budi/../../x")).toBeUndefined();
    expect(instagramHref("")).toBeUndefined();
  });
});
