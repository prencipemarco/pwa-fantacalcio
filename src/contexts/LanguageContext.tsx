'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'en' | 'it';

type Translations = {
    [key in Language]: {
        welcome: string;
        login: string;
        signup: string;
        myTeam: string;
        market: string;
        results: string;
        adminDashboard: string;
        adminAccess: string;
        manageTeam: string;
        loginToManage: string;
        credits: string;
        beta: string;
        activeAuctions: string;
        newAuction: string;
        freeAgents: string;
        searchPlayer: string;
        startAuction: string;
        bid: string;
        noAuctions: string;
        lineup: string;
        bench: string;
        saveLineup: string;
        trade: string;
        releasePlayer: string;
        releaseDesc: string;
        confirmRelease: string;
        released: string;
        proposeTrade: string;
        myTrades: string;
        back: string;
        loading: string;
        error: string;
        success: string;
        trades: string;
        tradeProposals: string;
        newTrade: string;
        noTrades: string;
        createTeamFirst: string;
        noTeamMessage: string;
        // Admin
        dataImport: string;
        dataImportDesc: string;
        goToImports: string;
        matchCalendar: string;
        matchCalendarDesc: string;
        manageCalendar: string;
        teams: string;
        teamsDesc: string;
        manageTeams: string;
        marketSettings: string;
        marketSettingsDesc: string;
        settings: string;
        userManagement: string;
        userManagementDesc: string;
        manageUsers: string;
        systemLogs: string;
        systemLogsDesc: string;
        // Trade Keys
        selectPartner: string;
        chooseOpponent: string;
        selectTeam: string;
        startTrade: string;
        changePartner: string;
        tradeProposal: string;
        sendProposal: string;
        myRoster: string;
        myOffer: string;
        theirOffer: string;
        theirRoster: string;
        requestCredits: string;
        offerCredits: string;
        nextMyOffer: string;
        selectRequest: string;
        selectOffer: string;
        fromRoster: string;
        matchRolesWarning: string;
        reviewProposal: string;
        youGive: string;
        youGet: string;
        confirmSend: string;
        activeTrades: string;
        receivedProposals: string;
        sentProposals: string;
        confirmTrade: string;
        rejectTrade: string;
        cancelTrade: string;
        tradeSent: string;
        tradeAccepted: string;
        tradeRejected: string;
        tradeCancelled: string;
        emptyTrade: string;
        roleMismatch: string;
        // End Trade Keys
        viewLogs: string;
        systemUtilities: string;
        devTools: string;
        devToolsDesc: string;
        dangerZone: string;
        dangerZoneDesc: string;
        coreManagement: string;
        created: string;
    };
};

