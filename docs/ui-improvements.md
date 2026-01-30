# MEGA PROMPT - Miglioramento Completo UI Fantacalcio

## 🎯 Obiettivo Generale
Ridisegnare e migliorare l'intera esperienza utente dell'applicazione Fantacalcio, ottimizzando ogni schermata per usabilità, accessibilità e design moderno, mantenendo coerenza visiva e identità del brand.

---

## 📋 CHECKLIST IMPLEMENTAZIONE PER ANTIGRAVITY

**Seguire questo ordine step-by-step:**

### ✅ Step 1: Setup Iniziale (5 minuti)
- [ ] Leggere completamente questo documento (`/docs/ui-improvements.md`)
- [ ] Verificare screenshots in `/docs/screenshots/`
- [ ] Controllare struttura progetto esistente
- [ ] Confermare disponibilità componenti shadcn/ui in `/src/components/ui/`

### ✅ Step 2: Design Tokens (15 minuti)
- [ ] Creare `/design-token/colors.ts`
- [ ] Creare `/design-token/typography.ts`
- [ ] Creare `/design-token/spacing.ts`
- [ ] Modificare `tailwind.config.ts` con nuovi colori e animazioni

### ✅ Step 3: Hooks Custom (20 minuti)
- [ ] Creare `/src/hooks/use-matchday.ts` (auto-scroll giornata)
- [ ] Creare `/src/hooks/use-credits.ts` (calcolo crediti)
- [ ] Creare `/src/hooks/use-formation.ts` (gestione formazione)
- [ ] Modificare `/src/app/actions/football-data.ts` (aggiungere getCurrentMatchday)

### ✅ Step 4: Home Screen (45 minuti) [PRIORITÀ ALTA]
- [ ] Modificare `/src/components/home/home-content.tsx`
- [ ] Creare `/src/components/home/next-match-card.tsx`
- [ ] Creare `/src/components/home/rosa-widget.tsx`
- [ ] Creare `/src/components/home/explore-section.tsx`
- [ ] Modificare `/src/components/countdown.tsx`
- [ ] Modificare `/src/app/page.tsx` per usare i nuovi componenti

### ✅ Step 5: Bottom Navigation (15 minuti) [PRIORITÀ ALTA]
- [ ] Modificare `/src/components/bottom-nav.tsx` (label più grandi, stato attivo chiaro)

### ✅ Step 6: Settings Dialog (30 minuti) [PRIORITÀ ALTA]
- [ ] Modificare `/src/components/settings-dialog.tsx` (redesign completo)

### ✅ Step 7: Classifica (40 minuti) [PRIORITÀ ALTA]
- [ ] Creare cartella `/src/components/standings/`
- [ ] Creare `/src/components/standings/leaderboard-table.tsx`
- [ ] Creare `/src/components/standings/team-row.tsx`
- [ ] Modificare `/src/app/standings/page.tsx`

### ✅ Step 8: Risultati Partite (50 minuti) [PRIORITÀ MEDIA]
- [ ] Creare cartella `/src/components/results/`
- [ ] Creare `/src/components/results/match-card.tsx`
- [ ] Creare `/src/components/results/match-list.tsx`
- [ ] Modificare `/src/app/team/results/page.tsx` (con auto-scroll)

### ✅ Step 9: Formazione (60 minuti) [PRIORITÀ MEDIA]
- [ ] Creare cartella `/src/components/lineup/`
- [ ] Creare `/src/components/lineup/formation-pitch.tsx`
- [ ] Creare `/src/components/lineup/player-list.tsx`
- [ ] Creare `/src/components/lineup/player-card.tsx`
- [ ] Creare `/src/components/lineup/player-details.tsx`
- [ ] Modificare `/src/app/team/lineup/page.tsx`

### ✅ Step 10: Mercato (50 minuti) [PRIORITÀ MEDIA]
- [ ] Creare `/src/components/market/market-tabs.tsx`
- [ ] Creare `/src/components/market/player-grid.tsx`
- [ ] Creare `/src/components/market/filter-bar.tsx`
- [ ] Modificare `/src/components/market/free-agents.tsx`
- [ ] Modificare `/src/app/team/market/page.tsx`

### ✅ Step 11: Testing & Polish (30 minuti)
- [ ] Test responsive mobile/tablet/desktop
- [ ] Test accessibilità (focus states, contrast)
- [ ] Test navigazione keyboard
- [ ] Verificare che tutti i componenti usino shadcn/ui esistenti
- [ ] Code review per TypeScript errors

### ✅ Step 12: Documentation
- [ ] Aggiornare README con nuove funzionalità
- [ ] Documentare nuovi hooks e loro utilizzo
- [ ] Annotare breaking changes (se presenti)

---

## ⏱️ STIMA TEMPI TOTALI
- **Must Have (Step 1-7)**: ~3 ore
- **Should Have (Step 8-10)**: ~3 ore  
- **Testing & Polish**: ~1 ora
- **TOTALE**: ~7 ore di lavoro

---

## 📋 Informazioni di Progetto

### Stack Tecnologico
- **Framework**: React con Tailwind CSS
- **API Backend**: Football-data.org (per dati giornate e partite)
- **Approccio**: Mobile-first, responsive design
- **Accessibilità**: WCAG 2.1 AA compliance
- **Performance Target**: LCP < 2.5s, CLS < 0.1

