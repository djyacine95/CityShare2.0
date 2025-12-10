# CityShare – Local Item Sharing Platform

## Overview

CityShare is a community web app that lets people borrow, lend, and share items within their neighborhood. The goal is to reduce waste, build trust, and make it easy for users to share everyday items. Users can list items, browse with filters, manage bookings, chat in real time, track their environmental impact, and save items to a wishlist.

## Frontend

- Built with **React 18** and **TypeScript**
- **Vite** for fast builds and hot reload
- **Wouter** for lightweight routing
- **React Hook Form + Zod** for validation
- **Shadcn/ui**, **Tailwind CSS**, and custom fonts (Inter & Outfit)
- Responsive layouts and mobile-first design
- **TanStack Query** for data fetching and caching
- WebSocket support for real-time messaging

## Backend

- **Express.js** server with REST API
- Separate dev and production entry points
- Serves static files in production
- Middleware for auth, logging, and JSON parsing
- Protected routes for authenticated users
- WebSocket server for real-time chat

## Database & Storage

- **PostgreSQL** with **Drizzle ORM**
- Tables for users, items, bookings, messages, ratings, wishlist, impact stats, and sessions
- Support for filtering, searching, and relational queries
- Abstracted storage layer for CRUD operations
- Image URLs stored directly in the database

## Authentication

- OpenID Connect–based login
- Session storage using PostgreSQL
- Cookies are HTTP-only and secure
- Token refresh built in for long sessions

## Design System

- Green-accent color theme
- Card-based UI patterns
- Badges, avatars, toasts, and reusable components
- Light and dark mode support
- Consistent spacing and grid layout across pages

## Frontend Routes

- `/` – Landing or dashboard
- `/browse` – Browse items with filters
- `/items/new` – Create a listing
- `/items/:id` – Item details & booking
- `/profile` – User profile
- `/messages` – Chat interface
- `/wishlist` – Saved items
- `/impact` – Environmental stats

## API Routes

- Auth: `/api/auth/user`, `/api/login`, `/api/logout`, `/api/callback`
- Items: `/api/items/*`
- Bookings: `/api/bookings/*`
- Messages: `/api/messages/*`
- Ratings: `/api/ratings/*`
- Wishlist: `/api/wishlist/*`
- Impact: `/api/impact/*`

## Other Dependencies

- Radix UI primitives
- Recharts for charts
- date-fns for time formatting
- Lucide React icons
- ESBuild and TypeScript for building and typing
- Static assets served from a public folder

## Installation Requirements
Make sure the following are installed before running CityShare:
1. Node.js v21.2+
2. npm 10+ (comes with Node)
3. PostgreSQL 14+

## Build Instructions
Requires Node version 21.2+
1. npm i
2. npm run dev
