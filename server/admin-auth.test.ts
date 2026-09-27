import { describe, it, expect, vi } from "vitest";
import { TRPCError } from "@trpc/server";
import type { TrpcContext } from "./_core/context";

const storagePut = vi.hoisted(() =>
  vi.fn(async (key: string) => ({ key, url: `/uploads/${key}` }))
);
vi.mock("./storage", () => ({ storagePut }));

const { appRouter } = await import("./routers");

function baseContext(): TrpcContext {
  return {
    user: null,
    adminSession: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

function publicCaller() {
  return appRouter.createCaller(baseContext());
}

function userCaller(role: "user" | "admin") {
  return appRouter.createCaller({
    ...baseContext(),
    user: {
      id: 1,
      openId: "google-sub",
      email: "someone@example.com",
      name: "Someone",
      loginMethod: "google",
      role,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
  });
}

function passwordAdminCaller() {
  return appRouter.createCaller({ ...baseContext(), adminSession: { name: "管理者" } });
}

async function expectForbidden(promise: Promise<unknown>) {
  await expect(promise).rejects.toSatisfy(
    (e: unknown) => e instanceof TRPCError && e.code === "FORBIDDEN"
  );
}

// 管理者でなくても、認可を通過したかどうか（= FORBIDDEN 以外で落ちる）だけを見る
async function expectNotForbidden(promise: Promise<unknown>) {
  try {
    await promise;
  } catch (e) {
    expect(e instanceof TRPCError && e.code === "FORBIDDEN").toBe(false);
  }
}

const adminCalls: Array<[string, (c: ReturnType<typeof publicCaller>) => Promise<unknown>]> = [
  ["artworks.create", c => c.artworks.create({ title: "x", category: "illustration" })],
  ["artworks.update", c => c.artworks.update({ id: 1, title: "x" })],
  ["artworks.delete", c => c.artworks.delete({ id: 1 })],
  ["products.create", c => c.products.create({ title: "x", price: "100", productType: "digital" })],
  ["products.update", c => c.products.update({ id: 1, price: "1" })],
  ["products.delete", c => c.products.delete({ id: 1 })],
  ["orders.listAll", c => c.orders.listAll()],
  ["orders.getById", c => c.orders.getById({ id: 1 })],
  ["orders.getItems", c => c.orders.getItems({ orderId: 1 })],
  ["orders.updateStatus", c => c.orders.updateStatus({ id: 1, status: "cancelled" })],
  ["siteSettings.update", c => c.siteSettings.update({ siteName: "hacked" })],
  ["upload.image", c => c.upload.image({ fileName: "a.png", fileData: "", contentType: "image/png" })],
];

describe("admin-only endpoints", () => {
  it.each(adminCalls)("%s rejects anonymous callers", async (_, call) => {
    await expectForbidden(call(publicCaller()));
  });

  it.each(adminCalls)("%s rejects logged-in non-admin users", async (_, call) => {
    await expectForbidden(call(userCaller("user")));
  });

  it("lets a password-login admin through", async () => {
    await expectNotForbidden(passwordAdminCaller().artworks.delete({ id: 1 }));
  });

  it("lets an OAuth user with the admin role through", async () => {
    await expectNotForbidden(userCaller("admin").artworks.delete({ id: 1 }));
  });
});

describe("upload.image", () => {
  it("rejects SVG and other non-raster types", async () => {
    await expect(
      passwordAdminCaller().upload.image({
        fileName: "x.svg",
        fileData: "",
        contentType: "image/svg+xml",
      })
    ).rejects.toSatisfy((e: unknown) => e instanceof TRPCError && e.code === "BAD_REQUEST");
    expect(storagePut).not.toHaveBeenCalled();
  });

  it("does not use the client-supplied file name in the storage key", async () => {
    const result = await passwordAdminCaller().upload.image({
      fileName: "../../_core/index.ts",
      fileData: Buffer.from("png").toString("base64"),
      contentType: "image/png",
    });
    expect(result.key).toMatch(/^uploads\/[\w-]+\.png$/);
    expect(result.key).not.toContain("..");
  });
});
