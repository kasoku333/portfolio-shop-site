import { eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, artworks, products, artworkProducts, carts, cartItems, orders, orderItems, profiles, InsertProfile, InsertOrder } from "../drizzle/schema";
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

export async function createArtwork(data: {
  title: string;
  description?: string;
  category: "illustration" | "manga" | "novel";
  content?: string;
  imageUrl?: string;
  imageKey?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(artworks).values({
    userId: 1,
    title: data.title,
    description: data.description ?? null,
    category: data.category,
    content: data.content ?? null,
    imageUrl: data.imageUrl ?? null,
    imageKey: data.imageKey ?? null,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  const result = await db.select().from(artworks).orderBy(sql`id DESC`).limit(1);
  return result[0];
}

export async function updateArtwork(id: number, data: {
  title?: string;
  description?: string;
  category?: "illustration" | "manga" | "novel";
  content?: string;
  imageUrl?: string;
  imageKey?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const updateData: Record<string, unknown> = { updatedAt: new Date() };
  if (data.title !== undefined) updateData.title = data.title;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.category !== undefined) updateData.category = data.category;
  if (data.content !== undefined) updateData.content = data.content;
  if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;
  if (data.imageKey !== undefined) updateData.imageKey = data.imageKey;
  await db.update(artworks).set(updateData).where(eq(artworks.id, id));
  return getArtworkById(id);
}

export async function deleteArtwork(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(artworks).where(eq(artworks.id, id));
}

// Product queries
export async function getAllProducts() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(products).orderBy(products.createdAt);
}

export async function createProduct(data: {
  title: string;
  description?: string;
  price: string;
  productType: "digital" | "physical";
  stock?: number;
  imageUrl?: string;
  imageKey?: string;
  boothUrl?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(products).values({
    userId: 1, // 開発用: 管理者ユーザーID
    title: data.title,
    description: data.description ?? null,
    price: data.price,
    productType: data.productType,
    stock: data.stock ?? null,
    imageUrl: data.imageUrl ?? null,
    imageKey: data.imageKey ?? null,
    // 空文字は「未設定」として扱いたいので null に倒す
    boothUrl: data.boothUrl || null,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  // 作成した商品を返す
  const result = await db.select().from(products).orderBy(sql`id DESC`).limit(1);
  return result[0];
}

export async function updateProduct(id: number, data: {
  title?: string;
  description?: string;
  price?: string;
  productType?: "digital" | "physical";
  stock?: number;
  imageUrl?: string;
  imageKey?: string;
  boothUrl?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const updateData: Record<string, unknown> = { updatedAt: new Date() };
  if (data.title !== undefined) updateData.title = data.title;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.price !== undefined) updateData.price = data.price;
  if (data.productType !== undefined) updateData.productType = data.productType;
  if (data.stock !== undefined) updateData.stock = data.stock;
  if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;
  if (data.imageKey !== undefined) updateData.imageKey = data.imageKey;
  // 空文字で送られたら null に戻す（URLの解除ができるようにする）
  if (data.boothUrl !== undefined) updateData.boothUrl = data.boothUrl || null;
  await db.update(products).set(updateData).where(eq(products.id, id));
  return getProductById(id);
}

export async function deleteProduct(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(products).where(eq(products.id, id));
}

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
  return db.select().from(orders).orderBy(sql`${orders.createdAt} DESC`);
}

export async function getOrderItems(orderId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
}

export async function updateOrderStatus(id: number, status: "pending" | "completed" | "failed" | "cancelled") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(orders).set({ status, updatedAt: new Date() }).where(eq(orders.id, id));
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
