import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertItemSchema, insertBookingSchema, insertMessageSchema, insertRatingSchema, insertWishlistSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  setupAuth(app); // (Removed 'await' as setupAuth is synchronous in our new version)

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      // FIX: Use .id instead of .claims.sub
      const userId = req.user.id; 
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // ========== ITEM ROUTES ==========
  
  // Get all items (with optional filters)
  app.get("/api/items", async (req, res) => {
    try {
      const { search, category, limit, maxDistance, verifiedOnly } = req.query;
      const items = await storage.getItems({
        search: search as string,
        category: category as string,
        maxDistance: maxDistance ? parseFloat(maxDistance as string) : undefined,
        verifiedOnly: verifiedOnly === 'true',
        limit: limit ? parseInt(limit as string) : undefined,
      });
      res.json(items);
    } catch (error) {
      console.error("Error fetching items:", error);
      res.status(500).json({ message: "Failed to fetch items" });
    }
  });

  // Get recent items
  app.get("/api/items/recent", async (req, res) => {
    try {
      const items = await storage.getItems({ limit: 6 });
      res.json(items);
    } catch (error) {
      console.error("Error fetching recent items:", error);
      res.status(500).json({ message: "Failed to fetch recent items" });
    }
  });

  // Get user's items
  app.get("/api/items/my-items", isAuthenticated, async (req: any, res) => {
    try {
      // FIX: Use .id
      const userId = req.user.id;
      const items = await storage.getUserItems(userId);
      res.json(items);
    } catch (error) {
      console.error("Error fetching user items:", error);
      res.status(500).json({ message: "Failed to fetch user items" });
    }
  });

  // Get single item
  app.get("/api/items/:id", async (req, res) => {
    try {
      const item = await storage.getItem(req.params.id);
      if (!item) {
        return res.status(404).json({ message: "Item not found" });
      }
      res.json(item);
    } catch (error) {
      console.error("Error fetching item:", error);
      res.status(500).json({ message: "Failed to fetch item" });
    }
  });

  // Create item
  app.post("/api/items", isAuthenticated, async (req: any, res) => {
    try {
      // FIX: Use .id
      const userId = req.user.id;
      const validated = insertItemSchema.parse({ ...req.body, ownerId: userId });
      const item = await storage.createItem(validated);
      res.json(item);
    } catch (error: any) {
      console.error("Error creating item:", error);
      res.status(400).json({ message: error.message || "Failed to create item" });
    }
  });

  // Update item
  app.patch("/api/items/:id", isAuthenticated, async (req, res) => {
    try {
      const item = await storage.updateItem(req.params.id, req.body);
      if (!item) {
        return res.status(404).json({ message: "Item not found" });
      }
      res.json(item);
    } catch (error) {
      console.error("Error updating item:", error);
      res.status(500).json({ message: "Failed to update item" });
    }
  });

  // Delete item
  app.delete("/api/items/:id", isAuthenticated, async (req, res) => {
    try {
      await storage.deleteItem(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting item:", error);
      res.status(500).json({ message: "Failed to delete item" });
    }
  });

  // ========== BOOKING ROUTES ==========
  
  // Get user's bookings
  app.get("/api/bookings", isAuthenticated, async (req: any, res) => {
    try {
      // FIX: Use .id
      const userId = req.user.id;
      const bookings = await storage.getBookingsByUser(userId);
      res.json(bookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });

  // Create booking
  app.post("/api/bookings", isAuthenticated, async (req: any, res) => {
    try {
      // FIX: Use .id
      const userId = req.user.id;
      const validated = insertBookingSchema.parse({ ...req.body, borrowerId: userId });
      const booking = await storage.createBooking(validated);
      res.json(booking);
    } catch (error: any) {
      console.error("Error creating booking:", error);
      res.status(400).json({ message: error.message || "Failed to create booking" });
    }
  });

  // Update booking status
  app.patch("/api/bookings/:id/status", isAuthenticated, async (req, res) => {
    try {
      const { status } = req.body;
      const booking = await storage.updateBookingStatus(req.params.id, status);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      res.json(booking);
    } catch (error) {
      console.error("Error updating booking:", error);
      res.status(500).json({ message: "Failed to update booking" });
    }
  });

  // ========== MESSAGE ROUTES ==========
  
  // Get conversations
  app.get("/api/conversations", isAuthenticated, async (req: any, res) => {
    try {
      // FIX: Use .id
      const userId = req.user.id;
      const conversations = await storage.getConversations(userId);
      res.json(conversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ message: "Failed to fetch conversations" });
    }
  });

  // Get conversation messages
  app.get("/api/messages/:conversationId", isAuthenticated, async (req, res) => {
    try {
      const messages = await storage.getConversationMessages(req.params.conversationId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  // Create message
  app.post("/api/messages", isAuthenticated, async (req: any, res) => {
    try {
      // FIX: Use .id
      const userId = req.user.id;
      const validated = insertMessageSchema.parse({ ...req.body, senderId: userId });
      const message = await storage.createMessage(validated);
      
      // Broadcast to WebSocket clients
      // Ensure we convert IDs to strings for the Map keys
      if (wsClients.has(String(validated.receiverId))) {
        const receiverSocket = wsClients.get(String(validated.receiverId));
        if (receiverSocket && receiverSocket.readyState === WebSocket.OPEN) {
          receiverSocket.send(JSON.stringify({ type: "message", data: message }));
        }
      }
      
      res.json(message);
    } catch (error: any) {
      console.error("Error creating message:", error);
      res.status(400).json({ message: error.message || "Failed to send message" });
    }
  });

  // ========== RATING ROUTES ==========
  
  // Get user ratings
  app.get("/api/ratings/user/:userId", async (req, res) => {
    try {
      const ratings = await storage.getUserRatings(req.params.userId);
      res.json(ratings);
    } catch (error) {
      console.error("Error fetching ratings:", error);
      res.status(500).json({ message: "Failed to fetch ratings" });
    }
  });

  // Create rating
  app.post("/api/ratings", isAuthenticated, async (req: any, res) => {
    try {
      // FIX: Use .id
      const userId = req.user.id;
      const validated = insertRatingSchema.parse({ ...req.body, raterId: userId });
      const rating = await storage.createRating(validated);
      res.json(rating);
    } catch (error: any) {
      console.error("Error creating rating:", error);
      res.status(400).json({ message: error.message || "Failed to create rating" });
    }
  });

  // ========== WISHLIST ROUTES ==========
  
  // Get user's wishlist
  app.get("/api/wishlist", isAuthenticated, async (req: any, res) => {
    try {
      // FIX: Use .id
      const userId = req.user.id;
      const wishlistItems = await storage.getWishlistByUser(userId);
      res.json(wishlistItems);
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      res.status(500).json({ message: "Failed to fetch wishlist" });
    }
  });

  // Check if item is in wishlist
  app.get("/api/wishlist/check/:itemId", isAuthenticated, async (req: any, res) => {
    try {
      // FIX: Use .id
      const userId = req.user.id;
      const isWishlisted = await storage.checkWishlist(userId, req.params.itemId);
      res.json(isWishlisted);
    } catch (error) {
      console.error("Error checking wishlist:", error);
      res.status(500).json({ message: "Failed to check wishlist" });
    }
  });

  // Add to wishlist
  app.post("/api/wishlist", isAuthenticated, async (req: any, res) => {
    try {
      // FIX: Use .id
      const userId = req.user.id;
      const validated = insertWishlistSchema.parse({ ...req.body, userId });
      const wishlistItem = await storage.addToWishlist(validated);
      res.json(wishlistItem);
    } catch (error: any) {
      console.error("Error adding to wishlist:", error);
      res.status(400).json({ message: error.message || "Failed to add to wishlist" });
    }
  });

  // Remove from wishlist
  app.delete("/api/wishlist/:itemId", isAuthenticated, async (req: any, res) => {
    try {
      // FIX: Use .id
      const userId = req.user.id;
      await storage.removeFromWishlist(userId, req.params.itemId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      res.status(500).json({ message: "Failed to remove from wishlist" });
    }
  });

  // Update wishlist alerts
  app.patch("/api/wishlist/:itemId", isAuthenticated, async (req: any, res) => {
    try {
      // FIX: Use .id
      const userId = req.user.id;
      const { alertsEnabled } = req.body;
      await storage.updateWishlistAlerts(userId, req.params.itemId, alertsEnabled);
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating wishlist alerts:", error);
      res.status(500).json({ message: "Failed to update alerts" });
    }
  });

  // ========== IMPACT ROUTES ==========
  
  // Get user's impact stats
  app.get("/api/impact/stats", isAuthenticated, async (req: any, res) => {
    try {
      // FIX: Use .id
      const userId = req.user.id;
      const stats = await storage.getUserImpactStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching impact stats:", error);
      res.status(500).json({ message: "Failed to fetch impact stats" });
    }
  });

  // ========== WEBSOCKET SETUP ==========
  const httpServer = createServer(app);
  
  // WebSocket server for real-time messaging
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  const wsClients = new Map<string, WebSocket>();

  wss.on('connection', (ws: WebSocket) => {
    console.log('WebSocket client connected');
    
    let userId: string | null = null;

    ws.on('message', (data: string) => {
      try {
        const message = JSON.parse(data.toString());
        
        if (message.type === 'auth' && message.userId) {
          userId = String(message.userId); // Ensure it's a string
          if (userId) {
            wsClients.set(userId, ws);
            console.log(`User ${userId} authenticated on WebSocket`);
          }
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      if (userId) {
        wsClients.delete(userId);
        console.log(`User ${userId} disconnected from WebSocket`);
      }
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  });

  return httpServer;
}