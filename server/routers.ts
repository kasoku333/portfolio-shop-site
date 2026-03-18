import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { TRPCError } from "@trpc/server";
import { uploadRouter } from "./upload";
import { artworks } from "../drizzle/schema";
import { createCheckoutSession } from "./stripe";

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

    create: protectedProcedure
      .input(z.object({
        title: z.string(),
        description: z.string().optional(),
        category: z.enum(['illustration', 'manga', 'novel']),
        imageUrl: z.string().optional(),
        imageKey: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin only" });
        }
        const db_instance = await db.getDb();
        if (!db_instance) throw new Error("Database not available");
        await db_instance.insert(artworks).values({
          userId: ctx.user.id,
          title: input.title,
          description: input.description,
          category: input.category,
          imageUrl: input.imageUrl,
          imageKey: input.imageKey,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        return { success: true };
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        category: z.enum(['illustration', 'manga', 'novel']).optional(),
        imageUrl: z.string().optional(),
        imageKey: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin only" });
        }
        const { id, ...data } = input;
        return db.updateArtwork(id, data);
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin only" });
        }
        return db.deleteArtwork(input.id);
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

    create: protectedProcedure
      .input(z.object({
        title: z.string(),
        description: z.string().optional(),
        price: z.string(),
        productType: z.enum(["digital", "physical"]),
        stock: z.number().optional(),
        imageUrl: z.string().optional(),
        imageKey: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin only" });
        }
        return db.createProduct({ userId: ctx.user.id, ...input });
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        price: z.string().optional(),
        productType: z.enum(["digital", "physical"]).optional(),
        stock: z.number().optional(),
        imageUrl: z.string().optional(),
        imageKey: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin only" });
        }
        const { id, ...data } = input;
        return db.updateProduct(id, data);
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin only" });
        }
        return db.deleteProduct(input.id);
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
      return db.getCartItemsWithProducts(cart.id);
    }),

    getItemCount: protectedProcedure.query(async ({ ctx }) => {
      const cart = await db.getOrCreateCart(ctx.user.id);
      if (!cart) return 0;
      const items = await db.getCartItems(cart.id);
      return items.reduce((sum, item) => sum + item.quantity, 0);
    }),

    addItem: protectedProcedure
      .input(z.object({ productId: z.number(), quantity: z.number().min(1).default(1) }))
      .mutation(async ({ ctx, input }) => {
        const cart = await db.getOrCreateCart(ctx.user.id);
        if (!cart) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to get cart" });
        return db.addCartItem(cart.id, input.productId, input.quantity);
      }),

    updateItem: protectedProcedure
      .input(z.object({ cartItemId: z.number(), quantity: z.number().min(0) }))
      .mutation(async ({ ctx, input }) => {
        if (input.quantity === 0) {
          return db.removeCartItem(input.cartItemId);
        }
        return db.updateCartItemQuantity(input.cartItemId, input.quantity);
      }),

    removeItem: protectedProcedure
      .input(z.object({ cartItemId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        return db.removeCartItem(input.cartItemId);
      }),

    checkout: protectedProcedure
      .input(z.object({ successUrl: z.string(), cancelUrl: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const cart = await db.getOrCreateCart(ctx.user.id);
        if (!cart) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to get cart" });
        const items = await db.getCartItemsWithProducts(cart.id);
        if (items.length === 0) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Cart is empty" });
        }
        const session = await createCheckoutSession({
          userId: ctx.user.id,
          userEmail: ctx.user.email ?? "",
          userName: ctx.user.name ?? "",
          items: items.map((item) => ({
            productId: item.productId,
            name: item.product!.title,
            price: parseFloat(item.product!.price),
            quantity: item.quantity,
          })),
          successUrl: input.successUrl,
          cancelUrl: input.cancelUrl,
        });
        return { url: session.url };
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

    adminList: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Admin only" });
      }
      return db.getAllOrders();
    }),

    updateStatus: protectedProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["pending", "completed", "failed", "cancelled"]),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin only" });
        }
        return db.updateOrderStatus(input.id, input.status);
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
