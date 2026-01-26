'use client';

import { Home, List, Shield } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRouter } from 'next/navigation';

interface LiveNavbarProps {
    currentTab: 'serie_a' | 'match';
    onTabChange: (tab: 'serie_a' | 'match') => void;
}

export function LiveNavbar({ currentTab, onTabChange }: LiveNavbarProps) {
    const { t } = useLanguage();
    const router = useRouter();

    return (
        <div className="fixed bottom-0 left-0 right-0 border-t bg-white dark:bg-zinc-950 border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-white shadow-[0_-1px_3px_rgba(0,0,0,0.1)] dark:shadow-none z-50 pb-safe transition-colors duration-300">
            <div className="flex justify-around items-center h-16">

                {/* 1. HOME (Back) */}
                <button
                    onClick={() => router.push('/')}
                    className="flex flex-col items-center p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                    <Home size={24} />
                    <span className="text-[10px] mt-1 font-bold">Home</span>
                </button>

                {/* 2. LIVE MATCH (Fanta) */}
                <button
                    onClick={() => onTabChange('match')}
                    className={`flex flex-col items-center p-2 transition-colors ${currentTab === 'match' ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-400'}`}
                >
                    <Shield size={24} className={currentTab === 'match' ? 'fill-current' : ''} />
                    <span className="text-[10px] mt-1 font-bold">Partita</span>
                </button>

                {/* 3. SERIE A */}
                <button
                    onClick={() => onTabChange('serie_a')}
                    className={`flex flex-col items-center p-2 transition-colors ${currentTab === 'serie_a' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-400'}`}
                >
                    <List size={24} />
                    <span className="text-[10px] mt-1 font-bold">Serie A</span>
                </button>
            </div>
        </div>
    );
}
