import { users, items, bookings, messages, ratings, wishlist, impactStats } from "@shared/schema";
import type { User, InsertUser, Item, InsertItem, Booking, InsertBooking, Message, InsertMessage, Rating, InsertRating, WishlistItem, InsertWishlist, ImpactStats } from "@shared/schema";
import { db } from "./db";
import { eq, ilike, or, and, desc, sql } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<User>): Promise<User | undefined>;
  
  // Item operations
  getItem(id: string): Promise<Item | undefined>;
  getItems(filters?: { search?: string, category?: string, limit?: number, maxDistance?: number, verifiedOnly?: boolean }): Promise<Item[]>;
  getUserItems(userId: string): Promise<Item[]>;
  createItem(item: InsertItem): Promise<Item>;
  updateItem(id: string, item: Partial<Item>): Promise<Item | undefined>;
  deleteItem(id: string): Promise<void>;

  // Booking operations
  getBooking(id: string): Promise<Booking | undefined>;
  getBookingsByUser(userId: string): Promise<Booking[]>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBookingStatus(id: string, status: string): Promise<Booking | undefined>;

  // Message operations
  getConversations(userId: string): Promise<{ userId: string, username: string, lastMessage: Message }[]>;
  getConversationMessages(conversationId: string): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;

  // Rating operations
  getUserRatings(userId: string): Promise<Rating[]>;
  createRating(rating: InsertRating): Promise<Rating>;

  // Wishlist operations
  getWishlistByUser(userId: string): Promise<(WishlistItem & { item: Item })[]>;
  checkWishlist(userId: string, itemId: string): Promise<boolean>;
  addToWishlist(item: InsertWishlist): Promise<WishlistItem>;
  removeFromWishlist(userId: string, itemId: string): Promise<void>;
  updateWishlistAlerts(userId: string, itemId: string, enabled: boolean): Promise<void>;

  // Impact operations
  getUserImpactStats(userId: string): Promise<ImpactStats | undefined>;
  
  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    });
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: string, userUpdate: Partial<User>): Promise<User | undefined> {
    const [user] = await db.update(users).set(userUpdate).where(eq(users.id, id)).returning();
    return user;
  }

  // Items
  async getItem(id: string): Promise<Item | undefined> {
    const [item] = await db.select().from(items).where(eq(items.id, id));
    return item;
  }

  async getItems(filters?: { search?: string, category?: string, limit?: number, maxDistance?: number, verifiedOnly?: boolean }): Promise<Item[]> {
    let conditions = [];
    
    if (filters?.search) {
      conditions.push(
        or(
          ilike(items.title, `%${filters.search}%`),
          ilike(items.description, `%${filters.search}%`)
        )
      );
    }
    
    if (filters?.category && filters.category !== "All Categories") {
      conditions.push(eq(items.category, filters.category));
    }

    
    
    const query = db.select().from(items);
    
    if (conditions.length > 0) {
      query.where(and(...conditions));
    }
    
    query.orderBy(desc(items.createdAt));
    
    if (filters?.limit) {
      query.limit(filters.limit);
    }
    
    return await query;
  }

  async getUserItems(userId: string): Promise<Item[]> {
    return await db.select().from(items).where(eq(items.ownerId, userId)).orderBy(desc(items.createdAt));
  }

  async createItem(insertItem: InsertItem): Promise<Item> {
    const [item] = await db.insert(items).values(insertItem).returning();
    
  
    const userItems = await this.getUserItems(insertItem.ownerId);
    await this.updateUser(insertItem.ownerId, { itemsListed: userItems.length });

    return item;
  }

  async updateItem(id: string, itemUpdate: Partial<Item>): Promise<Item | undefined> {
    const [item] = await db.update(items).set(itemUpdate).where(eq(items.id, id)).returning();
    return item;
  }

  async deleteItem(id: string): Promise<void> {
    await db.delete(items).where(eq(items.id, id));
  }

  // Bookings
  async getBooking(id: string): Promise<Booking | undefined> {
    const [booking] = await db.select().from(bookings).where(eq(bookings.id, id));
    return booking;
  }

  async getBookingsByUser(userId: string): Promise<Booking[]> {
    return await db.select().from(bookings).where(
      or(eq(bookings.borrowerId, userId), eq(bookings.ownerId, userId))
    ).orderBy(desc(bookings.createdAt));
  }

  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    const [booking] = await db.insert(bookings).values(insertBooking).returning();
    return booking;
  }

  async updateBookingStatus(id: string, status: string): Promise<Booking | undefined> {
    const [booking] = await db.update(bookings).set({ status }).where(eq(bookings.id, id)).returning();
    return booking;
  }

  // Messages
  async getConversations(userId: string): Promise<{ userId: string, username: string, lastMessage: Message }[]> {

    const allMessages = await db.select().from(messages).where(
      or(eq(messages.senderId, userId), eq(messages.receiverId, userId))
    ).orderBy(desc(messages.createdAt));
    
    const conversationMap = new Map<string, Message>();
    
    for (const msg of allMessages) {
      const otherId = msg.senderId === userId ? msg.receiverId : msg.senderId;
      if (!conversationMap.has(otherId)) {
        conversationMap.set(otherId, msg);
      }
    }
    
    const result = [];
    for (const [otherId, lastMessage] of conversationMap.entries()) {
      const otherUser = await this.getUser(otherId);
      if (otherUser) {
        result.push({
          userId: otherId,
          username: otherUser.username || "Unknown User",
          lastMessage
        });
      }
    }
    
    return result;
  }

  async getConversationMessages(conversationId: string): Promise<Message[]> {
    return await db.select().from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(messages.createdAt);
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const [message] = await db.insert(messages).values(insertMessage).returning();
    return message;
  }

  // Ratings
  async getUserRatings(userId: string): Promise<Rating[]> {
    return await db.select().from(ratings).where(eq(ratings.ratedUserId, userId));
  }

  async createRating(insertRating: InsertRating): Promise<Rating> {
    const [rating] = await db.insert(ratings).values(insertRating).returning();
    
    // Update user average rating
    const userRatings = await this.getUserRatings(insertRating.ratedUserId);
    const total = userRatings.reduce((sum, r) => sum + r.rating, 0);
    const average = total / userRatings.length;
    
    await this.updateUser(insertRating.ratedUserId, {
      rating: average,
      totalRatings: userRatings.length
    });
    
    return rating;
  }

  // Wishlist
  async getWishlistByUser(userId: string): Promise<(WishlistItem & { item: Item })[]> {
    const wishlistItems = await db.select().from(wishlist).where(eq(wishlist.userId, userId));
    const result = [];
    
    for (const w of wishlistItems) {
      const item = await this.getItem(w.itemId);
      if (item) {
        result.push({ ...w, item });
      }
    }
    
    return result;
  }

  async checkWishlist(userId: string, itemId: string): Promise<boolean> {
    const [entry] = await db.select().from(wishlist).where(
      and(eq(wishlist.userId, userId), eq(wishlist.itemId, itemId))
    );
    return !!entry;
  }

  async addToWishlist(insertWishlist: InsertWishlist): Promise<WishlistItem> {
    const [entry] = await db.insert(wishlist).values(insertWishlist).returning();
    return entry;
  }

  async removeFromWishlist(userId: string, itemId: string): Promise<void> {
    await db.delete(wishlist).where(
      and(eq(wishlist.userId, userId), eq(wishlist.itemId, itemId))
    );
  }

  async updateWishlistAlerts(userId: string, itemId: string, alertsEnabled: boolean): Promise<void> {
    await db.update(wishlist)
      .set({ alertsEnabled })
      .where(and(eq(wishlist.userId, userId), eq(wishlist.itemId, itemId)));
  }

  // Impact
  async getUserImpactStats(userId: string): Promise<ImpactStats | undefined> {
    const [stats] = await db.select().from(impactStats).where(eq(impactStats.userId, userId));
    return stats;
  }
}

export const storage = new DatabaseStorage();
