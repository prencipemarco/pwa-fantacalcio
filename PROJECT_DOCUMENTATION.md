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
*   **`market.ts`**: handle auctions (create, bid), trades, and free agent signings.
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
*   **Trades**: Users propose direct swaps. Support for multi-player trades + credit balancing.
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

### User & Teams
*   **`users`**: Public profile table linked to Supabase Auth.
    *   `id` (UUID): Primary Key, references `auth.users(id)`.
    *   `email` (Text): Mirror of the auth email.
*   **`teams`**: The core entity for a user's fantasy team.
    *   `id` (UUID): Primary Key.
    *   `user_id` (UUID): References `auth.users` (or `public.users` via trigger).
    *   `name` (Text): Team name (e.g., "Real Madrid").
    *   `credits_left` (Int): Currency balance.
    *   `league_id` (UUID): Logic separation for multiple leagues.
    *   `password` (Text): Optional team-specific password.

### Players & Rosters
*   **`players`**: The comprehensive list of real-world Serie A players.
    *   `id` (BigInt): External ID from the data provider.
    *   `name` (Text): e.g., "Lautaro Martinez".
    *   `role` (Text): 'P' (GK), 'D' (DEF), 'C' (MID), 'A' (FWD).
    *   `team_real` (Text): Current Serie A club.
    *   `quotation` (Int): Current market value.
*   **`rosters`**: The link table defining ownership.
    *   `team_id` (UUID): Owner team.
    *   `player_id` (BigInt): Owned player.
    *   `purchase_price` (Int): Cost paid to acquire.

### Competition (Lineups & Results)
*   **`fixtures`**: The schedule of matches between Fantasy Teams.
    *   `matchday` (Int): 1-38.
    *   `home_team_id` / `away_team_id`: The competing teams.
    *   `home_goals` / `away_goals`: Calculated fantasy score.
    *   `calculated` (Boolean): True if the match has been processed.
*   **`lineups`**: Formations submitted by users for a specific matchday.
    *   `module` (Text): e.g., "3-4-3".
*   **`lineup_players`**: Detail of the lineup.
    *   `lineup_id`: Reference to parent formation.
    *   `player_id`: The player selected.
    *   `is_starter` (Boolean): Starter vs Bench.
    *   `bench_order` (Int): 0 for starters, 1+ for bench priority.
*   **`match_stats`**: The raw performance data (Votes, Goals, Assists).

### Market
*   **`auctions`**: Active bidding wars.
    *   `player_id`: The player being auctioned.
    *   `current_winner_team_id`: Highest bidder.
    *   `current_price` (Int): Current bid amount.
    *   `end_time` (Timestamp): When the auction closes.
    *   `status`: 'OPEN' or 'CLOSED'.
*   **`trade_proposals`**: Direct p2p exchanges supporting Multi-Player + Credits trades.
    *   `proposer_team_id` / `receiver_team_id`: The two teams involved.
    *   `proposer_player_ids` (`BIGINT[]`): Array of player IDs offered by the proposer.
    *   `receiver_player_ids` (`BIGINT[]`): Array of player IDs requested from the receiver.
    *   `proposer_credits` (Int): Cash offered by proposer.
    *   `receiver_credits` (Int): Cash requested from receiver.
    *   `status`: 'PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED'.

### System
*   **`leagues`**: Configuration for the tournament (Name).
*   **`settings`**: Key-Value store for global configs (e.g. `auction_duration_hours`).
*   **`logs`**: Audit trail for Admin actions (jsonb details).

---

## 🚀 Future Improvements

*   **Live Scoring**: Integrate an API to auto-calculate fantasy scores during games.
*   **Mobile Gestures**: Enhanced swipe actions for navigation. (Done)

## 📋 Changelog

### v0.2.0 - UI Polish & Auction System (Current)
*   **Navigation**: Implemented native swipe gestures for main tabs.
*   **Auctions**: Added live countdown timer, improved creation logic (creator = initial bidder), and "You Won" push notifications.
*   **Settings**: Redesigned with switches and segmented controls.
*   **Fixes**: Solved "Sent to 0 devices" push bug and various UI layout issues.(done - check for improvements)

---

*Documentation generated on 2026-01-23.*
