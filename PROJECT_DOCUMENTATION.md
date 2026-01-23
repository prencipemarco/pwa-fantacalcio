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

### User & Teams
*   **`users`**: Handled by Supabase Auth (in the `auth` schema). Linked to public data via `teams`.
*   **`teams`**: The core entity for a user's fantasy team.
    *   `id` (UUID): Primary Key.
    *   `user_id` (UUID): References `auth.users`.
    *   `name` (Text): Team name (e.g., "Real Madrid").
    *   `credits_left` (Int): Currency balance for market operations (Default: 1000).
    *   `league_id` (UUID): Logic separation for multiple leagues (optional).

### Players & Rosters
*   **`players`**: The comprehensive list of real-world Serie A players.
    *   `id` (BigInt): External ID from the data provider.
    *   `name` (Text): e.g., "Lautaro Martinez".
    *   `role` (Text): 'P' (GK), 'D' (DEF), 'C' (MID), 'A' (FWD).
    *   `team_real` (Text): Current Serie A club (e.g., "Inter").
    *   `quotation` (Int): Current market value.
*   **`rosters`**: The link table defining ownership.
    *   `team_id` (UUID): Owner team.
    *   `player_id` (BigInt): Owned player.
    *   `purchase_price` (Int): Cost paid to acquire.
    *   *Constraint*: A player can only be in one roster per league (handled by logic, potentially unique constraint).

### Competition (Lineups & Results)
*   **`fixtures`**: The schedule of matches between Fantasy Teams.
    *   `matchday` (Int): 1-38.
    *   `home_team_id` / `away_team_id`: The competing teams.
    *   `home_goals` / `away_goals`: Calculated fantasy score (e.g. 72.5 -> 2 goals).
    *   `calculated` (Boolean): True if the match has been processed.
*   **`lineups`**: Formations submitted by users for a specific matchday.
    *   `module` (Text): e.g., "3-4-3".
*   **`lineup_players`**: Detail of the lineup.
    *   `lineup_id`: Reference to parent formation.
    *   `player_id`: The player selected.
    *   `is_starter` (Boolean): Starter vs Bench.
    *   `bench_order` (Int): Priority for substitutions (1, 2, 3...).
*   **`match_stats`**: The raw performance data (Votes, Goals, Assists) imported weekly to calculate scores.

### Market
*   **`auctions`**: Active bidding wars.
    *   `player_id`: The player being auctioned.
    *   `current_winner_team_id`: Highest bidder.
    *   `current_price` (Int): Current bid amount.
    *   `end_time` (Timestamp): When the auction closes.
    *   `status`: 'OPEN' or 'CLOSED'.
*   **`trade_proposals`**: Direct p2p exchanges.
    *   `proposer_team_id` / `receiver_team_id`: Who is trading.
    *   `proposer_player_id` / `receiver_player_id`: The swap assets.
    *   `credits_offer` (Int): Balancing cash (can be negative/positive depending on logic, here explicitly "offer").
    *   `status`: 'PENDING', 'ACCEPTED', 'REJECTED'.

### System
*   **`leagues`**: Configuration for the tournament (Name).
*   **`settings`**: Key-Value store for global configs (e.g., `auction_duration_hours`, `market_open_hour`).
*   **`logs`**: Audit trail for Admin actions (e.g., "Market closed", "Scores calculated").

---

## 🚀 Future Improvements

*   **Live Scoring**: Integrate an API to auto-calculate fantasy scores during games.
*   **Push Notifications**: Notify users just before lineup lock or when outbid in auctions.
*   **Mobile Gestures**: Enhanced swipe actions for navigation.

---

*Documentation generated on 2026-01-23.*