const translations: Translations = {
    en: {
        welcome: 'Welcome back',
        login: 'Login / Sign Up',
        signup: 'Sign Up',
        myTeam: 'My Team',
        market: 'Market',
        results: 'Results',
        adminDashboard: 'Admin Dashboard',
        adminAccess: 'Admin Access',
        manageTeam: 'Manage your team.',
        loginToManage: 'Login to manage your team.',
        credits: 'Credits Remaining',
        beta: 'Beta v0.1',
        activeAuctions: 'Active Auctions',
        newAuction: 'Start New Auction',
        freeAgents: 'Free Agents',
        searchPlayer: 'Search player...',
        startAuction: 'Start Auction',
        bid: 'Bid',
        noAuctions: 'No active auctions right now.',
        lineup: 'Lineup',
        bench: 'Bench',
        saveLineup: 'Save Lineup',
        trade: 'Trade Center',
        proposeTrade: 'Propose Trade',
        myTrades: 'My Trades',
        back: 'Back',
        loading: 'Loading...',
        error: 'Error',
        success: 'Success',
        createTeamFirst: 'Create Team First',
        trades: 'Trades',
        tradeProposals: 'Trade Proposals',
        newTrade: 'New Trade',
        noTrades: 'No active trades.',
        releasePlayer: 'Release Players',
        releaseDesc: 'Release owned players for 50% refund.',
        confirmRelease: 'Confirm release? Refund: ',
        released: 'Player released!',
        noTeamMessage: 'You need to create a team to access this section.',
        // Admin
        dataImport: 'Data Import',
        dataImportDesc: 'Manage Players, Rosters, and Match Votes.',
        goToImports: 'Go to Imports',
        matchCalendar: 'Match Calendar',
        matchCalendarDesc: 'Generate season fixtures (Berger Algorithm).',
        manageCalendar: 'Manage Calendar',
        teams: 'Teams',
        teamsDesc: 'View all enrolled teams.',
        manageTeams: 'Manage Teams',
        marketSettings: 'Market Settings',
        marketSettingsDesc: 'Configure auction duration and rules.',
        settings: 'Settings',
        userManagement: 'User Management',
        userManagementDesc: 'Manage registered users (Sign Ups).',
        manageUsers: 'Manage Users',
        systemLogs: 'System Logs',
        systemLogsDesc: 'View system activity and audit logs.',
        viewLogs: 'View Logs',
        systemUtilities: 'System Utilities',
        devTools: 'Dev Tools',
        devToolsDesc: 'Test utilites (Seeding).',
        dangerZone: 'Danger Zone',
        dangerZoneDesc: 'Destructive actions (Reset).',
        coreManagement: 'Core Management',
        created: 'Created At',
        // Trade - EN
        selectPartner: 'Select Trading Partner',
        chooseOpponent: 'Choose a team to propose a trade to.',
        selectTeam: 'Select Team',
        startTrade: 'Start Trade',
        changePartner: 'Change Partner',
        tradeProposal: 'Trade Proposal',
        sendProposal: 'Send Proposal',
        myRoster: 'My Roster',
        myOffer: 'My Offer',
        theirOffer: 'Opponent\'s Offer',
        theirRoster: 'Opponent\'s Roster',
        requestCredits: 'Request Credits (Optional)',
        offerCredits: 'Offer Credits (Optional)',
        nextMyOffer: 'Next: My Offer',
        selectRequest: 'Select Players to Request',
        selectOffer: 'Select Players to Offer',
        fromRoster: 'From Roster',
        matchRolesWarning: 'You requested X players. Match roles!',
        reviewProposal: 'Review Proposal',
        youGive: 'You Give',
        youGet: 'You Get',
        confirmSend: 'Confirm & Send',
        activeTrades: 'Active Trades',
        receivedProposals: 'Received Proposals',
        sentProposals: 'Sent Proposals',
        confirmTrade: 'Confirm trade? This is irreversible.',
        rejectTrade: 'Reject this trade proposal?',
        cancelTrade: 'Cancel this trade proposal?',
        tradeSent: 'Trade sent successfully!',
        tradeAccepted: 'Trade accepted!',
        tradeRejected: 'Trade rejected.',
        tradeCancelled: 'Trade cancelled.',
        emptyTrade: 'Empty Trade.',
        roleMismatch: 'Must exchange same number of players per role.',
    },
    it: {
        welcome: 'Bentornato',
        login: 'Accedi / Registrati',
        signup: 'Registrati',
        myTeam: 'Squadra',
        market: 'Mercato',
        results: 'Risultati',
        adminDashboard: 'Pannello Admin',
        adminAccess: 'Accesso Admin',
        manageTeam: 'Gestisci la tua squadra.',
        loginToManage: 'Accedi per gestire la tua squadra.',
        credits: 'Crediti Residui',
        beta: 'Beta v0.1',
        activeAuctions: 'Aste in Corso',
        newAuction: 'Nuova Asta',
        freeAgents: 'Svincolati (Listone)',
        searchPlayer: 'Cerca giocatore...',
        startAuction: 'Avvia Asta',
        bid: 'Punta',
        noAuctions: 'Nessuna asta attiva al momento.',
        lineup: 'Formazione',
        bench: 'Panchina',
        trades: 'Scambi',
        tradeProposals: 'Proposte di Scambio',
        newTrade: 'Nuovo Scambio',
        noTrades: 'Nessuno scambio in corso.',
        releasePlayer: 'Svincola Giocatori',
        releaseDesc: 'Svincola giocatori per recuperare il 50% dei crediti.',
        confirmRelease: 'Svincolare? Rimborso: ',
        released: 'Giocatore svincolato!',
        saveLineup: 'Salva Formazione',
        trade: 'Scambi',
        proposeTrade: 'Proponi Scambio',
        myTrades: 'I Miei Scambi',
        back: 'Indietro',
        loading: 'Caricamento...',
        error: 'Errore',
        success: 'Successo',
        createTeamFirst: 'Crea Prima la Squadra',
        noTeamMessage: 'Devi creare una squadra per accedere a questa sezione.',
        // Admin
        dataImport: 'Importazione Dati',
        dataImportDesc: 'Gestisci Calciatori, Rose e Voti.',
        goToImports: 'Vai a Importazione',
        matchCalendar: 'Calendario Partite',
        matchCalendarDesc: 'Genera il calendario della stagione (Algoritmo Berger).',
        manageCalendar: 'Gestisci Calendario',
        teams: 'Squadre',
        teamsDesc: 'Visualizza tutte le squadre iscritte.',
        manageTeams: 'Gestisci Squadre',
        marketSettings: 'Impostazioni Mercato',
        marketSettingsDesc: 'Configura durata aste e regole.',
        settings: 'Impostazioni',
        userManagement: 'Gestione Utenti',
        userManagementDesc: 'Gestisci utenti registrati (Iscrizioni).',
        manageUsers: 'Gestisci Utenti',
        systemLogs: 'Log di Sistema',
        systemLogsDesc: 'Visualizza attività di sistema e log.',
        viewLogs: 'Visualizza Log',
        systemUtilities: 'Utilità di Sistema',
        devTools: 'Strumenti Sviluppo',
        devToolsDesc: 'Utility di test (Seeding).',
        dangerZone: 'Zona Pericolo',
        dangerZoneDesc: 'Azioni distruttive (Reset).',
        coreManagement: 'Gestione Principale',
        created: 'Creato il',
        // Trade - IT
        selectPartner: 'Seleziona Partner Scambio',
        chooseOpponent: 'Scegli una squadra con cui scambiare.',
        selectTeam: 'Seleziona Squadra',
        startTrade: 'Avvia Scambio',
        changePartner: 'Cambia Partner',
        tradeProposal: 'Proposta di Scambio',
        sendProposal: 'Invia Proposta',
        myRoster: 'La Mia Rosa',
        myOffer: 'La Mia Offerta',
        theirOffer: 'Offerta Avversario',
        theirRoster: 'Rosa Avversario',
        requestCredits: 'Richiedi Crediti (Opzionale)',
        offerCredits: 'Offri Crediti (Opzionale)',
        nextMyOffer: 'Avanti: La Mia Offerta',
        selectRequest: 'Seleziona Giocatori da Richiedere',
        selectOffer: 'Seleziona Giocatori da Offrire',
        fromRoster: 'Dalla Rosa',
        matchRolesWarning: 'Hai richiesto giocatori. Pareggia i ruoli!',
        reviewProposal: 'Riepilogo Proposta',
        youGive: 'Tu Dai',
        youGet: 'Tu Ricevi',
        confirmSend: 'Conferma e Invia',
        activeTrades: 'Scambi Attivi',
        receivedProposals: 'Proposte Ricevute',
        sentProposals: 'Proposte Inviate',
        confirmTrade: 'Confermi lo scambio? È irreversibile.',
        rejectTrade: 'Rifiutare la proposta?',
        cancelTrade: 'Annullare la proposta?',
        tradeSent: 'Proposta inviata!',
        tradeAccepted: 'Scambio concluso!',
        tradeRejected: 'Proposta rifiutata.',
        tradeCancelled: 'Proposta annullata.',
        emptyTrade: 'Scambio vuoto.',
        roleMismatch: 'Devi scambiare lo stesso numero di giocatori per ruolo.',
    },
};

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: keyof Translations['en']) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [language, setLanguage] = useState<Language>('it');

    useEffect(() => {
        const saved = localStorage.getItem('app-language') as Language;
        if (saved) setLanguage(saved);
    }, []);

    const handleSetLanguage = (lang: Language) => {
        setLanguage(lang);
        localStorage.setItem('app-language', lang);
    };

    const t = (key: keyof Translations['en']) => {
        return translations[language][key] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
