import { eq, sql, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, artworks, products, artworkProducts, carts, cartItems, orders, profiles, InsertProfile, InsertOrder } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Artwork queries
export async function getAllArtworks() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(artworks).orderBy(artworks.createdAt);
}

export async function getArtworksByCategory(category: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(artworks).where(sql`${artworks.category} = ${category}`).orderBy(artworks.createdAt);
}

export async function getArtworksByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(artworks).where(eq(artworks.userId, userId));
}

export async function getArtworkById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(artworks).where(eq(artworks.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// Artwork mutations (admin)
export async function updateArtwork(id: number, data: Partial<{
  title: string;
  description: string;
  category: "illustration" | "manga" | "novel";
  imageUrl: string;
  imageKey: string;
}>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(artworks).set(data).where(eq(artworks.id, id));
  return { success: true };
}

export async function deleteArtwork(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(artworks).where(eq(artworks.id, id));
  return { success: true };
}

// Product queries
export async function getProductsByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(products).where(eq(products.userId, userId));
}

export async function getProductById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getRelatedProducts(artworkId: number) {
  const db = await getDb();
  if (!db) return [];
  const relations = await db.select().from(artworkProducts).where(eq(artworkProducts.artworkId, artworkId));
  const productIds = relations.map(r => r.productId);
  if (productIds.length === 0) return [];
  return db.select().from(products).where(sql`id IN (${sql.raw(productIds.join(','))})`);
}

// Product queries (extended)
export async function getAllProducts() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(products).orderBy(desc(products.createdAt));
}

export async function createProduct(data: {
  userId: number;
  title: string;
  description?: string;
  price: string;
  productType: "digital" | "physical";
  stock?: number;
  imageUrl?: string;
  imageKey?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(products).values(data);
  return { success: true };
}

export async function updateProduct(id: number, data: Partial<{
  title: string;
  description: string;
  price: string;
  productType: "digital" | "physical";
  stock: number;
  imageUrl: string;
  imageKey: string;
}>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(products).set(data).where(eq(products.id, id));
  return { success: true };
}

export async function deleteProduct(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(products).where(eq(products.id, id));
  return { success: true };
}

// Cart queries
export async function getOrCreateCart(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const existing = await db.select().from(carts).where(eq(carts.userId, userId)).limit(1);
  if (existing.length > 0) return existing[0];
  
  await db.insert(carts).values({ userId });
  const created = await db.select().from(carts).where(eq(carts.userId, userId)).limit(1);
  return created.length > 0 ? created[0] : undefined;
}

export async function getCartItems(cartId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(cartItems).where(eq(cartItems.cartId, cartId));
}

export async function getCartItemsWithProducts(cartId: number) {
  const db = await getDb();
  if (!db) return [];
  const items = await db.select().from(cartItems).where(eq(cartItems.cartId, cartId));
  const result = await Promise.all(
    items.map(async (item) => {
      const product = await getProductById(item.productId);
      return { ...item, product };
    })
  );
  return result.filter((item) => item.product != null);
}

export async function addCartItem(cartId: number, productId: number, quantity: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await db.select().from(cartItems)
    .where(sql`${cartItems.cartId} = ${cartId} AND ${cartItems.productId} = ${productId}`)
    .limit(1);
  if (existing.length > 0) {
    await db.update(cartItems)
      .set({ quantity: existing[0].quantity + quantity })
      .where(eq(cartItems.id, existing[0].id));
  } else {
    await db.insert(cartItems).values({ cartId, productId, quantity });
  }
  return { success: true };
}

export async function updateCartItemQuantity(cartItemId: number, quantity: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(cartItems).set({ quantity }).where(eq(cartItems.id, cartItemId));
  return { success: true };
}

export async function removeCartItem(cartItemId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(cartItems).where(eq(cartItems.id, cartItemId));
  return { success: true };
}

export async function clearCart(cartId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(cartItems).where(eq(cartItems.cartId, cartId));
  return { success: true };
}

// Order queries
export async function createOrder(data: InsertOrder) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(orders).values(data);
}

export async function getOrdersByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orders).where(eq(orders.userId, userId));
}

export async function getOrderById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllOrders() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orders).orderBy(desc(orders.createdAt));
}

export async function updateOrderStatus(id: number, status: "pending" | "completed" | "failed" | "cancelled") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(orders).set({ status }).where(eq(orders.id, id));
  return { success: true };
}

// Profile queries
export async function getProfileByUserId(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(profiles).where(eq(profiles.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function upsertProfile(userId: number, data: Partial<InsertProfile>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await getProfileByUserId(userId);
  if (existing) {
    return db.update(profiles).set(data).where(eq(profiles.userId, userId));
  } else {
    return db.insert(profiles).values({ userId, ...data });
  }
}
