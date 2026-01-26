'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Translations = {
    [key: string]: string;
};

const translations: Record<string, Translations> = {
    en: {
        welcome: 'Welcome',
        myTeam: 'My Team',
        market: 'Market',
        results: 'Results',
        standings: 'Standings',
        adminAccess: 'Admin Access',
        beta: 'BETA v0.1',
        loginToManage: 'Login to manage your team',
        login: 'Login',
        logout: 'Logout',
        loading: 'Loading...',

        // Settings
        settings: 'Settings',
        theme: 'App Theme',
        light: 'Light',
        dark: 'Dark',
        language: 'Language',

        // Trades
        trades: 'Trades',
        activeTrades: 'Active Trades',
        tradeProposals: 'Trade Proposals',
        newTrade: 'New Trade',
        noTrades: 'No active trade proposals.',
        receivedProposals: 'Received Proposals',
        sentProposals: 'Sent Proposals',
        youGive: 'You Give',
        youGet: 'You Get',
        confirmTrade: 'Are you sure you want to accept this trade?',
        rejectTrade: 'Are you sure you want to reject this trade?',
        cancelTrade: 'Are you sure you want to cancel this proposal?',
        tradeAccepted: 'Trade accepted successfully!',
        tradeRejected: 'Trade rejected.',
        tradeCancelled: 'Trade cancelled.',
        success: 'Success',
        error: 'Error',
        back: 'Back',

        // Market Page (New)
        transferMarket: 'Transfer Market',
        credits: 'Credits',
        activeAuctions: 'Active Auctions',
        noAuctions: 'No active auctions.',
        viewAuctions: 'View Auctions',
        newAuction: 'New Auction',
        startAuction: 'Start Auction', // Usually inside the modal
        freeAgents: 'Free Agents',
        browse: 'Browse',
        releasePlayer: 'Release Player',
        releaseDesc: 'Release players to recover credits.',
        manageSquad: 'Manage Squad',
        createTeamFirst: 'Create Team First',
        noTeamMessage: 'You need to create a team before accessing the market.',
        createTeam: 'Create Team',

        // Release
        releaseConfirm: 'Are you sure you want to release this player? You will recover',
        releasedSuccess: 'Player released successfully',

        // Matchday Reminder
        nextMatchday: 'Next Matchday',
        startsAt: 'Starts at',
        timeLeft: 'Time Left',
        setupApiKey: 'Setup FOOTBALL_DATA_API_KEY to see real match schedules.',
        matchday: 'Matchday',
        inProgress: 'In Progress',
        lineupsLocked: 'Lineups Locked',

        // Standings
        leagueTableDescription: 'Official league standings.',
        rank: '#',
        team: 'Team',
        pt: 'Pts',
        pg: 'P',
        v: 'W',
        n: 'D',
        l: 'L',
        gf: 'GF',
        gs: 'GA',
        tot: 'Tot',
        noGames: 'No games played yet.',
        scrollHint: 'Swipe horizontally to see all stats.',

        // ResultsPage
        matchResults: 'Match Results',
        upcoming: 'Upcoming',
        finished: 'Finished',
        win: 'Win',
        draw: 'Draw',
        loss: 'Loss',
        vs: 'vs',
        noTeam: 'No Team Found',
        createTeamMessage: 'You need to create a team to see results.',

        // Lineup Page
        lineup: 'Lineup',
        myRoster: 'My Roster',
        bench: 'Bench',
        playerDetails: 'Player Details',
        price: 'Price',
        selectPlayerDetails: 'Select a player to see details',
        selectPlayer: 'Select Player',
        choosePlayerInsert: 'Choose a player to insert',
        noPlayersAvailable: 'No players available for this role',
        saveLineup: 'Save Lineup',
        lineupIncomplete: 'Your lineup is incomplete. Select 11 players.',
        lineupSaved: 'Lineup saved successfully!',
        // Admin Dashboard
        adminDashboard: 'Admin Dashboard',
        coreManagement: 'Core Management',
        dataImport: 'Data Import',
        dataImportDesc: 'Import players/matches from CSV or API.',
        goToImports: 'Go to Imports',
        matchCalendar: 'Match Calendar',
        matchCalendarDesc: 'Manage fixtures and scores.',
        manageCalendar: 'Manage Calendar',
        manageTeams: 'Manage Teams',
        teams: 'Teams',
        teamsDesc: 'Edit fantasy teams details.',
        marketSettings: 'Market Settings',
        marketSettingsDesc: 'Configure auction durations and limits.',
        userManagement: 'User Management',
        userManagementDesc: 'Ban/Unban users, view details.',
        manageUsers: 'Manage Users',
        systemLogs: 'System Logs',
        systemLogsDesc: 'Audit trail of actions.',
        viewLogs: 'View Logs',
        systemUtilities: 'System Utilities',
        devTools: 'Developer Tools',
        devToolsDesc: 'Test notifications and api calls.',
        dangerZone: 'Danger Zone',
        dangerZoneDesc: 'Reset database, clear data.',
        sendTestNotification: 'Send Test Notification',
        sending: 'Sending...',
        sentToDevices: 'Sent to {count} devices.',

        // Notifications
        enablePush: 'Enable Push Notifications',
        disablePush: 'Disable Push Notifications',
        pushSupported: 'Push Notifications Supported',
        pushNotSupported: 'Push Notifications Not Supported',
        pushActive: 'Active',
        pushInactive: 'Inactive'
    },
    it: {
        welcome: 'Benvenuto',
        myTeam: 'Rosa',
        market: 'Mercato',
        results: 'Risultati',
        standings: 'Classifica',
        adminAccess: 'Accesso Admin',
        beta: 'BETA v0.1',
        loginToManage: 'Accedi per gestire la tua squadra',
        login: 'Accedi',
        logout: 'Esci',
        loading: 'Caricamento...',

        // Settings
        settings: 'Impostazioni',
        theme: 'Tema App',
        light: 'Chiaro',
        dark: 'Scuro',
        language: 'Lingua',

        // Trades
        trades: 'Scambi',
        activeTrades: 'Scambi Attivi',
        tradeProposals: 'Proposte di Scambio',
        newTrade: 'Nuovo Scambio',
        noTrades: 'Nessuna proposta di scambio attiva.',
        receivedProposals: 'Proposte Ricevute',
        sentProposals: 'Proposte Inviate',
        youGive: 'Cedi',
        youGet: 'Ricevi',
        confirmTrade: 'Sei sicuro di voler accettare questo scambio?',
        rejectTrade: 'Sei sicuro di voler rifiutare questo scambio?',
        cancelTrade: 'Sei sicuro di voler cancellare questa proposta?',
        tradeAccepted: 'Scambio accettato con successo!',
        tradeRejected: 'Scambio rifiutato.',
        tradeCancelled: 'Scambio cancellato.',
        success: 'Accetta',
        error: 'Rifiuta',
        back: 'Indietro',

        // Market Page (New)
        transferMarket: 'Mercato',
        credits: 'Crediti',
        activeAuctions: 'Aste Attive',
        noAuctions: 'Nessuna asta attiva.',
        viewAuctions: 'Vedi Aste',
        newAuction: 'Nuova Asta',
        startAuction: 'Avvia Asta',
        freeAgents: 'Svincolati',
        browse: 'Sfoglia',
        releasePlayer: 'Taglia Giocatore',
        releaseDesc: 'Taglia giocatori per recuperare crediti.',
        manageSquad: 'Gestisci Rosa',
        createTeamFirst: 'Crea Squadra',
        noTeamMessage: 'Devi creare una squadra prima di accedere al mercato.',
        createTeam: 'Crea Squadra',

        // Release
        releaseConfirm: 'Sei sicuro di voler tagliare questo giocatore? Recupererai',
        releasedSuccess: 'Giocatore tagliato con successo',

        // Matchday Reminder
        nextMatchday: 'Prossima Giornata',
        startsAt: 'Inizio',
        timeLeft: 'Mancano',
        setupApiKey: 'Configura FOOTBALL_DATA_API_KEY per vedere gli orari reali.',
        matchday: 'Giornata',
        inProgress: 'in Corso',
        lineupsLocked: 'Formazioni Chiuse',

        // Standings
        leagueTableDescription: 'La classifica ufficiale del campionato.',
        rank: '#',
        team: 'Squadra',
        pt: 'PT',
        pg: 'PG',
        v: 'V',
        n: 'N',
        l: 'P',
        gf: 'GF',
        gs: 'GS',
        tot: 'Tot',
        noGames: 'Nessuna partita giocata ancora.',
        scrollHint: 'Scorri orizzontalmente per vedere tutte le statistiche.',

        // ResultsPage
        matchResults: 'Risultati Partite',
        upcoming: 'In Programma',
        finished: 'Terminata',
        win: 'Vittoria',
        draw: 'Pareggio',
        loss: 'Sconfitta',
        vs: 'vs',
        noTeam: 'Nessuna Squadra',
        createTeamMessage: 'Devi creare una squadra per vedere i risultati.',

        // Lineup Page
        lineup: 'Formazione',
        myRoster: 'La Mia Rosa',
        bench: 'Panchina',
        playerDetails: 'Dettagli Giocatore',
        price: 'Quot.',
        selectPlayerDetails: 'Seleziona un giocatore per i dettagli',
        selectPlayer: 'Seleziona Giocatore',
        choosePlayerInsert: 'Scegli un giocatore da inserire',
        noPlayersAvailable: 'Nessun giocatore disponibile per questo ruolo',
        saveLineup: 'Salva Formazione',
        lineupIncomplete: 'La formazione è incompleta. Devi schierare 11 titolari.',
        lineupSaved: 'Formazione salvata con successo!',

        // Admin Dashboard
        adminDashboard: 'Pannello Admin',
        coreManagement: 'Gestione Principale',
        dataImport: 'Importazione Dati',
        dataImportDesc: 'Importa giocatori/match da CSV o API.',
        goToImports: 'Vai a Importazione',
        matchCalendar: 'Calendario Partite',
        matchCalendarDesc: 'Gestisci calendario e punteggi.',
        manageCalendar: 'Gestisci Calendario',
        manageTeams: 'Gestisci Squadre',
        teams: 'Squadre',
        teamsDesc: 'Modifica dettagli squadre fantacalcio.',
        marketSettings: 'Impostazioni Mercato',
        marketSettingsDesc: 'Configura durate aste e limiti.',
        userManagement: 'Gestione Utenti',
        userManagementDesc: 'Ban/Sban utenti, vedi dettagli.',
        manageUsers: 'Gestisci Utenti',
        systemLogs: 'Log di Sistema',
        systemLogsDesc: 'Audit delle azioni svolte.',
        viewLogs: 'Vedi Log',
        systemUtilities: 'Utilità di Sistema',
        devTools: 'Strumenti Sviluppatore',
        devToolsDesc: 'Test notifiche e chiamate API.',
        dangerZone: 'Zona Pericolo',
        dangerZoneDesc: 'Reset database, pulizia dati.',
        sendTestNotification: 'Invia Notifica Test',
        sending: 'Invio...',
        sentToDevices: 'Inviato a {count} dispositivi.',

        // Notifications
        enablePush: 'Abilita Notifiche Push',
        disablePush: 'Disabilita Notifiche Push',
        pushSupported: 'Notifiche Push Supportate',
        pushNotSupported: 'Notifiche Push Non Supportate',
        pushActive: 'Attivo',
        pushInactive: 'Inattivo'
    }
};

const LanguageContext = createContext<{
    language: string;
    setLanguage: (lang: string) => void;
    theme: string;
    setTheme: (theme: string) => void;
    t: (key: string) => string
}>({
    language: 'it',
    setLanguage: () => { },
    theme: 'light',
    setTheme: () => { },
    t: (key) => key,
});

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
    const [language, setLanguage] = useState('it');
    const [theme, setTheme] = useState('light');

    useEffect(() => {
        const savedLang = localStorage.getItem('language');
        if (savedLang) setLanguage(savedLang);

        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            setTheme(savedTheme);
            if (savedTheme === 'dark') document.documentElement.classList.add('dark');
        } else {
            // System preference?
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                setTheme('dark');
                document.documentElement.classList.add('dark');
            }
        }
    }, []);

    const updateLanguage = (lang: string) => {
        setLanguage(lang);
        localStorage.setItem('language', lang);
    };

    const updateTheme = (newTheme: string) => {
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        if (newTheme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    };

    const t = (key: string) => {
        const dict = translations[language] || translations['it'];
        return dict?.[key] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage: updateLanguage, theme, setTheme: updateTheme, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => useContext(LanguageContext);
