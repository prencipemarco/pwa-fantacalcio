# 📚 Fantacalcio PWA - Documentazione Completa

Questo documento fornisce una panoramica dettagliata del codice della PWA Fantacalcio, spiegando l'architettura, la struttura delle cartelle e i dettagli chiave dell'implementazione.

---

## 🏗 Panoramica Architettura

L'applicazione è costruita usando **Next.js 14** con architettura **App Router**. Sfrutta le Server Actions per la logica backend (interazioni Supabase) e i Client Components per l'interfaccia interattiva.

*   **Frontend**: React (Next.js), Tailwind CSS, Lucide Icons, Shadcn UI.
*   **Backend**: Supabase (PostgreSQL, Auth).
*   **Gestione Stato**: React Context (`LanguageContext` per impostazioni globali) + React State.
*   **PWA**: configurata via `manifest.json` e `src/app/layout.tsx`.

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

### `src/components` (Componenti UI)
Blocchi UI riutilizzabili.

*   **`ui/`**: Primitive core (Bottoni, Card, Modali) da **shadcn/ui**.
*   **`home/`**: Componenti specifici dashboard (Bottoni rapidi).
*   **`market/`**: Componenti complessi mercato (`ActiveAuctionsList`, `CreateAuctionModal`, `TradesSection`).
*   **`team-logo.tsx`**: Utility per renderizzare stemmi squadre (SVG/PNG) con fallback.
*   **`bottom-nav.tsx`**: Barra navigazione mobile-first.
*   **`swipe-navigator.tsx`**: Gestore gesture swipe per navigazione tab (Logica intelligente Stop-Propagation).
*   **`settings-dialog.tsx`**: Modale per cambio Lingua e Tema.

### `src/contexts` (Stato Globale)
*   **`LanguageContext.tsx`**:
    *   Gestisce **Traduzioni** (Dizionario IT/EN).
    *   Gestisce **Tema** (Dark/Light). Attiva la classe `.dark` sulla root HTML.

### `public`
Asset statici.
*   **`manifest.json`**: Critico per PWA. Definisce nome app, icone e colori tema.
*   **`teams/`**: Cartella contenente SVG/PNG per loghi squadre Serie A.

---

## 🔑 Funzionalità Chiave & Implementazione

### 1. Progressive Web App (PWA)
L'app è progettata per essere installata su dispostivi mobili.
*   **Manifest**: Configurato `display: standalone` per nascondere la barra URL.
*   **Splash Screen**: Componente custom (`src/components/splash-screen.tsx`) mostrato all'avvio durante l'idratazione.
*   **Viewport**: Meta tag `user-scalable=no` per prevenire zoom e dare feeling nativo.

### 2. Localizzazione & Temi
*   **Provider**: Avvolge l'intera app in `src/app/layout.tsx`.
*   **Storage**: Salva preferenze Lingua ('it'/'en') e Tema ('light'/'dark') nel `localStorage`.
*   **Uso**: I componenti usano l'hook: `const { t, theme } = useLanguage();`.

### 3. Mercato Trasferimenti
Una sezione complessa gestita in `src/app/team/market/page.tsx`.
*   **Aste**: Gli utenti aprono aste per giocatori. Altri utenti offrono crediti. Offerta più alta dopo 24h vince. Include **Timer Live** e notifiche push al vincitore.
*   **Scambi**: Utenti propongono scambi diretti. Supporto per scambi multi-giocatore + bilanciamento crediti.
*   **Svincolati**: Visualizzazione lista giocatori liberi (Listone) con filtri rapidi.
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

### v0.3.0 - Live Feature (In Planning)
*   **Backup**: Creata copia di sicurezza in `/archivio`.
*   **Live Mode**: Progettazione "Live Match".
    *   Visualizzazione partite Serie A in tempo reale (API Eventi).
    *   Calcolo Voti Live: Base 6 + Bonus/Malus basati su eventi reali (Gol, Assist, Cartellini).
    *   Nuova UI dedicata con navigazione personalizzata.

