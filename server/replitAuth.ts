import { type Express, type Request, type Response, type NextFunction } from "express";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { db } from "./db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";
import MemoryStore from "memorystore";

export function setupAuth(app: Express) {
  // 1. Setup Session
  const SessionStore = MemoryStore(session);
  app.use(
    session({
      secret: "secret-key",
      resave: false,
      saveUninitialized: false,
      store: new SessionStore({ checkPeriod: 86400000 }),
      cookie: { secure: false },
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());

  // 2. Configure Passport (The Security Guard)
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const [user] = await db.select().from(users).where(eq(users.username, username));
        if (!user) {
          return done(null, false, { message: "Incorrect username." });
        }
        if (user.password !== password) {
          return done(null, false, { message: "Incorrect password." });
        }
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    })
  );

  passport.serializeUser((user: any, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  // -------------------------------------------------------------------
  // 3. API Routes (The "Safety Net" - Listen to ALL variations)
  // -------------------------------------------------------------------

  // STATUS: Check if logged in
  app.get("/api/auth/user", (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not logged in" });
    res.json(req.user);
  });

  // LOGIN: Listen to BOTH common addresses
  const handleLogin = (req: Request, res: Response) => res.status(200).json(req.user);
  
  app.post("/api/login", passport.authenticate("local"), handleLogin);       // Option A
  app.post("/api/auth/login", passport.authenticate("local"), handleLogin);  // Option B

  // REGISTER: Listen to BOTH common addresses
  const handleRegister = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const existingUser = await db.select().from(users).where(eq(users.username, req.body.username));
      if (existingUser.length > 0) return res.status(400).send("Username already exists");

      const [newUser] = await db.insert(users).values({
        username: req.body.username,
        password: req.body.password,
        isAdmin: false,
      }).returning();

      req.login(newUser, (err) => {
        if (err) return next(err);
        return res.json(newUser);
      });
    } catch (error) {
      next(error);
    }
  };

  app.post("/api/register", handleRegister);      // Option A
  app.post("/api/auth/register", handleRegister); // Option B

  // LOGOUT
  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  console.log("✅ Auth Routes initialized (Listening on /api/login AND /api/auth/login)");
}

export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) return next();
  res.status(401).json({ message: "Unauthorized" });
}