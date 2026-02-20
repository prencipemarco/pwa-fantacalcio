# ⚽️ FantaCalcio PWA - Documentazione Completa

Manage your Fantacalcio team with this modern, mobile-first Progressive Web App (PWA). Questo documento fornisce una panoramica dettagliata del codice della PWA Fantacalcio, spiegando l'architettura, la struttura delle cartelle e i dettagli chiave dell'implementazione.

---

## 📱 Features

*   **PWA Ready**: Installable on iOS (Add to Home Screen) and Android.
*   **Team Management**: Set your lineup (3-4-3, 4-3-3, etc.), manage bench, and view player prices/stats.
*   **Live Results**: View match results with calculated fantasy scores (Win/Draw/Loss badges).
*   **Standings**: Stylish, interactive league table with podium visualization.
*   **Transfer Market**:
    *   **Auction System**: Create and bid on players (24h auctions).
    *   **Trades**: Propose and accept trades with other users (Players + Credits).
    *   **Free Agents**: Sign available players.
*   **Matchday Reminder**: Countdown to lineup lock and Next Matchday info.
*   **Admin Panel**: Manage market, auctions, and score calculation.
*   **Dark Mode**: Fully supported system-wide dark mode.
*   **Multi-language**: Italian 🇮🇹 and English 🇬🇧 support.

---

## 🛠 Tech Stack & Panoramica Architettura

L'applicazione è costruita usando **Next.js 14** con architettura **App Router**. Sfrutta le Server Actions per la logica backend (interazioni Supabase) e i Client Components per l'interfaccia interattiva.

