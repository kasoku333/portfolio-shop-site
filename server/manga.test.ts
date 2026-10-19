import { describe, it, expect } from "vitest";
import { getMangaPages, isPageImageUrl, MAX_MANGA_PAGES } from "@shared/manga";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createAdminContext(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "admin",
      email: "admin@example.com",
      name: "Admin",
      loginMethod: "google",
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("isPageImageUrl", () => {
  it("upload.image が返す形の URL を通す", () => {
    expect(isPageImageUrl("/uploads/uploads/V1StGXR8_Z5jdHi6B-myT.png")).toBe(
      true
    );
    expect(isPageImageUrl("/uploads/abc.webp")).toBe(true);
  });

  it("S3 時代に登録した https の画像 URL も通す", () => {
    expect(isPageImageUrl("https://example.cloudfront.net/a.png")).toBe(true);
  });

  it("別スキーム・http・上の階層へ辿るパス・SVG を弾く", () => {
    expect(isPageImageUrl("javascript:alert(1)")).toBe(false);
    expect(isPageImageUrl("data:image/png;base64,AAAA")).toBe(false);
    expect(isPageImageUrl("http://example.com/a.png")).toBe(false);
    expect(isPageImageUrl("/uploads/../secret.png")).toBe(false);
    expect(isPageImageUrl("/uploads/a.svg")).toBe(false);
  });
});

describe("getMangaPages", () => {
  it("pages があればその順で返す", () => {
    expect(
      getMangaPages({
        pages: ["/uploads/a.png", "/uploads/b.png"],
        imageUrl: "/uploads/a.png",
      })
    ).toEqual(["/uploads/a.png", "/uploads/b.png"]);
  });

  it("ページ欄ができる前の漫画は表紙1枚として扱う", () => {
    expect(getMangaPages({ pages: null, imageUrl: "/uploads/a.png" })).toEqual([
      "/uploads/a.png",
    ]);
    expect(getMangaPages({ pages: [], imageUrl: "/uploads/a.png" })).toEqual([
      "/uploads/a.png",
    ]);
  });

  it("画像が1枚も無ければ空", () => {
    expect(getMangaPages({ pages: null, imageUrl: null })).toEqual([]);
  });
});

describe("artworks.create の pages 入力", () => {
  // DB に届く前の入力チェックで落ちることを確かめる（テストは DB 無しで走る）
  it("受け付けない URL が混ざっていたら弾く", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    await expect(
      caller.artworks.create({
        title: "x",
        category: "manga",
        pages: ["/uploads/a.png", "javascript:alert(1)"],
      })
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("上限を超えるページ数を弾く", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    const pages = Array.from(
      { length: MAX_MANGA_PAGES + 1 },
      (_, i) => `/uploads/p${i}.png`
    );
    await expect(
      caller.artworks.create({ title: "x", category: "manga", pages })
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});