### Brand Identity
- **Colori primari**: Blu (#5B7FFF), Verde (#10B981)
- **Colori secondari**: Arancione (#F97316 per portieri), Giallo (#FCD34D per difensori)
- **Typography**: Font sans-serif moderno (Inter o similar)
- **Border radius**: 8px-16px per cards
- **Spacing system**: 4px, 8px, 12px, 16px, 24px, 32px, 48px

### Struttura Cartelle Raccomandata
```
/fantacalcio-project
├── /docs
│   ├── ui-improvements.md (questo documento)
│   ├── design-system.md
│   └── /screenshots (immagini di riferimento)
├── /src
│   ├── /components
│   │   ├── /home (HomeScreen, NextMatchCard, RosaWidget)
│   │   ├── /formation (FormationPitch, PlayerList, PlayerCard)
│   │   ├── /market (MarketTabs, PlayerGrid, FilterBar)
│   │   ├── /results (MatchList, MatchCard, DayNavigator)
│   │   ├── /leaderboard (LeaderboardTable, TeamRow)
│   │   ├── /settings (SettingsModal, ThemeToggle)
│   │   └── /shared (BottomNav, Header, Button, Badge)
│   ├── /hooks (useMatchday, useFormation, useCredits)
│   ├── /services (api-football.js)
│   └── /utils (formatTime, calculateCredits)
└── /design-tokens
    ├── colors.js
    ├── spacing.js
    └── typography.js
```

---

## 🏠 SCHERMATA 1: HOME / DASHBOARD

### Analisi Problemi Attuali
1. Barra verde laterale sulla card partita poco funzionale e senza scopo chiaro
2. Countdown "79h 23m MANCANO" sovradimensionato, poco contestualizzato
3. Gerarchia visiva confusa (PROSSIMA GIORNATA vs titolo partita)
4. Widget Rosa: crediti residui (79) troppo piccoli e nascosti
5. Email visibile inutilmente nella vista principale
6. Bottoni Rosa/Asta con stato attivo poco chiaro
7. Sidebar Esplora con troppo spazio vuoto, voci poco informative
8. Classifica: manca evidenziazione squadra utente, no indicatori tendenza

### Miglioramenti Richiesti

#### 1.1 Card Prossima Partita
**Design target:**
```
┌─────────────────────────────────────────┐
│ GIORNATA 23 • 30 Gen, 20:45        🔔   │
│                                         │
│        SS Lazio  VS  Genoa CFC          │
│        [logo]        [logo]             │
│                                         │
│  ⏰ 79h 23m rimanenti                   │
│     per schierare la formazione         │
│                                         │
│  [!] 3 giocatori da inserire            │
│                                         │
│  [Vai alla Formazione →]                │
└─────────────────────────────────────────┘
```

**Implementazione:**
- Rimuovere completamente la barra verde laterale
- Header card: "GIORNATA 23" in uppercase, small, gray-600
- Titolo partita: font-bold text-xl al centro con loghi squadre
- Countdown: ridotto al 60%, con icona clock, label descrittiva sotto
- Status badge: se formazione incompleta, mostrare alert arancione con numero giocatori mancanti
- CTA button: "Vai alla Formazione" grande, blu, con icona arrow-right
- Card style: bg-white, rounded-xl, shadow-lg, hover:shadow-xl transition

**Stati del countdown:**
- Verde: >48h (text-green-600, bg-green-50)
- Giallo: 24-48h (text-amber-600, bg-amber-50)
- Rosso: <24h (text-red-600, bg-red-50, pulsing animation)

**Codice esempio Tailwind:**
```jsx
<div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
  <div className="flex justify-between items-center mb-4">
    <span className="text-xs font-semibold text-gray-500 uppercase">Giornata 23 • 30 Gen, 20:45</span>
    <Bell className="w-5 h-5 text-gray-400" />
  </div>
  
  <div className="flex justify-center items-center gap-8 mb-6">
    <div className="text-center">
      <img src={lazioLogo} className="w-16 h-16 mb-2" />
      <p className="font-bold text-lg">SS Lazio</p>
    </div>
    <span className="text-2xl font-bold text-gray-400">VS</span>
    <div className="text-center">
      <img src={genoaLogo} className="w-16 h-16 mb-2" />
      <p className="font-bold text-lg">Genoa CFC</p>
    </div>
  </div>
  
  <div className="bg-amber-50 rounded-lg p-4 mb-4">
    <div className="flex items-center justify-center gap-2 mb-1">
      <Clock className="w-5 h-5 text-amber-600" />
      <span className="text-2xl font-bold text-amber-600">79h 23m</span>
    </div>
    <p className="text-sm text-amber-700 text-center">rimanenti per schierare la formazione</p>
  </div>
  
  <div className="bg-orange-50 border-l-4 border-orange-400 p-3 mb-4">
    <p className="text-sm text-orange-700">⚠️ 3 giocatori da inserire</p>
  </div>
  
  <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors">
    Vai alla Formazione
    <ArrowRight className="w-5 h-5" />
  </button>
</div>
```

#### 1.2 Widget Rosa e Gestione Crediti
**Design target:**
```
┌─────────────────────────────────────┐
│  La Mia Rosa                   79   │
│  principale_marco@gmail.com    ━━━━ │
│                              CREDITI│
│  ┌─────────┐ ┌─────────┐           │
│  │  Rosa   │ │  Asta   │           │
│  │ 25 gioc │ │ 45 disp │           │
│  └─────────┘ └─────────┘           │
└─────────────────────────────────────┘
```

**Implementazione:**
- **Crediti display**: posizione top-right, numero grande (text-4xl), progress bar circolare o lineare
- **Progress bar logica**: 
  - Verde: >50 crediti disponibili
  - Giallo: 20-50 crediti
  - Rosso: <20 crediti
- **Email**: spostare nel menu Impostazioni, non visibile qui
- **Bottoni Rosa/Asta**: 
  - Attivo: bg-blue-600 text-white shadow-md
  - Inattivo: border-2 border-gray-300 text-gray-600 hover:border-blue-400
  - Badge numerici: corner top-right con numero giocatori
  
**Codice esempio:**
```jsx
<div className="bg-white rounded-xl shadow-lg p-6">
  <div className="flex justify-between items-start mb-6">
    <div>
      <h3 className="text-xl font-bold text-gray-900">La Mia Rosa</h3>
      <p className="text-sm text-gray-500">25 giocatori</p>
    </div>
    <div className="text-right">
      <div className="inline-flex items-center gap-2 bg-green-50 px-4 py-2 rounded-lg">
        <Wallet className="w-5 h-5 text-green-600" />
        <div>
          <p className="text-3xl font-bold text-green-600">79</p>
          <p className="text-xs text-green-700">crediti</p>
        </div>
      </div>
      <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div className="h-full bg-green-500" style={{width: '79%'}}></div>
      </div>
    </div>
  </div>
  
  <div className="flex gap-3">
    <button className="flex-1 relative bg-blue-600 text-white font-semibold py-3 rounded-lg shadow-md hover:bg-blue-700 transition">
      Rosa
      <span className="absolute -top-2 -right-2 bg-blue-800 text-white text-xs px-2 py-1 rounded-full">25</span>
    </button>
    <button className="flex-1 relative border-2 border-gray-300 text-gray-600 font-semibold py-3 rounded-lg hover:border-blue-400 hover:text-blue-600 transition">
      Asta
      <span className="absolute -top-2 -right-2 bg-gray-400 text-white text-xs px-2 py-1 rounded-full">45</span>
    </button>
  </div>
</div>
```

#### 1.3 Sidebar Esplora - Migliorata
**Design target:**
```
┌────── Esplora ──────┐
│                     │
│  🏆 Classifica      │
│     3° • 45 pts  →  │
│                     │
│  👥 Tutte Squadre   │
│     8 squadre    →  │
│                     │
│  🆓 Svincolati      │
│     127 giocatori→  │
│     ⚽ 45 • 🛡️ 38   │
└─────────────────────┘
```

**Implementazione:**
- Cards compatte con preview dati
- **Classifica**: Mostra posizione utente + punti
- **Tutte le Squadre**: Badge totale squadre
- **Svincolati**: Totale + breakdown per ruolo (icone)
- Hover: scale(1.02), shadow aumentata
- Click: navigate to sezione

**Codice esempio:**
```jsx
<div className="space-y-3">
  <div className="bg-white rounded-lg p-4 shadow-md hover:shadow-lg hover:scale-102 transition-all cursor-pointer">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Trophy className="w-6 h-6 text-yellow-500" />
        <div>
          <p className="font-semibold text-gray-900">Classifica</p>
          <p className="text-sm text-gray-500">3° • 45 pts</p>
        </div>
      </div>
      <ChevronRight className="w-5 h-5 text-gray-400" />
    </div>
  </div>
  
  <div className="bg-white rounded-lg p-4 shadow-md hover:shadow-lg hover:scale-102 transition-all cursor-pointer">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Users className="w-6 h-6 text-blue-500" />
        <div>
          <p className="font-semibold text-gray-900">Tutte le Squadre</p>
          <p className="text-sm text-gray-500">8 squadre totali</p>
        </div>
      </div>
      <ChevronRight className="w-5 h-5 text-gray-400" />
    </div>
  </div>
  
  <div className="bg-white rounded-lg p-4 shadow-md hover:shadow-lg hover:scale-102 transition-all cursor-pointer">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <UserPlus className="w-6 h-6 text-green-500" />
        <div>
          <p className="font-semibold text-gray-900">Svincolati</p>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>127 giocatori</span>
            <span className="text-xs">⚽ 45 • 🛡️ 38 • 🎯 32</span>
          </div>
        </div>
      </div>
      <ChevronRight className="w-5 h-5 text-gray-400" />
    </div>
  </div>
</div>
```

#### 1.4 Tabella Classifica Preview
**Miglioramenti:**
- Evidenziare riga utente con bg-blue-50 e border-l-4 border-blue-500
- Badge "TU" o icona user sulla riga
- Prime 3 posizioni con colori: 🥇 gold, 🥈 silver, 🥉 bronze
- Frecce trend: ↑ verde, ↓ rossa (se implementato tracking)
- Bottone "Vedi tutti" → stile button pieno invece di link

---

## ⚽ SCHERMATA 2: FORMAZIONE

### Analisi Problemi Attuali
1. Campo da gioco verde troppo scuro, lettere poco leggibili (A, C, D, P)
2. Lista giocatori laterale: poca differenziazione visiva tra ruoli
3. Icone squadre troppo piccole
4. Manca feedback visivo per giocatori non titolari / infortunati
5. Drag & drop non intuitivo
6. Modulo tattico 3-4-3 visibile ma potrebbe essere più dinamico
7. Pannello dettagli giocatore vuoto fino alla selezione

### Miglioramenti Richiesti

#### 2.1 Campo da Gioco Tattico
**Design migliorato:**
```
┌─────────────────────────────────────┐
│         3-4-3 ▼   Day 1 ▼          │
│ ┌─────────────────────────────────┐ │
│ │         [CAMPO VERDE]           │ │
│ │                                 │ │
│ │     [A]    [A]    [A]           │ │  <- Attaccanti
│ │                                 │ │
│ │  [C]  [C]  [C]  [C]             │ │  <- Centrocampisti
│ │                                 │ │
│ │     [D]    [D]    [D]           │ │  <- Difensori
│ │                                 │ │
│ │           [P]                   │ │  <- Portiere
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

**Implementazione:**
- **Colore campo**: gradient verde più chiaro (#16a34a → #22c55e)
- **Slot giocatori**: 
  - Vuoti: border-2 border-dashed border-white/50, pulsing animation
  - Occupati: bg-white/90 shadow-lg, foto giocatore, nome, punteggio previsto
  - Hover: scale(1.1), cursor-grab
  - Dragging: opacity-50, rotate-2
- **Lettere ruolo**: text-white/70 text-xs absolute top-1 left-1
- **Dropdown modulo**: 3-4-3, 4-3-3, 4-4-2, 3-5-2 con cambio dinamico posizioni
- **Status indicators**:
  - 🟢 Verde: disponibile
  - 🟡 Giallo: dubbio
  - 🔴 Rosso: infortunato
  - ⛔ Grigio: squalificato

**Codice esempio slot giocatore:**
```jsx
{/* Slot vuoto */}
<div className="w-16 h-16 rounded-full border-2 border-dashed border-white/50 flex items-center justify-center animate-pulse">
  <Plus className="w-6 h-6 text-white/50" />
</div>

{/* Slot occupato */}
<div 
  className="relative w-20 h-28 bg-white/90 rounded-lg shadow-lg hover:scale-110 transition-transform cursor-grab active:cursor-grabbing"
  draggable
>
  <div className="absolute top-1 left-1 bg-green-500 text-white text-xs px-1 rounded">A</div>
  <div className="absolute top-1 right-1">
    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
  </div>
  <img src={playerPhoto} className="w-12 h-12 rounded-full mx-auto mt-2" />
  <p className="text-xs font-semibold text-center mt-1 truncate px-1">Lautaro</p>
  <div className="flex justify-center gap-1 mt-1">
    <img src={interLogo} className="w-4 h-4" />
    <span className="text-xs text-gray-600">7.2</span>
  </div>
</div>
```

#### 2.2 Lista Giocatori Laterale
**Miglioramenti:**
- **Sezioni collapsabili** per ruolo (GK, DEF, MID, ATT)
- **Colori distintivi**:
  - Portieri: bg-orange-50 border-orange-200
  - Difensori: bg-yellow-50 border-yellow-200
  - Centrocampisti: bg-green-50 border-green-200
  - Attaccanti: bg-blue-50 border-blue-200
- **Card giocatore**: foto, nome, squadra, punteggio medio, status
- **Filtri rapidi**: Tutti, Titolari, Panchina, Infortunati
- **Ricerca**: input search con icona magnifying glass

**Codice esempio:**
```jsx
<div className="space-y-2">
  {/* Header sezione */}
  <button 
    onClick={() => toggleSection('GK')}
    className="w-full flex items-center justify-between bg-orange-50 border-2 border-orange-200 rounded-lg p-3 hover:bg-orange-100 transition"
  >
    <div className="flex items-center gap-2">
      <Shield className="w-5 h-5 text-orange-600" />
      <span className="font-semibold text-orange-900">Portieri</span>
      <span className="text-sm text-orange-600">(3)</span>
    </div>
    <ChevronDown className={`w-5 h-5 text-orange-600 transition-transform ${expanded ? 'rotate-180' : ''}`} />
  </button>
  
  {/* Lista giocatori */}
  {expanded && (
    <div className="space-y-2 pl-4">
      <div className="bg-white border border-gray-200 rounded-lg p-3 flex items-center gap-3 hover:shadow-md transition cursor-pointer">
        <img src={playerPhoto} className="w-12 h-12 rounded-full" />
        <div className="flex-1">
          <p className="font-semibold text-gray-900">Di Gennaro</p>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <img src={teamLogo} className="w-4 h-4" />
            <span>Inter</span>
            <span>•</span>
            <span>Media: 6.8</span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-xs font-semibold text-gray-700">P</span>
        </div>
      </div>
    </div>
  )}
</div>
```

#### 2.3 Pannello Dettagli Giocatore
**Quando selezionato:**
- Foto grande del giocatore
- Nome, ruolo, squadra
- Statistiche stagione: Presenze, Gol, Assist, Media voto
- Prossimo avversario
- Form ultimi 5 match (grafico a linee o sparkline)
- Bottoni: "Schiera", "Sostituisci", "Vendi"

**Stato vuoto:**
```
┌────────────────────────┐
│                        │
│      👤                │
│                        │
│  Seleziona un          │
│  giocatore per i       │
│  dettagli              │
│                        │
└────────────────────────┘
```

---

## 🛒 SCHERMATA 3: MERCATO (Listone)

### Analisi Problemi Attuali
1. Tabs "Listone", "Aste", "Gestione" poco evidenti
2. Widget crediti separato e poco integrato
3. Griglia giocatori: cards troppo semplici, mancano info chiave
4. Bottone "+" per acquisto non intuitivo
5. Manca filtro avanzato (per squadra, ruolo, prezzo, form)
6. Ricerca poco prominente

### Miglioramenti Richiesti

#### 3.1 Header Mercato
**Design:**
```
┌──────────────────────────────────────────────┐
│  Mercato                    💰 79 crediti    │
│  Gestisci la tua rosa e partecipa alle aste  │
│                                              │
│  [Listone] [Aste] [Gestione]                │
│                                              │
│  🔍 [Cerca giocatore (es. Lautaro)...]       │
│  📊 [Filtri Avanzati ▼]                      │
└──────────────────────────────────────────────┘
```

**Implementazione:**
- **Tabs navigation**: 
  - Active: bg-blue-600 text-white shadow-md
  - Inactive: text-gray-600 hover:text-blue-600
- **Widget crediti**: sempre visibile top-right con icona wallet
- **Search bar**: full-width, border-2, icona search left, placeholder descrittivo
- **Filtri**: button che apre modal con:
  - Ruolo (checkboxes)
  - Squadra (dropdown)
  - Prezzo (range slider)
  - Quotazione (range slider)
  - Form (ultimi 5 match)
  - Disponibilità (tutti, solo titolari, solo infortunati)

**Codice tabs:**
```jsx
<div className="flex gap-2 mb-6">
  <button className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md">
    Listone
  </button>
  <button className="px-6 py-3 text-gray-600 hover:text-blue-600 hover:bg-gray-100 font-semibold rounded-lg transition">
    Aste
  </button>
  <button className="px-6 py-3 text-gray-600 hover:text-blue-600 hover:bg-gray-100 font-semibold rounded-lg transition">
    Gestione
  </button>
</div>
```

#### 3.2 Griglia Giocatori Migliorata
**Card giocatore design:**
```
┌─────────────────────────┐
│  [FOTO]    Audero       │
│  🔴 P                   │
│  Cremonese • Qt. 15     │
│  Media: 6.2 • 12 pres.  │
│                         │
│  [Acquista - 15 cr.]    │
└─────────────────────────┘
```

**Implementazione:**
- **Layout**: grid con 2-3 colonne (responsive)
- **Card elements**:
  - Avatar grande con foto giocatore
  - Badge ruolo colorato (P, D, C, A)
  - Nome bold, squadra light
  - Quotazione e prezzo in evidenza
  - Statistiche compatte (media voto, presenze)
  - Status indicator (disponibile, infortunato, etc.)
  - Button acquisto: bg-blue-600 con prezzo integrato
- **Hover**: shadow-xl, scale(1.02)
- **Modal acquisto**: conferma con riepilogo crediti post-acquisto

**Codice esempio:**
```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <div className="bg-white rounded-xl shadow-lg p-4 hover:shadow-xl hover:scale-102 transition-all">
    <div className="flex items-start gap-3 mb-3">
      <div className="relative">
        <img src={playerPhoto} className="w-16 h-16 rounded-full" />
        <div className="absolute -bottom-1 -right-1 bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
          P
        </div>
      </div>
      <div className="flex-1">
        <h3 className="font-bold text-lg text-gray-900">Audero</h3>
        <p className="text-sm text-gray-500">Cremonese • Qt. 15</p>
      </div>
      <div className="text-right">
        <div className="w-2 h-2 bg-green-500 rounded-full mb-1"></div>
      </div>
    </div>
    
    <div className="flex justify-between items-center text-sm text-gray-600 mb-4">
      <span>Media: <strong>6.2</strong></span>
      <span>12 presenze</span>
    </div>
    
    <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition flex items-center justify-center gap-2">
      <ShoppingCart className="w-4 h-4" />
      Acquista - 15 cr.
    </button>
  </div>
</div>
```

#### 3.3 Modal Filtri Avanzati
**Contenuto:**
- Filtri multipli con chips per selezione visiva
- Apply button con contatore risultati
- Reset button
- Close X button

---

## 📊 SCHERMATA 4: RISULTATI PARTITE

### Analisi Problemi Attuali
1. Lista piatta senza raggruppamento per stato (passate, in corso, future)
2. Nessuno scroll automatico alla giornata corrente
3. Label "DAY X" poco prominente
4. VS troppo piccolo, squadre poco distinguibili
5. Icona calendario inutile sulla destra
6. Manca differenziazione visiva tra vittoria/sconfitta/pareggio

### Miglioramenti Richiesti

#### 4.1 Auto-scroll alla Giornata Corrente
**Implementazione tecnica:**
```typescript
// /src/hooks/use-matchday.ts  [🆕 CREARE]

'use client';

import { useEffect, useRef, useState } from 'react';
import { getCurrentMatchday } from '@/app/actions/football-data';

export const useAutoScrollToCurrentMatchday = () => {
  const currentMatchdayRef = useRef<HTMLDivElement>(null);
  const [currentMatchday, setCurrentMatchday] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMatchday = async () => {
      try {
        setIsLoading(true);
        const data = await getCurrentMatchday();
        if (data) {
          setCurrentMatchday(data.matchday);
        }
      } catch (error) {
        console.error('Error fetching matchday:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMatchday();
  }, []);

  useEffect(() => {
    if (currentMatchdayRef.current && !isLoading) {
      // Aspetta che il DOM sia renderizzato
      setTimeout(() => {
        currentMatchdayRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }, 100);
    }
  }, [currentMatchday, isLoading]);

  return { currentMatchday, currentMatchdayRef, isLoading };
};
```

**Usage nel componente Results:**
```typescript
// /src/app/team/results/page.tsx  [✏️ MODIFICARE]

'use client';

import { useAutoScrollToCurrentMatchday } from '@/hooks/use-matchday';
import MatchCard from '@/components/results/match-card';

export default function ResultsPage() {
  const { currentMatchday, currentMatchdayRef, isLoading } = useAutoScrollToCurrentMatchday();
  
  // ... fetch matches data ...
  
  return (
    <div className="space-y-6 pb-20">
      {matches.map((match) => (
        <div 
          key={match.day}
          ref={match.day === currentMatchday ? currentMatchdayRef : null}
          className={match.day === currentMatchday ? 'animate-fade-in' : ''}
        >
          <MatchCard 
            match={match} 
            isCurrent={match.day === currentMatchday} 
          />
        </div>
      ))}
    </div>
  );
}
```

#### 4.2 Design Match Card Migliorato
**Layout:**
```
┌────────────────────────────────────────┐
│  GIORNATA 1 • Completata        ✅     │
│ ┌────────────────────────────────────┐ │
│ │                                    │ │
│ │  Rosa diffilcilmente  [2] - [1]    │ │
│ │  migliorabile              Rosa    │ │
│ │                                    │ │
│ │  [Vedi Dettagli →]                 │ │
│ └────────────────────────────────────┘ │
└────────────────────────────────────────┘
```

**Stati visivi:**
- **Giornata corrente**: border-2 border-blue-500, bg-blue-50, badge "IN CORSO"
- **Giornata passata**: bg-white, badge risultato (✅ Vittoria, ❌ Sconfitta, ⚖️ Pareggio)
- **Giornata futura**: bg-gray-50, text-gray-400, badge "DA GIOCARE"

**Implementazione:**
```jsx
<div className="space-y-6">
  {/* Current Matchday - Highlighted */}
  <div 
    ref={currentMatchdayRef}
    className="bg-blue-50 border-2 border-blue-500 rounded-xl p-6 animate-fade-in"
  >
    <div className="flex justify-between items-center mb-4">
      <div className="flex items-center gap-3">
        <span className="text-sm font-bold text-blue-600 uppercase">Giornata {match.day}</span>
        <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-semibold">
          IN CORSO
        </span>
      </div>
      <Clock className="w-5 h-5 text-blue-600 animate-pulse" />
    </div>
    
    <div className="bg-white rounded-lg p-6 shadow-md">
      <div className="flex items-center justify-between">
        <div className="flex-1 text-right pr-6">
          <p className="font-bold text-xl text-gray-900">{match.homeTeam}</p>
          {match.isUserTeam && <span className="text-xs text-blue-600 font-semibold">TU</span>}
        </div>
        
        <div className="flex flex-col items-center px-6">
          <div className="flex items-center gap-4">
            <span className="text-3xl font-bold text-gray-900">{match.homeScore ?? '-'}</span>
            <span className="text-2xl text-gray-400">VS</span>
            <span className="text-3xl font-bold text-gray-900">{match.awayScore ?? '-'}</span>
          </div>
          <p className="text-xs text-gray-500 mt-2">{match.date}</p>
        </div>
        
        <div className="flex-1 text-left pl-6">
          <p className="font-bold text-xl text-gray-900">{match.awayTeam}</p>
        </div>
      </div>
      
      {match.status === 'completed' && (
        <button className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition flex items-center justify-center gap-2">
          Vedi Dettagli
          <ArrowRight className="w-4 h-4" />
        </button>
      )}
    </div>
  </div>
  
  {/* Past Match - with result badge */}
  <div className="bg-white rounded-xl p-6 shadow-md">
    <div className="flex justify-between items-center mb-4">
      <div className="flex items-center gap-3">
        <span className="text-sm font-semibold text-gray-600">Giornata 2</span>
        {userWon ? (
          <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-semibold">
            ✅ Vittoria
          </span>
        ) : (
          <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full font-semibold">
            ❌ Sconfitta
          </span>
        )}
      </div>
    </div>
    {/* Match details... */}
  </div>
  
  {/* Future Match */}
  <div className="bg-gray-50 rounded-xl p-6 shadow-sm">
    <div className="flex justify-between items-center mb-4">
      <div className="flex items-center gap-3">
        <span className="text-sm font-semibold text-gray-400">Giornata 10</span>
        <span className="bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded-full font-semibold">
          DA GIOCARE
        </span>
      </div>
      <Calendar className="w-5 h-5 text-gray-400" />
    </div>
    {/* Match details in grayscale... */}
  </div>
</div>
```

#### 4.3 Navigazione Rapida Giornate
**Optional enhancement:**
- Horizontal scroll slider in cima con bottoni giornata
- Click per jump diretto
- Current matchday evidenziato

```jsx
<div className="sticky top-0 bg-white z-10 py-4 mb-6 border-b">
  <div className="flex gap-2 overflow-x-auto pb-2">
    {Array.from({length: 38}, (_, i) => i + 1).map(day => (
      <button
        key={day}
        onClick={() => scrollToDay(day)}
        className={`flex-shrink-0 px-4 py-2 rounded-lg font-semibold text-sm transition ${
          day === currentMatchday
            ? 'bg-blue-600 text-white shadow-md'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
      >
        {day}
      </button>
    ))}
  </div>
</div>
```

---

## 🏆 SCHERMATA 5: CLASSIFICA

### Analisi Problemi Attuali
1. Riga utente (Sinuoso) non sufficientemente evidenziata
2. Manca badge "TU" o indicatore visivo chiaro
3. Colori monotoni (solo oro sul #1)
4. Nessun indicatore di trend (posizioni guadagnate/perse)
5. Colonne poco leggibili (header troppo compatti)
6. Manca differenziazione tra zone (Champions, Europa, retrocessione in una lega fantasy)

### Miglioramenti Richiesti

#### 5.1 Tabella Classifica Completa
**Design target:**
```
┌──────────────────────────────────────────────────────────────────┐
│  #  | SQUADRA              | PT | PG | V | N | P | GF | GS | TOT │
├──────────────────────────────────────────────────────────────────┤
│ 🥇1 | Rosa difficilmente   | 0  | 0  | 0 | 0 | 0 | 0  | 0  | 0.0 │
│  2  | ARCORE FC            | 0  | 0  | 0 | 0 | 0 | 0  | 0  | 0.0 │
│  3  | FC San Marco         | 0  | 0  | 0 | 0 | 0 | 0  | 0  | 0.0 │
│ ... |                      |    |    |   |   |   |    |    |     │
│ 📍8 | 👤 Sinuoso    [TU]   | 0  | 0  | 0 | 0 | 0 | 0  | 0  | 0.0 │ <- Highlighted
│ ... |                      |    |    |   |   |   |    |    |     │
└──────────────────────────────────────────────────────────────────┘
```

**Implementazione dettagliata:**

```jsx
<div className="bg-white rounded-xl shadow-lg overflow-hidden">
  {/* Header */}
  <div className="bg-gray-50 px-6 py-4 border-b">
    <h2 className="text-2xl font-bold text-gray-900">Classifica</h2>
    <p className="text-sm text-gray-500">Aggiornata al {lastUpdate}</p>
  </div>
  
  {/* Table */}
  <div className="overflow-x-auto">
    <table className="w-full">
      <thead className="bg-gray-100 border-b-2 border-gray-200">
        <tr>
          <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">#</th>
          <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Squadra</th>
          <th className="px-4 py-3 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">PT</th>
          <th className="px-4 py-3 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">PG</th>
          <th className="px-4 py-3 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">V</th>
          <th className="px-4 py-3 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">N</th>
          <th className="px-4 py-3 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">P</th>
          <th className="px-4 py-3 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">GF</th>
          <th className="px-4 py-3 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">GS</th>
          <th className="px-4 py-3 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">TOT</th>
        </tr>
      </thead>
      
      <tbody className="divide-y divide-gray-200">
        {/* First Place - Gold */}
        <tr className="bg-gradient-to-r from-yellow-50 to-transparent hover:bg-yellow-50 transition">
          <td className="px-4 py-4 whitespace-nowrap">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🥇</span>
              <span className="font-bold text-gray-900">1</span>
            </div>
          </td>
          <td className="px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="bg-yellow-100 rounded-full p-2">
                <span className="text-sm font-bold">RO</span>
              </div>
              <span className="font-semibold text-gray-900">Rosa difficilmente migliorabile</span>
            </div>
          </td>
          <td className="px-4 py-4 text-center font-bold text-lg">0</td>
          <td className="px-4 py-4 text-center text-gray-600">0</td>
          <td className="px-4 py-4 text-center text-gray-600">0</td>
          <td className="px-4 py-4 text-center text-gray-600">0</td>
          <td className="px-4 py-4 text-center text-gray-600">0</td>
          <td className="px-4 py-4 text-center text-gray-600">0</td>
          <td className="px-4 py-4 text-center text-gray-600">0</td>
          <td className="px-4 py-4 text-center">
            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">0.0</span>
          </td>
        </tr>
        
        {/* Second Place - Silver */}
        <tr className="bg-gradient-to-r from-gray-100 to-transparent hover:bg-gray-100 transition">
          <td className="px-4 py-4 whitespace-nowrap">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🥈</span>
              <span className="font-bold text-gray-900">2</span>
            </div>
          </td>
          {/* ... */}
        </tr>
        
        {/* Third Place - Bronze */}
        <tr className="bg-gradient-to-r from-orange-50 to-transparent hover:bg-orange-50 transition">
          <td className="px-4 py-4 whitespace-nowrap">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🥉</span>
              <span className="font-bold text-gray-900">3</span>
            </div>
          </td>
          {/* ... */}
        </tr>
        
        {/* Regular Teams */}
        <tr className="hover:bg-gray-50 transition">
          {/* ... */}
        </tr>
        
        {/* USER TEAM - HIGHLIGHTED */}
        <tr className="bg-blue-50 border-l-4 border-blue-600 hover:bg-blue-100 transition-all animate-pulse-once">
          <td className="px-4 py-4 whitespace-nowrap">
            <div className="flex items-center gap-2">
              <span className="text-xl">📍</span>
              <span className="font-bold text-blue-600">8</span>
            </div>
          </td>
          <td className="px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 rounded-full w-10 h-10 flex items-center justify-center">
                <span className="text-white font-bold">SI</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-blue-900">Sinuoso</span>
                <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full font-bold">TU</span>
              </div>
            </div>
          </td>
          <td className="px-4 py-4 text-center font-bold text-lg text-blue-600">0</td>
          <td className="px-4 py-4 text-center text-gray-600">0</td>
          <td className="px-4 py-4 text-center text-gray-600">0</td>
          <td className="px-4 py-4 text-center text-gray-600">0</td>
          <td className="px-4 py-4 text-center text-gray-600">0</td>
          <td className="px-4 py-4 text-center text-gray-600">0</td>
          <td className="px-4 py-4 text-center text-gray-600">0</td>
          <td className="px-4 py-4 text-center">
            <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-bold">0.0</span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
  
  {/* Footer con legenda */}
  <div className="bg-gray-50 px-6 py-4 border-t">
    <div className="flex items-center gap-6 text-xs text-gray-600">
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
        <span>1° posto</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-gray-400"></div>
        <span>2° posto</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-orange-400"></div>
        <span>3° posto</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-blue-600"></div>
        <span>La tua squadra</span>
      </div>
    </div>
  </div>
</div>
```

#### 5.2 Trend Indicators (Opzionale ma Consigliato)
Se il backend traccia la posizione precedente:

```jsx
<td className="px-4 py-4">
  <div className="flex items-center gap-2">
    {position < previousPosition && (
      <TrendingUp className="w-4 h-4 text-green-500" />
    )}
    {position > previousPosition && (
      <TrendingDown className="w-4 h-4 text-red-500" />
    )}
    <span className="font-bold">{position}</span>
  </div>
</td>
```

#### 5.3 Mobile Responsive
Per mobile, collassare alcune colonne e mostrare solo: #, Squadra, PT, TOT

```jsx
<div className="block md:hidden">
  {/* Compact mobile view */}
  <div className="space-y-2">
    {teams.map(team => (
      <div className={`flex items-center justify-between p-4 rounded-lg ${
        team.isUser ? 'bg-blue-50 border-l-4 border-blue-600' : 'bg-white'
      }`}>
        <div className="flex items-center gap-3">
          <span className="font-bold text-lg">{team.position}</span>
          <div>
            <p className="font-semibold">{team.name}</p>
            {team.isUser && <span className="text-xs text-blue-600">TU</span>}
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold">{team.points}</p>
          <p className="text-xs text-gray-500">{team.totalScore.toFixed(1)}</p>
        </div>
      </div>
    ))}
  </div>
</div>
```

---

## ⚙️ SCHERMATA 6: IMPOSTAZIONI (Settings Modal)

### Analisi Problemi Attuali
1. Modal centrato OK, ma potrebbe essere drawer laterale su mobile
2. Sezioni ben organizzate ma spacing migliorabile
3. Toggle notifiche push: buono
4. Form email/password: input style minimale
5. Bottone "Update & Logout" poco chiaro (fa entrambe le cose?)
6. Selezione lingua OK
7. Toggle "Accesso Admin" inutile per utenti normali

### Miglioramenti Richiesti

#### 6.1 Struttura Modal Migliorata
**Layout:**
```
┌─────────────────────────────────────┐
│  ⚙️  Impostazioni            [X]    │
├─────────────────────────────────────┤
│                                     │
│  🎨 TEMA APP                        │
│  ○ Chiaro  ● Scuro  ○ Auto         │
│                                     │
│  🔔 NOTIFICHE                       │
│  ✓ Abilita Notifiche Push           │
│     Receive alerts for auctions..   │
│                                     │
│  👤 ACCOUNT                         │
│  Email: [......................]    │
│  Password: [....................]   │
│  [Salva Modifiche]                  │
│                                     │
│  🌍 LINGUA                          │
│  🇮🇹 Italiano  🇬🇧 English          │
│                                     │
│  🚪 AZIONI                          │
│  [Logout]                           │
│                                     │
│  ℹ️  Versione: 2.1.0                │
└─────────────────────────────────────┘
```

**Implementazione:**

```jsx
<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
  <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
    {/* Header */}
    <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center rounded-t-2xl">
      <div className="flex items-center gap-3">
        <Settings className="w-6 h-6 text-gray-700" />
        <h2 className="text-xl font-bold text-gray-900">Impostazioni</h2>
      </div>
      <button 
        onClick={onClose}
        className="text-gray-400 hover:text-gray-600 transition"
      >
        <X className="w-6 h-6" />
      </button>
    </div>
    
    {/* Content */}
    <div className="p-6 space-y-8">
      
      {/* TEMA APP */}
      <div>
        <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Palette className="w-4 h-4" />
          Tema App
        </h3>
        <div className="flex gap-3">
          <button className="flex-1 border-2 border-gray-300 rounded-lg p-3 hover:border-blue-500 transition">
            <Sun className="w-5 h-5 mx-auto mb-1 text-yellow-500" />
            <p className="text-sm font-semibold">Chiaro</p>
          </button>
          <button className="flex-1 border-2 border-blue-500 bg-blue-50 rounded-lg p-3">
            <Moon className="w-5 h-5 mx-auto mb-1 text-blue-600" />
            <p className="text-sm font-semibold text-blue-600">Scuro</p>
          </button>
          <button className="flex-1 border-2 border-gray-300 rounded-lg p-3 hover:border-blue-500 transition">
            <Sparkles className="w-5 h-5 mx-auto mb-1 text-gray-500" />
            <p className="text-sm font-semibold">Auto</p>
          </button>
        </div>
      </div>
      
      {/* NOTIFICHE */}
      <div>
        <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Bell className="w-4 h-4" />
          Notifiche
        </h3>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-semibold text-gray-900">Abilita Notifiche Push</p>
              <p className="text-sm text-gray-500">Receive alerts for auctions and trades</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>
      
      {/* ACCOUNT */}
      <div>
        <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-3 flex items-center gap-2">
          <User className="w-4 h-4" />
          Account
        </h3>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                type="email"
                placeholder="New Email Address"
                className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                type="password"
                placeholder="New Password"
                className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
              />
            </div>
          </div>
          
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition flex items-center justify-center gap-2">
            <Save className="w-4 h-4" />
            Salva Modifiche
          </button>
        </div>
      </div>
      
      {/* LINGUA */}
      <div>
        <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Globe className="w-4 h-4" />
          Lingua
        </h3>
        <div className="flex gap-3">
          <button className="flex-1 border-2 border-blue-500 bg-blue-50 rounded-lg p-3">
            <span className="text-2xl mb-1">🇮🇹</span>
            <p className="text-sm font-semibold text-blue-600">Italiano</p>
          </button>
          <button className="flex-1 border-2 border-gray-300 rounded-lg p-3 hover:border-blue-500 transition">
            <span className="text-2xl mb-1">🇬🇧</span>
            <p className="text-sm font-semibold">English</p>
          </button>
        </div>
      </div>
      
      {/* AZIONI */}
      <div>
        <button className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2">
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
      
      {/* Footer */}
      <div className="text-center pt-4 border-t">
        <p className="text-xs text-gray-500">Fantacalcio v2.1.0</p>
        <p className="text-xs text-gray-400 mt-1">© 2026 - Tutti i diritti riservati</p>
      </div>
      
    </div>
  </div>
</div>
```

#### 6.2 Separazione Azioni
**Problema risolto:** "Update & Logout" era confusionario
**Soluzione:**
- "Salva Modifiche" per email/password (blu)
- "Logout" separato in fondo (rosso)

#### 6.3 Rimuovere "Accesso Admin"
Questa opzione non è rilevante per utenti normali e crea confusione. Se necessaria, mostrare solo per admin verificati lato backend.

---

## 🧩 COMPONENTI CONDIVISI

### Bottom Navigation (Migliorata)
```jsx
<nav className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 shadow-lg z-50">
  <div className="flex justify-around items-center h-16">
    <button className="flex flex-col items-center justify-center flex-1 text-gray-400 hover:text-blue-600 transition">
      <Home className="w-6 h-6" />
      <span className="text-xs font-medium mt-1">Home</span>
    </button>
    
    <button className="flex flex-col items-center justify-center flex-1 text-blue-600 transition">
      <Users className="w-6 h-6 fill-current" />
      <span className="text-xs font-bold mt-1">Rosa</span>
      <div className="absolute top-1 right-1/4 w-2 h-2 bg-blue-600 rounded-full"></div>
    </button>
    
    <button className="flex flex-col items-center justify-center flex-1 text-gray-400 hover:text-blue-600 transition relative">
      <ShoppingCart className="w-6 h-6" />
      <span className="text-xs font-medium mt-1">Mercato</span>
      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">3</span>
    </button>
    
    <button className="flex flex-col items-center justify-center flex-1 text-gray-400 hover:text-blue-600 transition">
      <Trophy className="w-6 h-6" />
      <span className="text-xs font-medium mt-1">Risultati</span>
    </button>
    
    <button className="flex flex-col items-center justify-center flex-1 text-gray-400 hover:text-blue-600 transition">
      <BarChart3 className="w-6 h-6" />
      <span className="text-xs font-medium mt-1">Classifica</span>
    </button>
  </div>
</nav>
```

**Caratteristiche:**
- Label font-size aumentata a 11-12px (min)
- Stato attivo: icon filled + text bold + dot indicator
- Badge notifiche su Mercato per aste attive
- Touch target 44x44px minimo
- Smooth transitions

---

## 📐 DESIGN SYSTEM

### Colors
```typescript
// /design-token/colors.ts  [🆕 CREARE]

export const colors = {
  // Brand
  primary: {
    50: '#EEF2FF',
    100: '#E0E7FF',
    500: '#5B7FFF', // Main blue
    600: '#4C6FE8',
    700: '#3D5FC4',
  },
  secondary: {
    50: '#F0FDF4',
    500: '#10B981', // Main green
    600: '#059669',
  },
  
  // Roles
  goalkeeper: '#F97316', // Orange
  defender: '#FCD34D',   // Yellow
  midfielder: '#10B981', // Green
  attacker: '#5B7FFF',   // Blue
  
  // Status
  available: '#10B981',  // Green
  doubtful: '#F59E0B',   // Amber
  injured: '#EF4444',    // Red
  suspended: '#6B7280',  // Gray
  
  // Results
  win: '#10B981',
  draw: '#F59E0B',
  loss: '#EF4444',
} as const;

export type Colors = typeof colors;
```

### Typography
```typescript
// /design-token/typography.ts  [🆕 CREARE]

export const typography = {
  fontFamily: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
  },
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem',// 30px
    '4xl': '2.25rem', // 36px
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
} as const;

export type Typography = typeof typography;
```

### Spacing
```typescript
// /design-token/spacing.ts  [🆕 CREARE]

export const spacing = {
  0: '0',
  1: '0.25rem',  // 4px
  2: '0.5rem',   // 8px
  3: '0.75rem',  // 12px
  4: '1rem',     // 16px
  6: '1.5rem',   // 24px
  8: '2rem',     // 32px
  12: '3rem',    // 48px
  16: '4rem',    // 64px
} as const;

export type Spacing = typeof spacing;

export const borderRadius = {
  sm: '0.25rem',  // 4px
  md: '0.5rem',   // 8px
  lg: '0.75rem',  // 12px
  xl: '1rem',     // 16px
  '2xl': '1.5rem',// 24px
  full: '9999px',
} as const;

export type BorderRadius = typeof borderRadius;
```

### Usage nei componenti
```typescript
// Esempio di utilizzo
import { colors } from '@/design-token/colors';
import { typography } from '@/design-token/typography';

const MyComponent = () => (
  <div 
    style={{ 
      color: colors.primary[500],
      fontSize: typography.fontSize.lg 
    }}
  >
    Hello World
  </div>
);
```

---

## 🚀 IMPLEMENTAZIONE E PRIORITÀ

### Must Have (Priorità 1 - Sprint 1)
1. ✅ Home: Countdown migliorato + Widget crediti
2. ✅ Home: Card prossima partita ridisegnata
3. ✅ Classifica: Evidenziazione riga utente
4. ✅ Bottom Navigation: Label ingrandite + stato attivo chiaro
5. ✅ Risultati: Auto-scroll giornata corrente

### Should Have (Priorità 2 - Sprint 2)
6. ✅ Formazione: Campo verde più chiaro + slot migliorati
7. ✅ Formazione: Lista giocatori con sezioni collapsabili
8. ✅ Mercato: Griglia cards migliorata
9. ✅ Sidebar Esplora: Cards informative
10. ✅ Settings: Modal ridisegnato

### Nice to Have (Priorità 3 - Sprint 3)
11. ⭕ Classifica: Trend indicators (frecce)
12. ⭕ Formazione: Drag & drop visuale
13. ⭕ Risultati: Navigazione rapida giornate
14. ⭕ Mercato: Filtri avanzati modal
15. ⭕ Animazioni e micro-interactions avanzate

---

## 📊 METRICHE DI SUCCESSO

### Performance
- [ ] Lighthouse Performance Score > 90
- [ ] LCP (Largest Contentful Paint) < 2.5s
- [ ] CLS (Cumulative Layout Shift) < 0.1
- [ ] FID (First Input Delay) < 100ms

### Accessibilità
- [ ] WCAG 2.1 AA compliance
- [ ] Tutti i contrast ratio > 4.5:1
- [ ] Focus states visibili su tutti gli elementi interattivi
- [ ] Aria labels corretti
- [ ] Testato con screen reader (NVDA/VoiceOver)

### Usabilità
- [ ] Tempo per schierare formazione ridotto del 30%
- [ ] Engagement classifica aumentato del 20%
- [ ] SUS (System Usability Scale) score > 75
- [ ] Zero violazioni accessibilità critiche
- [ ] Mobile usability > 95 (Google Mobile-Friendly Test)

### User Satisfaction
- [ ] Net Promoter Score (NPS) > 50
- [ ] Customer Satisfaction (CSAT) > 4.5/5
- [ ] Task completion rate > 95%

---

## 📝 NOTE PER LO SVILUPPATORE (Antigravity)

### 📁 Struttura Progetto Esistente - ADATTAMENTO

**IMPORTANTE**: Il progetto ha già una struttura Next.js con TypeScript. Seguire questa mappatura esatta.

```bash
# Cartelle che GIÀ ESISTONO (non creare)
✅ /docs/                              # Già presente
✅ /docs/screenshots/                  # Già presente con 5 immagini
✅ /docs/ui-improvements.md            # Già presente (questo documento)
✅ /design-token/                      # Già presente (nota: singolare)
✅ /src/components/                    # Già presente
✅ /src/components/home/               # Già presente
✅ /src/components/market/             # Già presente
✅ /src/components/live/               # Già presente
✅ /src/components/admin/              # Già presente
✅ /src/components/ui/                 # Già presente (shadcn/ui)
✅ /src/hooks/                         # Già presente
✅ /src/app/actions/                   # Già presente
✅ /src/app/actions/football-data.ts   # GIÀ ESISTE! (API football-data.org)
✅ /src/utils/                         # Già presente

# Cartelle da CREARE (se necessario)
🆕 /src/services/                      # DA CREARE (opzionale, se serve separazione)
```

### 🎯 Piano di Implementazione: File per File

#### FASE 1: Design Tokens (CREARE in /design-token/)
```typescript
// design-token/colors.ts                    [🆕 CREARE]
// design-token/spacing.ts                   [🆕 CREARE]
// design-token/typography.ts                [🆕 CREARE]
```

#### FASE 2: Hooks Custom (CREARE in /src/hooks/)
```typescript
// /src/hooks/use-matchday.ts                [🆕 CREARE]
// /src/hooks/use-formation.ts               [🆕 CREARE]  
// /src/hooks/use-credits.ts                 [🆕 CREARE]
// /src/hooks/use-theme.ts                   [🆕 CREARE - opzionale]

// ✅ Già esiste:
// /src/hooks/use-media-query.ts             [✅ USARE]
```

#### FASE 3: API Actions (MODIFICARE esistenti)
```typescript
// /src/app/actions/football-data.ts         [✏️ MODIFICARE - aggiungi getCurrentMatchday()]
// /src/app/actions/team.ts                  [✏️ MODIFICARE - se serve]
// /src/app/actions/standings.ts             [✏️ MODIFICARE - se serve]
```

#### FASE 4: Componenti Home (MODIFICARE + CREARE)
```typescript
// /src/components/home/home-content.tsx     [✏️ MODIFICARE - layout principale]
// /src/components/home/next-match-card.tsx  [🆕 CREARE - card partita]
// /src/components/home/rosa-widget.tsx      [🆕 CREARE - widget crediti]
// /src/components/home/explore-section.tsx  [🆕 CREARE - sidebar]
// /src/components/countdown.tsx             [✏️ MODIFICARE - countdown esistente]
```

#### FASE 5: Componenti Formazione (CREARE nuova struttura)
```typescript
// Pagina esistente:
// /src/app/team/lineup/page.tsx             [✏️ MODIFICARE - usa i nuovi componenti]

// Nuovi componenti:
// /src/components/lineup/                   [🆕 CARTELLA]
// /src/components/lineup/formation-pitch.tsx    [🆕 CREARE]
// /src/components/lineup/player-list.tsx        [🆕 CREARE]
// /src/components/lineup/player-card.tsx        [🆕 CREARE]
// /src/components/lineup/player-details.tsx     [🆕 CREARE]
// /src/components/lineup/formation-selector.tsx [🆕 CREARE]
```

#### FASE 6: Componenti Market (MODIFICARE esistenti + CREARE nuovi)
```typescript
// Pagina esistente:
// /src/app/team/market/page.tsx             [✏️ MODIFICARE]

// Componenti esistenti da MODIFICARE:
// /src/components/market/free-agents.tsx    [✏️ MODIFICARE - griglia migliorata]
// /src/components/market/active-auctions.tsx [✏️ MODIFICARE]
// /src/components/market/trades-section.tsx  [✏️ MODIFICARE]

// Nuovi componenti da CREARE:
// /src/components/market/market-tabs.tsx     [🆕 CREARE]
// /src/components/market/player-grid.tsx     [🆕 CREARE]
// /src/components/market/filter-bar.tsx      [🆕 CREARE]
// /src/components/market/player-card-market.tsx [🆕 CREARE]
```

#### FASE 7: Componenti Risultati (MODIFICARE page)
```typescript
// Pagine esistenti:
// /src/app/team/results/page.tsx            [✏️ MODIFICARE - lista risultati]
// /src/app/team/results/[id]/page.tsx       [✏️ MODIFICARE - dettaglio match]

// Nuovi componenti da CREARE:
// /src/components/results/                  [🆕 CARTELLA]
// /src/components/results/match-list.tsx    [🆕 CREARE]
// /src/components/results/match-card.tsx    [🆕 CREARE]
// /src/components/results/day-navigator.tsx [🆕 CREARE - opzionale]
```

#### FASE 8: Componenti Classifica (MODIFICARE page)
```typescript
// Pagina esistente:
// /src/app/standings/page.tsx               [✏️ MODIFICARE]

// Nuovi componenti da CREARE:
// /src/components/standings/                [🆕 CARTELLA]
// /src/components/standings/leaderboard-table.tsx [🆕 CREARE]
// /src/components/standings/team-row.tsx          [🆕 CREARE]
```

#### FASE 9: Settings (MODIFICARE esistente)
```typescript
// Componente esistente:
// /src/components/settings-dialog.tsx       [✏️ MODIFICARE - redesign completo]

// Nuovi componenti (opzionali):
// /src/components/settings/theme-toggle.tsx [🆕 CREARE - se serve dark mode]
```

#### FASE 10: Componenti Condivisi (MODIFICARE + USARE esistenti)
```typescript
// Componenti esistenti da MODIFICARE:
// /src/components/bottom-nav.tsx            [✏️ MODIFICARE - label più grandi]
// /src/components/team-logo.tsx             [✅ USARE - già OK]

// Componenti shadcn/ui da USARE (NON ricreare):
// /src/components/ui/button.tsx             [✅ USARE]
// /src/components/ui/badge.tsx              [✅ USARE]
// /src/components/ui/card.tsx               [✅ USARE]
// /src/components/ui/dialog.tsx             [✅ USARE]
// /src/components/ui/tabs.tsx               [✅ USARE]
// /src/components/ui/select.tsx             [✅ USARE]
// /src/components/ui/switch.tsx             [✅ USARE]
// /src/components/ui/avatar.tsx             [✅ USARE]
// /src/components/ui/skeleton.tsx           [✅ USARE]
```

### 🚨 REGOLE IMPORTANTI

1. **NON ricreare componenti shadcn/ui** - Usa quelli in `/src/components/ui/`
2. **TypeScript (.tsx, .ts)** - NON usare .jsx o .js
3. **Next.js App Router** - Le pagine sono in `/src/app/`, non `/src/pages/`
4. **Server Components** - Usa "use client" solo quando necessario
5. **Tailwind CSS** - È già configurato, usa le classi esistenti
6. **Icone** - Usa lucide-react (già nel progetto)

### 📊 Legenda Simboli
- ✅ **USARE** - File/componente già presente e OK
- ✏️ **MODIFICARE** - File esistente da aggiornare
- 🆕 **CREARE** - File nuovo da creare

### API Integration - football-data.org

**IMPORTANTE**: Il file `/src/app/actions/football-data.ts` ESISTE GIÀ!

**Modificare il file esistente aggiungendo questa funzione:**

```typescript
// /src/app/actions/football-data.ts  [✏️ MODIFICARE - aggiungere getCurrentMatchday]

'use server';

// ... codice esistente ...

/**
 * Ottiene la giornata corrente dalla Serie A
 * Usato per l'auto-scroll nella schermata Risultati
 */
export async function getCurrentMatchday(): Promise<{
  matchday: number;
  season: string;
} | null> {
  try {
    const response = await fetch(
      `https://api.football-data.org/v4/competitions/SA/matches?status=SCHEDULED`,
      {
        headers: {
          'X-Auth-Token': process.env.FOOTBALL_DATA_API_KEY || '',
        },
        next: { revalidate: 3600 }, // Cache per 1 ora
      }
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.matches || data.matches.length === 0) {
      // Nessuna partita scheduled, prova a prendere l'ultima giornata finita
      const finishedResponse = await fetch(
        `https://api.football-data.org/v4/competitions/SA/matches?status=FINISHED`,
        {
          headers: {
            'X-Auth-Token': process.env.FOOTBALL_DATA_API_KEY || '',
          },
          next: { revalidate: 3600 },
        }
      );
      
      const finishedData = await finishedResponse.json();
      const lastMatch = finishedData.matches[finishedData.matches.length - 1];
      
      return {
        matchday: lastMatch?.matchday || 1,
        season: lastMatch?.season?.startYear?.toString() || '2025',
      };
    }
    
    // Prendi la prossima partita scheduled
    const nextMatch = data.matches[0];
    
    return {
      matchday: nextMatch.matchday,
      season: nextMatch.season?.startYear?.toString() || '2025',
    };
  } catch (error) {
    console.error('Error fetching current matchday:', error);
    return null;
  }
}

/**
 * Ottiene tutte le partite della Serie A per una giornata specifica
 */
export async function getMatchdayMatches(matchday: number) {
  try {
    const response = await fetch(
      `https://api.football-data.org/v4/competitions/SA/matches?matchday=${matchday}`,
      {
        headers: {
          'X-Auth-Token': process.env.FOOTBALL_DATA_API_KEY || '',
        },
        next: { revalidate: 300 }, // Cache per 5 minuti
      }
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data.matches;
  } catch (error) {
    console.error('Error fetching matchday matches:', error);
    return [];
  }
}
```

**Assicurati che l'env variable sia configurata:**
```bash
# .env.local
FOOTBALL_DATA_API_KEY=your_api_key_here
```

### Tailwind Config
**NOTA**: Il progetto usa Next.js, quindi il file è `tailwind.config.ts` (già presente).

Aggiungere/modificare in `tailwind.config.ts`:

```typescript
// tailwind.config.ts  [✏️ MODIFICARE]

import type { Config } from "tailwindcss";

const config: Config = {
  // ... configurazione esistente ...
  
  theme: {
    extend: {
      colors: {
        // Aggiungi i colori custom dal design system
        primary: {
          50: '#EEF2FF',
          100: '#E0E7FF',
          500: '#5B7FFF',
          600: '#4C6FE8',
          700: '#3D5FC4',
        },
        secondary: {
          50: '#F0FDF4',
          500: '#10B981',
          600: '#059669',
        },
        goalkeeper: '#F97316',
        defender: '#FCD34D',
        midfielder: '#10B981',
        attacker: '#5B7FFF',
      },
      animation: {
        'pulse-once': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) 1',
        'fade-in': 'fadeIn 0.3s ease-in',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [
    // Plugin già presenti nel progetto
    require('@tailwindcss/forms'),
  ],
};

export default config;
```

### Testing Checklist
Prima del deploy, verificare:
- [ ] Tutte le schermate responsive (mobile, tablet, desktop)
- [ ] Navigazione keyboard funzionante
- [ ] Contrast ratio OK su tutti i testi
- [ ] Loading states implementati
- [ ] Error states implementati
- [ ] Auto-scroll giornata corrente funziona
- [ ] Widget crediti si aggiorna correttamente
- [ ] Classifica evidenzia correttamente l'utente
- [ ] Bottom nav mostra stato attivo corretto
- [ ] Settings salvano correttamente le modifiche

---

## 🎨 RIFERIMENTI DESIGN

### Ispirazione UI/UX
- **Fantasy Premier League**: gestione countdown, formazioni, card design
- **Sorare**: micro-interactions, animazioni, card hover effects
- **ESPN Fantasy**: tabelle classifica, statistiche dettagliate
- **FanDuel**: mercato giocatori, filtri avanzati
- **DraftKings**: bottom navigation, gestione crediti

### Risorse Utili
- [Tailwind UI Components](https://tailwindui.com/components)
- [Lucide Icons](https://lucide.dev/) - per icons
- [Framer Motion](https://www.framer.com/motion/) - per animazioni avanzate
- [React DnD](https://react-dnd.github.io/react-dnd/) - per drag & drop formazione

---

## ✅ CONCLUSIONI

Questo mega-prompt copre TUTTI gli aspetti del redesign UI dell'applicazione Fantacalcio:

1. ✅ **6 schermate principali** analizzate e riprogettate
2. ✅ **Componenti condivisi** (Bottom Nav, Cards, Buttons)
3. ✅ **Design system completo** (colors, typography, spacing)
4. ✅ **Codice implementativo** con esempi Tailwind CSS
5. ✅ **Integrazione API** football-data.org per auto-scroll
6. ✅ **Struttura cartelle** consigliata per organizzazione
7. ✅ **Priorità implementazione** (Must/Should/Nice to Have)
8. ✅ **Metriche di successo** misurabili
9. ✅ **Testing checklist** pre-deploy
10. ✅ **Accessibilità WCAG 2.1 AA** garantita

### Prossimi Passi
1. **Antigravity** legge il prompt
2. Crea la struttura cartelle consigliata
3. Implementa i design tokens
4. Modifica/crea i componenti uno per uno seguendo le priorità
5. Testa ogni schermata su mobile e desktop
6. Verifica accessibilità e performance
7. Deploy!

---

**Documento creato il:** 30 Gennaio 2026  
**Versione:** 1.0  
**Autore:** Claude (Anthropic)  
**Per:** Progetto Fantacalcio UI Redesign

---

## 🤖 ISTRUZIONI FINALI PER ANTIGRAVITY

### Come Leggere Questo Documento

Questo mega-prompt contiene:
- **Analisi problemi** per ogni schermata
- **Design migliorato** con layout visivi ASCII
- **Codice completo** TypeScript/React/Tailwind pronto per copy-paste
- **Checklist implementazione** all'inizio del documento

### Strategia di Implementazione Consigliata

**Approccio Iterativo** (consigliato):
```bash
1. Fai Step 1-2 (Setup + Design Tokens)
2. Mostra il risultato all'utente
3. Procedi con Step 3-5 (Home + Bottom Nav)
4. Mostra il risultato all'utente
5. Continua con gli step successivi uno per uno
```

**Approccio Completo**:
```bash
1. Esegui tutti gli step dalla checklist
2. Mostra il risultato finale
```

### File da NON Modificare (Già OK)
- `/src/components/ui/*` → Componenti shadcn/ui già configurati
- `/src/components/team-logo.tsx` → Già funzionante
- `/public/teams/*` → Loghi squadre già presenti
- `/src/hooks/use-media-query.ts` → Già presente e funzionante

### File Critici da Modificare con Attenzione
- `/src/components/bottom-nav.tsx` → Usato in tutta l'app
- `/src/app/layout.tsx` → Root layout
- `tailwind.config.ts` → Config globale

### Quando Creare un Nuovo Componente
Crea un nuovo componente quando:
- Non esiste un componente simile
- Il componente esistente è troppo diverso dal design target
- Vuoi mantenere backward compatibility

### Quando Modificare un Componente Esistente
Modifica un componente quando:
- Esiste già e fa sostanzialmente la stessa cosa
- Piccole modifiche visive sono sufficienti
- Non rompe altre parti dell'app

### Testing Durante l'Implementazione
Dopo ogni step maggiore:
```bash
npm run dev
# Apri http://localhost:3000
# Testa la sezione modificata
# Verifica console per errori TypeScript
```

### Se Incontri Problemi
- **Import errors**: Verifica i path relativi (`@/...`)
- **TypeScript errors**: Aggiungi type annotations mancanti
- **Styling issues**: Verifica che Tailwind CSS sia compilato
- **Component not found**: Controlla che il file sia creato nella cartella corretta

### Comunicazione con l'Utente
Durante l'implementazione:
1. Conferma quale step stai eseguendo
2. Mostra i file che stai modificando/creando
3. Evidenzia eventuali breaking changes
4. Chiedi conferma prima di procedere con step complessi

### Best Practices
- ✅ Usa `'use client'` solo quando necessario (eventi, hooks, context)
- ✅ Preferisci Server Components quando possibile
- ✅ Usa i componenti shadcn/ui invece di ricrearli
- ✅ Mantieni la tipizzazione TypeScript strict
- ✅ Aggiungi commenti per codice complesso
- ✅ Segui le convenzioni Next.js App Router

---

## 🎬 PRONTO PER INIZIARE!

Quando l'utente dice: **"Antigravity, implementa i miglioramenti UI"**

Tu rispondi:
```
Ho letto il documento /docs/ui-improvements.md completo!

Procedo con l'implementazione seguendo la checklist.
Inizierò con:

✅ Step 1-2: Setup e Design Tokens (15 min)
✅ Step 3-5: Hooks + Home + Bottom Nav (80 min)

Dopo questi step, ti mostrerò il risultato e procederò con le altre schermate.

Confermo che devo:
- MODIFICARE i file esistenti quando indicato [✏️]
- CREARE i nuovi file quando indicato [🆕]  
- USARE i componenti shadcn/ui quando indicato [✅]

Posso iniziare? (Rispondi "sì" per procedere)
```

---

**Fine del Mega-Prompt. Buon lavoro, Antigravity! 🚀**