*   **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
*   **Database & Auth**: [Supabase](https://supabase.com/) (PostgreSQL)
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
*   **Icons**: [Lucide React](https://lucide.dev/)
*   **Animations**: Framer Motion & Tailwind Animate
*   **Gestione Stato**: React Context (`LanguageContext` per impostazioni globali) + React State.
*   **PWA**: configurata via `manifest.json` e `src/app/layout.tsx`.

---

## 🚀 Getting Started

1.  **Clone the repo**
    ```bash
    git clone https://github.com/prencipemarco/pwa-fantacalcio.git
    cd pwa-fantacalcio
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Environment Setup**
    Create `.env.local` con le tue credenziali Supabase:
    ```env
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    FOOTBALL_DATA_API_KEY=your_football_data_api_key (Optional)
    ```

4.  **Run Development Server**
    ```bash
    npm run dev
    ```

5.  **Build for Production**
    ```bash
    npm run build
    npm start
    ```

---

## 📂 Struttura Cartelle

### `src/app` (App Router)
Contiene le pagine e le rotte dell'applicazione.

*   **`layout.tsx`**: Wrapper principale. Gestisce la PWA `SplashScreen`, il `LanguageProvider` e la navigazione inferiore (`BottomNav`).
*   **`page.tsx`**: Home Page. Mostra il `MatchdayReminder` e la dashboard principale.
*   **`globals.css`**: Stili globali, incluse direttive Tailwind e variabili CSS per **Dark/Light Mode**.
*   **`login/`**: Pagina log (Supabase Auth).
*   **`standings/`**: Pagina classifica. Animata e responsive.
*   **`admin/`**: Dashboard amministratore per calcolare punteggi e gestire il mercato.
*   **`teams/`**: **[NUOVO]** Lista di tutte le squadre avversarie con rose espandibili.
*   **`team/`**: Pagine specifiche della squadra utente.
    *   **`create/`**: Wizard per creare una nuova squadra.
    *   **`lineup/`**: Interfaccia Drag-and-drop per schierare la formazione.
    *   **`market/`**: Hub mercato trasferimenti (Aste, Scambi, Svincolati).
    *   **`results/`**: Timeline storico partite.

### `src/app/actions` (Server Actions)
Contiene la logica lato server. Next.js 14 permette di chiamare queste funzioni direttamente dai Client Components.

*   **`user.ts`**: Recupero profilo utente, ID squadra e rosa.
*   **`team.ts`**: Salvataggio formazioni, gestione rosa.
*   **`market.ts`**: Gestione aste (crea, offri), scambi e acquisto svincolati.
*   **`standings.ts`**: Calcolo e recupero classifica.
*   **`results.ts`**: Recupero calendario e storico partite.
*   **`football-data.ts`**: Integrazione API esterne per orari reali partite.
*   **`stats.ts`**: Calcolo e recupero delle statistiche giocatori (Media Voto, Fantavoto, Bonus/Malus).

### `src/components` (Componenti UI)
Blocchi UI riutilizzabili.

*   **`ui/`**: Primitive core (Bottoni, Card, Modali) da **shadcn/ui**.
*   **`home/`**: Componenti specifici dashboard (Bottoni rapidi).
*   **`market/`**: Componenti complessi mercato (`ActiveAuctionsList`, `CreateAuctionModal`, `TradesSection`, modale `PlayerDetailsModal`).
*   **`team-logo.tsx`**: Utility per renderizzare stemmi squadre (SVG/PNG) con fallback.
*   **`bottom-nav.tsx`**: Barra navigazione mobile-first.
*   **`swipe-navigator.tsx`**: Gestore gesture swipe per navigazione tab (Logica intelligente Stop-Propagation).
*   **`settings-dialog.tsx`**: Modale per cambio Lingua e Tema.
*   **`theme-provider.tsx` / `theme-toggle.tsx`**: Gestori visuali del Theme Dark/Light tramite `next-themes`.

### `src/contexts` (Stato Globale)
*   **`LanguageContext.tsx`**:
    *   Gestisce **Traduzioni** (Dizionario IT/EN).
    *   Gestisce **Tema** (Dark/Light). Attiva la classe `.dark` sulla root HTML.

### `public`
Asset statici.
*   **`manifest.json`**: Critico per PWA. Definisce nome app, icone e colori tema.
*   **`teams/`**: Cartella contenente SVG/PNG per loghi squadre Serie A.

### `scripts`
Contiene script Python di utilità generica:
*   Conversione `.xlsx` in `.csv` per listone e voti (es. `process_listone.py`, `process_votes.py`, `process_rosters.py`).

---

## 🔑 Funzionalità Chiave & Implementazione

### 1. Progressive Web App (PWA)
L'app è progettata per essere installata su dispostivi mobili.
*   **Manifest**: Configurato `display: standalone` per nascondere la barra URL.
*   **Splash Screen**: Componente custom (`src/components/splash-screen.tsx`) mostrato all'avvio durante l'idratazione.
*   **Viewport**: Meta tag `user-scalable=no` per prevenire zoom e dare feeling nativo.

### 2. Localizzazione & Temi
*   **Provider**: Avvolge l'intera app in `src/app/layout.tsx`. E' affiancato anche dal `ThemeProvider` di `next-themes` per una corretta idratazione.
*   **Storage**: Salva preferenze Lingua ('it'/'en') e Tema ('light'/'dark') nel `localStorage`.
*   **Uso**: I componenti usano l'hook: `const { t } = useLanguage();` o `useTheme()`.

### 3. Mercato Trasferimenti
Una sezione complessa gestita in `src/app/team/market/page.tsx`.
*   **Aste**: Gli utenti aprono aste per giocatori. Altri utenti offrono crediti. Offerta più alta dopo 24h vince. Include **Timer Live** e notifiche push al vincitore.
*   **Scambi**: Utenti propongono scambi diretti. Supporto per scambi multi-giocatore + bilanciamento crediti.
*   **Svincolati**: Visualizzazione lista giocatori liberi (Listone) con filtri rapidi. Cliccando un giocatore si può accedere alle sue **statistiche dettagliate**.
*   **Taglio**: Utenti possono tagliare giocatori per recuperare crediti.

### 4. Gestore Formazione (`src/app/team/lineup/page.tsx`)
Usa `@dnd-kit/core` per drag-and-drop.
*   **Logica**: Utenti trascinano giocatori da "La Mia Rosa" (Pannello SX) al "Campo" (Centro) o "Panchina".
*   **Validazione**: Assicura 11 giocatori e ruoli validi per modulo (es. 3-4-3).
*   **Persistenza**: Salva su tabella Supabase `lineups` collegata alla giornata specifica.

### 5. Risultati & Classifica
*   **Classifica**: Calcolata dinamicamente dai risultati. Traccia Punti, GF (Gol Fatti), GS (Gol Subiti).
*   **Risultati**: Visualizzati come timeline con badge colorati (Verde/Giallo/Rosso).

---

## 🗄 Schema Database (Supabase)

### Utenti & Squadre
*   **`users`**: Profilo pubblico collegato a Supabase Auth.
*   **`teams`**: Entità core per la squadra fanta dell'utente.
    *   `credits_left` (Int): Bilancio valuta.
    *   `league_id`: Separazione logica leghe.

### Giocatori & Rose
*   **`players`**: Lista completa giocatori Serie A reali.
    *   `quotation` (Int): Valore di mercato attuale.
*   **`rosters`**: Tabella di collegamento definente la proprietà.
    *   `purchase_price` (Int): Costo pagato per acquisto.

### Competizione
*   **`fixtures`**: Calendario partite tra Fanta Squadre.
*   **`lineups`**: Formazioni inviate.
*   **`match_stats`**: Dati performance grezzi (Voti, Gol, Assist).

### Mercato
*   **`auctions`**: Aste attive.
    *   `current_winner_team_id`: Miglior offerente attuale.
    *   `end_time` (Timestamp): Chiusura asta.
*   **`trade_proposals`**: Scambi P2P diretti con supporto crediti.

### Sistema
*   **`push_subscriptions`**: Endpoint notifiche WebPush degli utenti.
*   **`settings`**: Store chiave-valore per config globali (es. `auction_duration_hours`).
*   **`logs`**: Audit trail azioni Admin.

---

## 🚀 Miglioramenti Futuri

*   **Live Scoring**: Integrare API per calcolo voti live durante le partite.

## 📋 Changelog (Registro Modifiche)

### Recenti (Feature Statistiche e UI Polishing)
*   **Statistiche Giocatori**: Implementata aggregazione delle statistiche su base DB (`Media Voto`, `Fantavoto`, Gol, Assist ecc.) visualizzabili in UI per ogni svincolato.
*   **Layout Fixes**: Corretti allineamenti `Risultati Partite` per i nomi squadre lunghi. Aggiornati i dark mode color in login (`Sign Up`).
*   **Sala Stampa**: Dimensione visiva raddoppiata di default in homepage.

### v0.3.0 - Live Feature (In Planning)
*   **Backup**: Creata copia di sicurezza in `/archivio`.
*   **Live Mode**: Progettazione "Live Match".
    *   Visualizzazione partite Serie A in tempo reale (API Eventi).
    *   Calcolo Voti Live: Base 6 + Bonus/Malus basati su eventi reali (Gol, Assist, Cartellini).
    *   Nuova UI dedicata con navigazione personalizzata.

### v0.2.2 - Security, Market Refactor & Polishing
*   **Sicurezza**: Implementata protezione globale delle rotte via Middleware.
*   **Mercato 2.0**: La creazione Asta ora avviene in una pagina dedicata.
*   **Filtri Ricerca**: Svincolati ricerca intelligente esclude tesserati in altre rose.
*   **UI Formazione**: Semplificato il design del "pallino".

### v0.2.1 - Teams, Hotfixes & UI Reset
*   **Swipe Navigation Fix**: Risolto propagazione eventi modali.
*   **Pagina Squadre**: Nuova sezione `/teams`.

### v0.2.0 - UI Polish & Auction System
*   **Navigazione**: Implementate gesture swipe native.
*   **Aste**: Timer live e push notifiche.

---
## 📝 License

This project is licensed under the MIT License test.
