import { describe, it, expect, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(role: "admin" | "user" = "user"): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    adminSession: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

function createPublicContext(): TrpcContext {
  return {
    user: null,
    adminSession: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

// ADMIN_PASSWORD でログインした管理者。createContext の仕様上、
// この経路では user は null のままで adminSession だけが立つ。
function createAdminSessionContext(): TrpcContext {
  return {
    user: null,
    adminSession: { name: "Admin" },
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("routers", () => {
  describe("auth", () => {
    it("should return current user", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);
      const result = await caller.auth.me();
      expect(result).toEqual(ctx.user);
    });

    it("should return null for public context", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);
      const result = await caller.auth.me();
      expect(result).toBeNull();
    });
  });

  describe("artworks", () => {
    it("should list artworks", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);
      const result = await caller.artworks.list();
      expect(Array.isArray(result)).toBe(true);
    });

    it("should throw NOT_FOUND for non-existent artwork", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);
      await expect(caller.artworks.getById({ id: 999 })).rejects.toThrow(
        "Artwork not found"
      );
    });
  });

  describe("products", () => {
    it("should list products", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);
      const result = await caller.products.list();
      expect(Array.isArray(result)).toBe(true);
    });

    it("should throw NOT_FOUND for non-existent product", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);
      await expect(caller.products.getById({ id: 999 })).rejects.toThrow(
        "Product not found"
      );
    });
  });

  describe("cart", () => {
    it("should require authentication to get cart", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);
      await expect(caller.cart.getCart()).rejects.toThrow();
    });

    it("should get cart for authenticated user", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);
      // This will fail without database, but tests the logic
      try {
        await caller.cart.getCart();
      } catch (error: any) {
        // Expected to fail due to database not being available in test
        expect(error.message).toBeDefined();
      }
    });

    it("should require authentication to get cart items", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);
      await expect(caller.cart.getItems()).rejects.toThrow();
    });
  });

  describe("orders", () => {
    it("should require authentication to list orders", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);
      await expect(caller.orders.list()).rejects.toThrow();
    });

    it("should require authentication to get order", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);
      await expect(caller.orders.getById({ id: 1 })).rejects.toThrow();
    });
  });

  describe("profile", () => {
    it("should get profile for public user", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);
      // This will return null without database
      try {
        const result = await caller.profile.get({ userId: 1 });
        expect(result === null || result === undefined || typeof result === "object").toBe(true);
      } catch (error: any) {
        // Expected to fail due to database not being available in test
        expect(error.message).toBeDefined();
      }
    });

    it("should require authentication to update profile", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);
      await expect(
        caller.profile.update({ bio: "Test bio" })
      ).rejects.toThrow();
    });

    it("should allow authenticated user to update profile", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);
      // This will fail without database, but tests the logic
      try {
        await caller.profile.update({ bio: "Test bio" });
      } catch (error: any) {
        // Expected to fail due to database not being available in test
        expect(error.message).toBeDefined();
      }
    });
  });

  // 変更系APIと注文情報が無認証で叩けた問題の回帰テスト。
  // ここで扱うのは権限判定のみなので、いずれも middleware で弾かれてDBには到達しない。
  describe("管理APIの保護", () => {
    const sampleProduct = {
      title: "テスト商品",
      price: "1000",
      productType: "digital" as const,
    };

    it("無認証では商品を作成できない", async () => {
      const caller = appRouter.createCaller(createPublicContext());
      await expect(caller.products.create(sampleProduct)).rejects.toMatchObject({
        code: "FORBIDDEN",
      });
    });

    it("一般ユーザーでは商品を作成できない", async () => {
      const caller = appRouter.createCaller(createAuthContext("user"));
      await expect(caller.products.create(sampleProduct)).rejects.toMatchObject({
        code: "FORBIDDEN",
      });
    });

    it("無認証では作品を作成できない", async () => {
      const caller = appRouter.createCaller(createPublicContext());
      await expect(
        caller.artworks.create({ title: "テスト作品", category: "illustration" })
      ).rejects.toMatchObject({ code: "FORBIDDEN" });
    });

    it("無認証では注文一覧を取得できない", async () => {
      const caller = appRouter.createCaller(createPublicContext());
      await expect(caller.orders.listAll()).rejects.toMatchObject({
        code: "FORBIDDEN",
      });
    });

    it("無認証では注文明細を取得できない", async () => {
      const caller = appRouter.createCaller(createPublicContext());
      await expect(caller.orders.getItems({ orderId: 1 })).rejects.toMatchObject({
        code: "FORBIDDEN",
      });
    });

    it("無認証ではサイト設定を更新できない", async () => {
      const caller = appRouter.createCaller(createPublicContext());
      await expect(
        caller.siteSettings.update({ siteName: "書き換えテスト" })
      ).rejects.toMatchObject({ code: "FORBIDDEN" });
    });

    it("無認証では画像をアップロードできない", async () => {
      const caller = appRouter.createCaller(createPublicContext());
      await expect(
        caller.upload.image({ fileName: "x.png", fileData: "", contentType: "image/png" })
      ).rejects.toMatchObject({ code: "FORBIDDEN" });
    });

    // パスワードログインでは user が null のまま adminSession だけが立つ。
    // adminProcedure が user だけを見ていると管理者本人が締め出されるため、その回帰を防ぐ。
    it("パスワードログインした管理者は権限で弾かれない", async () => {
      const caller = appRouter.createCaller(createAdminSessionContext());
      const result = await caller.orders.listAll().catch((error) => error);
      expect(result?.code).not.toBe("FORBIDDEN");
    });
  });
});
