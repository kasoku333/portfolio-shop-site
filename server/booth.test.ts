import { describe, it, expect } from "vitest";
import { TRPCError } from "@trpc/server";
import { isBoothUrl } from "@shared/booth";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

describe("isBoothUrl", () => {
  it.each([
    "https://booth.pm/ja/items/1234567",
    "https://kokage.booth.pm/items/1234567",
  ])("accepts %s", url => {
    expect(isBoothUrl(url)).toBe(true);
  });

  it.each([
    "http://kokage.booth.pm/items/1",
    "https://booth.pm.example.com/items/1",
    "https://evilbooth.pm/items/1",
    "javascript:alert(1)",
    "not a url",
    "",
  ])("rejects %s", url => {
    expect(isBoothUrl(url)).toBe(false);
  });
});

describe("products.create boothUrl", () => {
  const admin = appRouter.createCaller({
    user: null,
    adminSession: { name: "管理者" },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  });
  const base = { title: "x", price: "500", productType: "digital" as const };

  it("rejects a non-BOOTH link before touching the DB", async () => {
    await expect(
      admin.products.create({ ...base, boothUrl: "javascript:alert(1)" })
    ).rejects.toSatisfy(
      (e: unknown) => e instanceof TRPCError && e.code === "BAD_REQUEST"
    );
  });

  it("lets a BOOTH link and an empty value through validation", async () => {
    for (const boothUrl of ["https://kokage.booth.pm/items/1", ""]) {
      // DB が無いので最後は落ちるが、入力チェックでは弾かれないこと
      await expect(admin.products.create({ ...base, boothUrl })).rejects.not.toSatisfy(
        (e: unknown) => e instanceof TRPCError && e.code === "BAD_REQUEST"
      );
    }
  });
});