### v0.2.2 - Security, Market Refactor & Polishing
*   **Sicurezza**: Implementata protezione globale delle rotte via Middleware. Gli utenti non loggati vengono reindirizzati al login. La barra di navigazione è nascosta nella pagina di login.
*   **Mercato 2.0**: La creazione Asta ora avviene in una pagina dedicata (non più modale) per correggere i problemi con la tastiera mobile.
*   **Filtri Ricerca**: La ricerca giocatori ora esclude automaticamente i giocatori già presenti in altre rose o in aste attive.
*   **UI Formazione**: Semplificato il design del "pallino" giocatore nel campo: rimosso il logo squadra, aggiunto badge ruolo per maggiore chiarezza.
*   **Admin Fix**: Risolto crash critico causato da impostazioni lingua non valide.
*   **Bugfix**: Corretto swipe accidentale nella creazione scambi.

### v0.2.1 - Teams, Hotfixes & UI Reset (Attuale)
*   **Swipe Navigation Fix**: Risolto bug che attivava lo swipe cambio pagina interagendo con le modali (es. Nuova Asta).
*   **Pagina Squadre**: Nuova sezione `/teams` per visualizzare tutte le rose avversarie.
*   **Home Redesign**: Nuovi pulsanti rapidi per accesso diretto a "La Mia Rosa", "Listone Svincolati" e "Tutte le Squadre".
*   **Deep Linking**: Il pulsante "Listone" apre direttamente il mercato sula scheda Svincolati.

### v0.2.0 - UI Polish & Auction System
*   **Navigazione**: Implementate gesture swipe native tra i tab principali.
*   **Aste**: Aggiunto timer countdown live, logica creazione migliorata (creatore = primo offerente) e notifiche push "Hai Vinto".
*   **Impostazioni**: Ridisegnate con switch e controlli segmentati.
*   **Fix**: Risolto bug push "Sent to 0 devices" e vari layout fix.

---

- **Fix (v0.2.4-patch)**:
    - Added public **`/calendar`** page.
    - Improved **Audio Autoplay** (Tap to Unmute button).
    - Tweaked **Press Room** UI (Arrows moved to bottom).
    - **Feature**: Aggiunto **Image Cropping** (ritaglio) per le foto della Sala Stampa.
    - **Refinements**:
        - Audio: Tap to Stop/Mute.
        - Home Buttons: Nuovi tasti "Rosa" e "Mercato" compatti.
        - Mercato: Card giocatori ridotte.
        - Risultati: Giornata in grassetto.
        - Animazione App: Uscita più smooth.
    - **Refinements v2**:
        - **Calendario**: Implementazione API reale Serie A (`football-data.org`).
        - **Home**: Margini ridotti, Tasto Logout (Door Icon) al posto dei crediti.
        - **Audio**: Autoplay forzato e UI meno intrusiva.
        - **Sala Stampa**: Refresh rate aumentato a 10s, visualizzazione immagini migliorata.
    - **Refinements v3/v4**:
        - **Layout**: Full width reale (rimosso container/padding su mobile).
        - **Sala Stampa**: Auto-scroll (Carousel) ogni 7s.
        - **UI**: Padding rimossi dalle card per recuperare spazio.
    - **Refinements v6 (UI Polish)**:
        - **Home**: Header invertito (Logout <-> Settings), rimossi bottoni ridondanti, aggiunto tasto "Inserisci Rosa" (full width).
        - **Sala Stampa**: Indicatori a pallini (dots), swipe fluido (natural physics).
        - **Layout**: Margini globali `px-3` per respiro, Admin Login spaziato meglio.

*Documentazione aggiornata al 26/01/2026.*

### v0.2.4 - Press Room & Intro Refinements (Attuale)
*   **Sala Stampa 2.0**: Durata messaggi ridotta a 2h, supporto immagini, swipe navigation e timestamp relativi.
*   **Intro Fix**: Migliorata logica autoplay audio e aggiunta fallback "Tap to Unmute".
*   **Database**: Aggiunta colonna `image_url` per allegati multimediali.

### v0.2.3 - UI Overhaul & Community Features
*   **Intro Animation**: Nuova splash screen cinematica con loghi squadre orbitanti e audio personalizzabile.
*   **Next Match Widget**: Card "Prossimo Turno" ridisegnata con conto alla rovescia espandibile e link al calendario.
*   **Sala Stampa**: Nuova sezione in Home per messaggi e dichiarazioni tra presidenti (sviluppo community).
*   **Audio System**: Supporto per file MP3 caricabili da Admin per l'intro dell'app.
