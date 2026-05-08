import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { TRPCError } from "@trpc/server";
import { uploadRouter } from "./upload";
import { createCheckoutSession, isStripeConfigured } from "./stripe";
import { sdk } from "./_core/sdk";
import { getSiteSettings, saveSiteSettings } from "./siteSettings";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  upload: uploadRouter,
  auth: router({
    me: publicProcedure.query(({ ctx }) => {
      // Return admin session info if logged in via password
      if (ctx.adminSession) {
        return { id: 0, name: ctx.adminSession.name, role: "admin" as const, email: null as string | null };
      }
      // Return OAuth user if available
      if (ctx.user) {
        return ctx.user;
      }
      return null;
    }),
    adminLogin: publicProcedure
      .input(z.object({ password: z.string().min(1) }))
      .mutation(async ({ input, ctx }) => {
        const adminPassword = process.env.ADMIN_PASSWORD;
        if (!adminPassword) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "ADMIN_PASSWORD is not configured on the server.",
          });
        }
        if (input.password !== adminPassword) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "パスワードが正しくありません",
          });
        }
        // Create JWT session token for admin
        const token = await sdk.signSession(
          { openId: "admin", appId: "admin", name: "管理者" },
          { expiresInMs: ONE_YEAR_MS }
        );
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, token, {
          ...cookieOptions,
          maxAge: ONE_YEAR_MS,
        });
        return { success: true, name: "管理者" };
      }),
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
    list: publicProcedure
      .input(z.object({ category: z.enum(['all', 'illustration', 'manga', 'novel']).default('all') }).optional())
      .query(async ({ input }) => {
        const category = input?.category || 'all';
        if (category === 'all') {
          return db.getAllArtworks();
        }
        return db.getArtworksByCategory(category);
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

    create: publicProcedure
      .input(z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        category: z.enum(['illustration', 'manga', 'novel']),
        imageUrl: z.string().optional(),
        imageKey: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return db.createArtwork(input);
      }),

    update: publicProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().min(1).optional(),
        description: z.string().optional(),
        category: z.enum(['illustration', 'manga', 'novel']).optional(),
        imageUrl: z.string().optional(),
        imageKey: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return db.updateArtwork(id, data);
      }),

    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteArtwork(input.id);
        return { success: true };
      }),
  }),

  // Product routes
  products: router({
    list: publicProcedure.query(async () => {
      return db.getAllProducts();
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

    create: publicProcedure
      .input(z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        price: z.string(),
        productType: z.enum(["digital", "physical"]),
        stock: z.number().optional(),
        imageUrl: z.string().optional(),
        imageKey: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return db.createProduct(input);
      }),

    update: publicProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().min(1).optional(),
        description: z.string().optional(),
        price: z.string().optional(),
        productType: z.enum(["digital", "physical"]).optional(),
        stock: z.number().optional(),
        imageUrl: z.string().optional(),
        imageKey: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return db.updateProduct(id, data);
      }),

    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteProduct(input.id);
        return { success: true };
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
    // 管理者用: 全注文一覧
    listAll: publicProcedure.query(async () => {
      return db.getAllOrders();
    }),

    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getOrdersByUser(ctx.user.id);
    }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const order = await db.getOrderById(input.id);
        if (!order) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Order not found" });
        }
        return order;
      }),

    getItems: publicProcedure
      .input(z.object({ orderId: z.number() }))
      .query(async ({ input }) => {
        return db.getOrderItems(input.orderId);
      }),

    updateStatus: publicProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["pending", "completed", "failed", "cancelled"]),
      }))
      .mutation(async ({ input }) => {
        await db.updateOrderStatus(input.id, input.status);
        return { success: true };
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
  }),

  // Site settings routes
  siteSettings: router({
    get: publicProcedure.query(() => {
      return getSiteSettings();
    }),
    update: publicProcedure
      .input(z.object({
        siteName: z.string().optional(),
        siteSubtitle: z.string().optional(),
        creatorName: z.string().optional(),
        email: z.string().optional(),
        bio: z.string().optional(),
        profileImageUrl: z.string().optional(),
        twitterUrl: z.string().optional(),
        pixivUrl: z.string().optional(),
        otherUrl: z.string().optional(),
        message: z.string().optional(),
        skills: z.array(z.object({
          id: z.string(),
          title: z.string(),
          description: z.string(),
        })).optional(),
        historyItems: z.array(z.object({
          id: z.string(),
          date: z.string(),
          category: z.enum(["site", "creation", "post", "exhibition", "publication", "award", "other"]),
          title: z.string(),
          description: z.string(),
          sortOrder: z.number(),
          isPublished: z.boolean(),
        })).optional(),
      }))
      .mutation(({ input }) => {
        return saveSiteSettings(input);
      }),
  }),

  // Checkout routes
  checkout: router({
    isAvailable: publicProcedure.query(() => {
      return { available: isStripeConfigured() };
    }),

    createSession: publicProcedure
      .input(z.object({
        items: z.array(z.object({
          productId: z.number(),
          name: z.string(),
          price: z.number(),
          quantity: z.number(),
        })),
        successUrl: z.string(),
        cancelUrl: z.string(),
      }))
      .mutation(async ({ input }) => {
        if (!isStripeConfigured()) {
          throw new TRPCError({
            code: "PRECONDITION_FAILED",
            message: "Stripe is not configured. Set STRIPE_SECRET_KEY in .env",
          });
        }
        const session = await createCheckoutSession({
          items: input.items,
          successUrl: input.successUrl,
          cancelUrl: input.cancelUrl,
        });
        return { sessionId: session.id, url: session.url };
      }),
  }),
});

export type AppRouter = typeof appRouter;
