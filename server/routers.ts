import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { TRPCError } from "@trpc/server";
import { uploadRouter } from "./upload";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  upload: uploadRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Gallery/Artwork routes
  artworks: router({
    list: publicProcedure.query(async () => {
      return [];
    }),
    
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const artwork = await db.getArtworkById(input.id);
        if (!artwork) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Artwork not found" });
        }
        return artwork;
      }),
  }),

  // Product routes
  products: router({
    list: publicProcedure.query(async () => {
      return [];
    }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const product = await db.getProductById(input.id);
        if (!product) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Product not found" });
        }
        return product;
      }),
  }),

  // Cart routes
  cart: router({
    getCart: protectedProcedure.query(async ({ ctx }) => {
      const cart = await db.getOrCreateCart(ctx.user.id);
      if (!cart) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to get cart" });
      }
      return cart;
    }),

    getItems: protectedProcedure.query(async ({ ctx }) => {
      const cart = await db.getOrCreateCart(ctx.user.id);
      if (!cart) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to get cart" });
      }
      return db.getCartItems(cart.id);
    }),
  }),

  // Order routes
  orders: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getOrdersByUser(ctx.user.id);
    }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const order = await db.getOrderById(input.id);
        if (!order || order.userId !== ctx.user.id) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Order not found" });
        }
        return order;
      }),
  }),

  // Profile routes
  profile: router({
    get: publicProcedure
      .input(z.object({ userId: z.number() }))
      .query(async ({ input }) => {
        return db.getProfileByUserId(input.userId);
      }),

    update: protectedProcedure
      .input(z.object({
        bio: z.string().optional(),
        profileImageUrl: z.string().optional(),
        profileImageKey: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.upsertProfile(ctx.user.id, input);
        return { success: true };
      }),
  })
});

export type AppRouter = typeof appRouter;
