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
        proposeTrade: string;
        myTrades: string;
        back: string;
        loading: string;
        error: string;
        success: string;
        createTeamFirst: string;
        noTeamMessage: string;
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
        noTeamMessage: 'You need to create a team to access this section.',
    },
    it: {
        welcome: 'Bentornato',
        login: 'Accedi / Registrati',
        signup: 'Registrati',
        myTeam: 'La Mia Squadra',
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
