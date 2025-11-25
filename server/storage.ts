// Based on Replit Auth blueprint + CityShare custom storage
import {
  users,
  items,
  bookings,
  messages,
  ratings,
  wishlist,
  impactStats,
  type User,
  type UpsertUser,
  type Item,
  type InsertItem,
  type Booking,
  type InsertBooking,
  type Message,
  type InsertMessage,
  type Rating,
  type InsertRating,
  type WishlistItem,
  type InsertWishlist,
  type ImpactStats,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, or, sql } from "drizzle-orm";
import { randomUUID } from "crypto";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Item operations
  getItem(id: string): Promise<(Item & { owner?: User }) | undefined>;
  getItems(filters?: { search?: string; category?: string; maxDistance?: number; verifiedOnly?: boolean; limit?: number }): Promise<(Item & { owner?: User })[]>;
  getUserItems(userId: string): Promise<(Item & { owner?: User })[]>;
  createItem(item: InsertItem): Promise<Item>;
  updateItem(id: string, item: Partial<InsertItem>): Promise<Item | undefined>;
  deleteItem(id: string): Promise<boolean>;
  
  // Booking operations
  getBooking(id: string): Promise<Booking | undefined>;
  getBookingsByUser(userId: string): Promise<Booking[]>;
  getBookingsByItem(itemId: string): Promise<Booking[]>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBookingStatus(id: string, status: string): Promise<Booking | undefined>;
  
  // Message operations
  getMessage(id: string): Promise<Message | undefined>;
  getConversationMessages(conversationId: string): Promise<(Message & { sender?: User; receiver?: User })[]>;
  getConversations(userId: string): Promise<any[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  markMessageAsRead(id: string): Promise<boolean>;
  
  // Rating operations
  getRating(id: string): Promise<Rating | undefined>;
  getUserRatings(userId: string): Promise<(Rating & { rater?: User })[]>;
  createRating(rating: InsertRating): Promise<Rating>;
  updateUserRating(userId: string): Promise<void>;
  
  // Wishlist operations
  getWishlistByUser(userId: string): Promise<(WishlistItem & { item?: Item & { owner?: User } })[]>;
  checkWishlist(userId: string, itemId: string): Promise<boolean>;
  addToWishlist(wishlistItem: InsertWishlist): Promise<WishlistItem>;
  removeFromWishlist(userId: string, itemId: string): Promise<boolean>;
  updateWishlistAlerts(userId: string, itemId: string, alertsEnabled: boolean): Promise<boolean>;
  
  // Impact operations
  getUserImpactStats(userId: string): Promise<ImpactStats | undefined>;
  updateImpactStats(userId: string, updates: Partial<Omit<ImpactStats, 'id' | 'userId'>>): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Item operations
  async getItem(id: string): Promise<(Item & { owner?: User }) | undefined> {
    const [result] = await db
      .select()
      .from(items)
      .leftJoin(users, eq(items.ownerId, users.id))
      .where(eq(items.id, id));
    
    if (!result) return undefined;
    
    return {
      ...result.items,
      owner: result.users || undefined,
    };
  }

  async getItems(filters?: { search?: string; category?: string; maxDistance?: number; verifiedOnly?: boolean; limit?: number }): Promise<(Item & { owner?: User })[]> {
    const limit = filters?.limit || 50;
    
    // Build the base query
    let query = db
      .select()
      .from(items)
      .leftJoin(users, eq(items.ownerId, users.id))
      .where(sql`1=1`)
      .orderBy(desc(items.createdAt))
      .limit(limit);

    const results = await query;
    
    // Apply filters in-memory (in production, you'd do this in SQL)
    let filteredResults = results;
    
    // Category filter
    if (filters?.category && filters.category !== 'all') {
      filteredResults = filteredResults.filter(r => r.items.category === filters.category);
    }
    
    // Distance filter
    if (filters?.maxDistance !== undefined && filters.maxDistance > 0) {
      filteredResults = filteredResults.filter(r => {
        // If distance is not set, include the item (assume it's within range)
        if (!r.items.distance) return true;
        return r.items.distance <= filters.maxDistance!;
      });
    }
    
    // Verified owners filter
    if (filters?.verifiedOnly) {
      filteredResults = filteredResults.filter(r => r.users?.isVerified === true);
    }
    
    // Search filter
    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      filteredResults = filteredResults.filter(r => 
        r.items.title.toLowerCase().includes(searchLower) ||
        r.items.description.toLowerCase().includes(searchLower)
      );
    }
    
    return filteredResults.map(r => ({
      ...r.items,
      owner: r.users || undefined,
    }));
  }

  async getUserItems(userId: string): Promise<(Item & { owner?: User })[]> {
    const results = await db
      .select()
      .from(items)
      .leftJoin(users, eq(items.ownerId, users.id))
      .where(eq(items.ownerId, userId))
      .orderBy(desc(items.createdAt));
    
    return results.map(r => ({
      ...r.items,
      owner: r.users || undefined,
    }));
  }

  async createItem(itemData: InsertItem): Promise<Item> {
    const id = randomUUID();
    const [item] = await db.insert(items).values({ id, ...itemData }).returning();
    
    // Update user's items listed count
    await db
      .update(users)
      .set({ itemsListed: sql`${users.itemsListed} + 1` })
      .where(eq(users.id, itemData.ownerId));
    
    return item;
  }

  async updateItem(id: string, itemData: Partial<InsertItem>): Promise<Item | undefined> {
    const [item] = await db
      .update(items)
      .set({ ...itemData, updatedAt: new Date() })
      .where(eq(items.id, id))
      .returning();
    return item;
  }

  async deleteItem(id: string): Promise<boolean> {
    const result = await db.delete(items).where(eq(items.id, id));
    return true;
  }

  // Booking operations
  async getBooking(id: string): Promise<Booking | undefined> {
    const [booking] = await db.select().from(bookings).where(eq(bookings.id, id));
    return booking;
  }

  async getBookingsByUser(userId: string): Promise<Booking[]> {
    const results = await db
      .select()
      .from(bookings)
      .where(or(eq(bookings.borrowerId, userId), eq(bookings.ownerId, userId)))
      .orderBy(desc(bookings.createdAt));
    return results;
  }

  async getBookingsByItem(itemId: string): Promise<Booking[]> {
    const results = await db
      .select()
      .from(bookings)
      .where(eq(bookings.itemId, itemId))
      .orderBy(desc(bookings.createdAt));
    return results;
  }

  async createBooking(bookingData: InsertBooking): Promise<Booking> {
    const id = randomUUID();
    const [booking] = await db.insert(bookings).values({ id, ...bookingData }).returning();
    
    // Update user's items borrowed count
    await db
      .update(users)
      .set({ itemsBorrowed: sql`${users.itemsBorrowed} + 1` })
      .where(eq(users.id, bookingData.borrowerId));
    
    return booking;
  }

  async updateBookingStatus(id: string, status: string): Promise<Booking | undefined> {
    const [booking] = await db
      .update(bookings)
      .set({ status, updatedAt: new Date() })
      .where(eq(bookings.id, id))
      .returning();
    return booking;
  }

  // Message operations
  async getMessage(id: string): Promise<Message | undefined> {
    const [message] = await db.select().from(messages).where(eq(messages.id, id));
    return message;
  }

  async getConversationMessages(conversationId: string): Promise<(Message & { sender?: User; receiver?: User })[]> {
    const results = await db
      .select()
      .from(messages)
      .leftJoin(users, eq(messages.senderId, users.id))
      .where(eq(messages.conversationId, conversationId))
      .orderBy(messages.createdAt);
    
    return results.map(r => ({
      ...r.messages,
      sender: r.users || undefined,
    })) as any;
  }

  async getConversations(userId: string): Promise<any[]> {
    // This is a simplified version - in production you'd want a more optimized query
    const userMessages = await db
      .select()
      .from(messages)
      .where(or(eq(messages.senderId, userId), eq(messages.receiverId, userId)))
      .orderBy(desc(messages.createdAt));
    
    // Group by conversation
    const conversationsMap = new Map();
    for (const msg of userMessages) {
      if (!conversationsMap.has(msg.conversationId)) {
        conversationsMap.set(msg.conversationId, {
          conversationId: msg.conversationId,
          lastMessage: msg,
          otherUserId: msg.senderId === userId ? msg.receiverId : msg.senderId,
        });
      }
    }
    
    // Fetch other users
    const conversations = [];
    for (const conv of conversationsMap.values()) {
      const [otherUser] = await db.select().from(users).where(eq(users.id, conv.otherUserId));
      if (otherUser) {
        conversations.push({
          ...conv,
          otherUser,
          unreadCount: 0, // Simplified
        });
      }
    }
    
    return conversations;
  }

  async createMessage(messageData: InsertMessage): Promise<Message> {
    const id = randomUUID();
    const [message] = await db.insert(messages).values({ id, ...messageData }).returning();
    return message;
  }

  async markMessageAsRead(id: string): Promise<boolean> {
    await db.update(messages).set({ isRead: true }).where(eq(messages.id, id));
    return true;
  }

  // Rating operations
  async getRating(id: string): Promise<Rating | undefined> {
    const [rating] = await db.select().from(ratings).where(eq(ratings.id, id));
    return rating;
  }

  async getUserRatings(userId: string): Promise<(Rating & { rater?: User })[]> {
    const results = await db
      .select()
      .from(ratings)
      .leftJoin(users, eq(ratings.raterId, users.id))
      .where(eq(ratings.ratedUserId, userId))
      .orderBy(desc(ratings.createdAt));
    
    return results.map(r => ({
      ...r.ratings,
      rater: r.users || undefined,
    }));
  }

  async createRating(ratingData: InsertRating): Promise<Rating> {
    const id = randomUUID();
    const [rating] = await db.insert(ratings).values({ id, ...ratingData }).returning();
    
    // Update user's rating
    await this.updateUserRating(ratingData.ratedUserId);
    
    return rating;
  }

  async updateUserRating(userId: string): Promise<void> {
    const userRatings = await db
      .select()
      .from(ratings)
      .where(eq(ratings.ratedUserId, userId));
    
    const avgRating = userRatings.reduce((sum, r) => sum + r.rating, 0) / userRatings.length;
    
    await db
      .update(users)
      .set({ 
        rating: avgRating,
        totalRatings: userRatings.length,
      })
      .where(eq(users.id, userId));
  }

  // Wishlist operations
  async getWishlistByUser(userId: string): Promise<(WishlistItem & { item?: Item & { owner?: User } })[]> {
    const results = await db
      .select()
      .from(wishlist)
      .leftJoin(items, eq(wishlist.itemId, items.id))
      .leftJoin(users, eq(items.ownerId, users.id))
      .where(eq(wishlist.userId, userId))
      .orderBy(desc(wishlist.createdAt));
    
    return results.map(r => ({
      ...r.wishlist,
      item: r.items ? {
        ...r.items,
        owner: r.users || undefined,
      } : undefined,
    }));
  }

  async checkWishlist(userId: string, itemId: string): Promise<boolean> {
    const [result] = await db
      .select()
      .from(wishlist)
      .where(and(eq(wishlist.userId, userId), eq(wishlist.itemId, itemId)));
    return !!result;
  }

  async addToWishlist(wishlistData: InsertWishlist): Promise<WishlistItem> {
    const id = randomUUID();
    const [item] = await db.insert(wishlist).values({ id, ...wishlistData }).returning();
    return item;
  }

  async removeFromWishlist(userId: string, itemId: string): Promise<boolean> {
    await db
      .delete(wishlist)
      .where(and(eq(wishlist.userId, userId), eq(wishlist.itemId, itemId)));
    return true;
  }

  async updateWishlistAlerts(userId: string, itemId: string, alertsEnabled: boolean): Promise<boolean> {
    await db
      .update(wishlist)
      .set({ alertsEnabled })
      .where(and(eq(wishlist.userId, userId), eq(wishlist.itemId, itemId)));
    return true;
  }

  // Impact operations
  async getUserImpactStats(userId: string): Promise<ImpactStats | undefined> {
    const [stats] = await db
      .select()
      .from(impactStats)
      .where(eq(impactStats.userId, userId));
    
    if (!stats) {
      // Create default stats
      const id = randomUUID();
      const [newStats] = await db
        .insert(impactStats)
        .values({ id, userId, itemsReused: 0, co2Saved: 0, wastePrevented: 0 })
        .returning();
      return newStats;
    }
    
    return stats;
  }

  async updateImpactStats(userId: string, updates: Partial<Omit<ImpactStats, 'id' | 'userId'>>): Promise<void> {
    const stats = await this.getUserImpactStats(userId);
    if (stats) {
      await db
        .update(impactStats)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(impactStats.userId, userId));
    }
  }
}

export const storage = new DatabaseStorage();
