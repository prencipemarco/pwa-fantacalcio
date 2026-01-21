# Fantacalcio PWA v0.1

Fantacalcio Manager application built with Next.js 14 and Supabase.

## 🚀 Main Features (v0.1)

### 👥 Team Management
- **User Authentication**: Sign up/Login via Supabase Auth.
- **Team Creation**: Users can create their own team with a secure password.
- **Admin Dashboard**: Full control for administrators.
    - **Parametric Seeder**: Generate N test teams for debugging.
    - **Single Team Deletion**: Granular control to remove specific teams and cascading data.
    - **Reset Tools**: Granular system reset (Market, Rosters, Logs, etc.).

### 📅 Calendar & Fixtures
- **Automated Generation**: Berger algorithm implementation.
- **38 Matchdays**: Automatically loops fixtures to cover a full Serie A season style calendar.
- **Table View**: Clear visualization of matches per day.
- **Persisted State**: Fixtures are saved to database.

### 💰 Market System
- **Auction Mechanism**: Create and bid on players (English auction style).
- **Free Agents (Listone)**: Browse and purchase available players.
- **Credits Management**: Real-time budget tracking.
- **Roster Management**: View owned players.

### ⚽ Competitive Features
- **Lineup Builder**: Interactive pitch view to set formation (3-4-3, 4-4-2, etc.).
- **Results Page**: View match outcomes (calculated vs upcoming).
- **Team Locked Mode**: Password protection for team management to prevent unauthorized changes.

### 🌍 Internationalization
- **Multi-language Support**: Full IT/EN translation.
- **Smart Toggle**: Animated flag selector for language switching.

## 🛠 Tech Stack
- **Frontend**: Next.js 14 (App Router), Tailwind CSS, Lucide React, Shadcn/UI.
- **Backend**: Supabase (PostgreSQL, Auth, Edge Functions).
- **Deployment**: Vercel (PWA support enabled).

## 📦 Setup

1. Clone repository.
2. `npm install`
3. Set up `.env` with Supabase credentials.
4. `npm run dev`
