# 📚 Fantacalcio PWA - Comprehensive Documentation

This document provides a detailed overview of the Fantacalcio PWA codebase, explaining the architecture, folder structure, and key implementation details.

---

## 🏗 Architecture Overview

The application is built using **Next.js 14** with the **App Router** architecture. It leverages Server Actions for backend logic (Supabase interactions) and Client Components for interactive UI.

*   **Frontend**: React (Next.js), Tailwind CSS, Lucide Icons, Shadcn UI.
*   **Backend**: Supabase (PostgreSQL, Auth).
*   **State Management**: React Context (`LanguageContext` for global settings) + React State.
*   **PWA**: configured via `manifest.json` and `src/app/layout.tsx`.

---

## 📂 Folder Structure

### `src/app` (App Router)
Contains the pages and routes of the application.

*   **`layout.tsx`**: The main wrapper. Handles the PWA `SplashScreen`, `LanguageProvider`, and bottom navigation (`BottomNav`).
*   **`page.tsx`**: The Home Page. Shows the `MatchdayReminder` and main dashboard.
*   **`globals.css`**: Global styles, including Tailwind directives and CSS variables for **Dark/Light Mode**.
*   **`login/`**: Login page (Supabase Auth).
*   **`standings/`**: League table page. Animated and responsive.
*   **`admin/`**: Admin dashboard for calculating scores and managing the market.
*   **`team/`**: User-specific team pages.
    *   **`create/`**: Wizard to create a new team.
    *   **`lineup/`**: Drag-and-drop interface to set the formation.
    *   **`market/`**: Transfer market hub (Auctions, Trades, Free Agents).
    *   **`results/`**: Match history timeline.

### `src/app/actions` (Server Actions)
Contains server-side logic. Next.js 14 allows calling these functions directly from Client Components.

*   **`user.ts`**: Fetch user profile, team ID, and roster.
*   **`team.ts`**: Save lineups, manage roster.
*   **`market.ts`**: Handle auctions (create, bid), trades, and free agent signings.
*   **`standings.ts`**: Calculate and fetch the league table.
*   **`results.ts`**: Fetch match fixtures and history.
*   **`football-data.ts`**: Integration with external APIs for real match scheduling.

### `src/components` (UI Components)
Reusable UI blocks.

*   **`ui/`**: Core primitives (Buttons, Cards, Modals) from **shadcn/ui**.
*   **`home/`**: Components specific to the home dashboard.
*   **`market/`**: Complex market components (`ActiveAuctionsList`, `CreateAuctionModal`, `TradesSection`).
*   **`team-logo.tsx`**: Utility component to render team badges (SVG/PNG) with fallback.
*   **`podium.tsx`**: (Legacy/Removed) Visual podium for standings.
*   **`bottom-nav.tsx`**: Mobile-first bottom navigation bar.
*   **`settings-dialog.tsx`**: Modal for changing Language and Theme.

### `src/contexts` (Global State)
*   **`LanguageContext.tsx`**:
    *   Manages **Translations** (IT/EN dictionary).
    *   Manages **Theme** (Dark/Light). Toggles the `.dark` class on the HTML root.

### `public`
Static assets.
*   **`manifest.json`**: Critical for PWA. Defines app name, icons, and theme colors.
*   **`teams/`**: Folder containing SVGs/PNGs for Serie A team logos.

---

## 🔑 Key Features & Implementation

### 1. Progressive Web App (PWA)
The app is designed to be installed on mobile devices.
*   **Manifest**: Configured `display: standalone` to hide the browser URL bar.
*   **Splash Screen**: Custom component (`src/components/splash-screen.tsx`) that shows a logo on launch while the app hydrates.
*   **Viewport**: `user-scalable=no` meta tag to prevent zooming and feel native.

### 2. Localization & Theming
*   **Provider**: Wraps the entire app in `src/app/layout.tsx`.
*   **Storage**: Persists user preference for Language ('it'/'en') and Theme ('light'/'dark') in `localStorage`.
*   **Usage**: Components use the hook: `const { t, theme } = useLanguage();`.

### 3. Transfer Market
A complex section handled in `src/app/team/market/page.tsx`.
*   **Auctions**: Users can open auctions for players. Other users bid credits. The highest bid after 24h wins (logic often requires a cron job or admin trigger, currently manual closing supported in Admin).
*   **Trades**: Users propose direct swaps (Player A + Credits <-> Player B).
*   **Release**: Users can cut players to refund credits (default 50% or full value depending on config).

### 4. Lineup Builder (`src/app/team/lineup/page.tsx`)
Uses `@dnd-kit/core` for drag-and-drop.
*   **Logic**: Users drag players from "My Roster" (Left Panel) to the "Pitch" (Center) or "Bench".
*   **Validation**: Ensures 11 players and valid roles per module (e.g., 3-4-3).
*   **Persistence**: Saves to Supabase `lineups` table linked to the specific `matchday`.

### 5. Results & Standings
*   **Standings**: Calculated dynamically based on match results. Tracks Points, GF (Goals For), GA (Goals Against).
*   **Results**: Displayed as a timeline with color-coded badges (Green/Yellow/Red). Uses a server action to resolve opponent names for clarity.

---

## 🗄 Database Schema (Supabase)

*   **`users`**: Auth profiles.
*   **`teams`**: User teams (Credits, Name, UserID).
*   **`players`**: The list of all real Serie A players (Role, Name, Team).
*   **`rosters`**: Link table (TeamID <-> PlayerID).
*   **`lineups`**: Saved lineups per matchday.
*   **`fixtures`**: Match schedule (HomeTeam, AwayTeam, GoalsHome, GoalsAway).
*   **`auctions`**: Market auctions.
*   **`trades`**: Trade proposals between teams.

---

## 🚀 Future Improvements

*   **Live Scoring**: Integrate an API to auto-calculate fantasy scores during games.
*   **Push Notifications**: Notify users just before lineup lock or when outbid in auctions.
*   **Mobile Gestures**: Enhanced swipe actions for navigation.

---

*Documentation generated on 2026-01-23.*
