# CityShare - Local Item Sharing Platform

## Overview

CityShare is a community-focused web application that enables users to borrow, lend, and share items locally. The platform emphasizes sustainability, trust-building through user verification, and reducing waste by facilitating item sharing among verified neighbors. Users can list items, browse available items with filtering capabilities, manage bookings, communicate via real-time messaging, track their environmental impact, and maintain wishlists.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System**
- React 18 with TypeScript for type-safe component development
- Vite as the build tool and development server with hot module replacement
- Wouter for lightweight client-side routing (alternative to React Router)
- React Hook Form with Zod for form validation and type-safe schemas

**UI Component System**
- Shadcn/ui component library built on Radix UI primitives
- Tailwind CSS for utility-first styling with custom design system
- Design approach inspired by Airbnb (trust-building) and Linear (clean typography)
- Custom typography using Inter (UI/body) and Outfit (headings) from Google Fonts
- Responsive grid layouts with mobile-first breakpoints

**State Management**
- TanStack Query (React Query) for server state management, caching, and data fetching
- Query client configured with custom fetch functions and 401 error handling
- Local component state using React hooks

**Real-time Communication**
- WebSocket integration for live messaging between users
- WebSocket reference stored in React refs for persistent connections

### Backend Architecture

**Server Framework**
- Express.js for HTTP server and API routing
- Separate development (index-dev.ts) and production (index-prod.ts) entry points
- Development server integrates Vite middleware for hot reloading
- Production server serves static files from dist/public

**API Design**
- RESTful API endpoints organized by resource (items, bookings, messages, ratings, wishlist, impact)
- Authentication middleware protecting routes requiring logged-in users
- Request/response logging middleware for debugging
- JSON body parsing with raw body preservation for webhooks

**Authentication & Session Management**
- Replit Auth (OpenID Connect) for user authentication
- Passport.js strategy for OIDC integration
- PostgreSQL-backed session store using connect-pg-simple
- Session cookies with 7-day TTL, HTTP-only, and secure flags
- Token refresh handling for long-lived sessions

**WebSocket Server**
- Dedicated WebSocket server for real-time messaging
- Connection management with user session tracking
- Message broadcasting to specific conversation participants

### Data Storage

**Database**
- PostgreSQL database via Neon serverless driver
- Drizzle ORM for type-safe database queries and schema management
- WebSocket connection using ws library (required for Neon serverless)

**Schema Design**
- Users table with profile data, verification status, and ratings
- Items table with ownership, category, availability, pricing, and location
- Bookings table tracking item reservations with status workflow
- Messages table for conversation threads between users
- Ratings table for user reviews
- Wishlist table for saved items
- Impact stats table for environmental tracking
- Sessions table for authentication state

**Storage Layer**
- Abstracted storage interface in server/storage.ts
- Methods for CRUD operations on all entities
- Join queries to fetch related data (e.g., items with owner information)
- Filter support for search, categories, distance, and verification status

### Design System

**Color Scheme**
- Primary: Green accent (hsl(142 76% 36%)) emphasizing eco-consciousness
- Neutral base colors for cards, backgrounds, and text
- CSS custom properties for light/dark mode support
- Semantic color tokens (primary, secondary, muted, accent, destructive)

**Component Patterns**
- Card-based layouts for items, profiles, and content sections
- Hover and active elevation effects for interactive elements
- Badge components for categories, status indicators, and verification
- Avatar components with fallback initials
- Toast notifications for user feedback

**Spacing & Layout**
- Tailwind spacing scale (4, 6, 8, 12, 16, 20, 24)
- Max-width containers (max-w-7xl) for content
- Responsive grids: 1-column mobile, 2-3 columns desktop
- Consistent padding and margins across components

### Routing & Navigation

**Client-Side Routes**
- `/` - Landing page for unauthenticated users, home dashboard for authenticated
- `/browse` - Item browsing with filters
- `/items/new` - Create new item listing
- `/items/:id` - Item detail with booking capability
- `/profile` - User profile with items and ratings
- `/messages` - Real-time messaging interface
- `/wishlist` - Saved items
- `/impact` - Environmental impact dashboard

**API Routes**
- `/api/auth/user` - Get current user
- `/api/login`, `/api/logout`, `/api/callback` - Authentication flow
- `/api/items/*` - Item CRUD and filtering
- `/api/bookings/*` - Booking management
- `/api/messages/*` - Messaging
- `/api/ratings/*` - User ratings
- `/api/wishlist/*` - Wishlist operations
- `/api/impact/*` - Impact statistics

## External Dependencies

**Database & Hosting**
- Neon PostgreSQL serverless database
- DATABASE_URL environment variable required for connection
- Drizzle Kit for schema migrations

**Authentication Service**
- Replit Auth OpenID Connect provider
- ISSUER_URL (defaults to https://replit.com/oidc)
- REPL_ID for client identification
- SESSION_SECRET for session encryption

**Third-Party Libraries**
- Radix UI primitives for accessible component foundation
- Recharts for data visualization (impact charts)
- date-fns for date formatting and manipulation
- Lucide React for icon system
- class-variance-authority for component variant management

**Development Tools**
- Replit-specific plugins for runtime error overlay and dev banner
- ESBuild for production server bundling
- TypeScript compiler for type checking

**Asset Management**
- Static assets served from attached_assets directory
- Image uploads stored as URLs in database (implementation assumes external storage)