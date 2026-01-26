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
        <div className="fixed bottom-0 left-0 right-0 border-t bg-stone-900 border-stone-800 text-white shadow-lg z-50 pb-safe transition-colors duration-300">
            <div className="flex justify-around items-center h-16">

                {/* 1. HOME (Back) */}
                <button
                    onClick={() => router.push('/')}
                    className="flex flex-col items-center p-2 text-stone-400 hover:text-white transition-colors"
                >
                    <Home size={24} />
                    <span className="text-[10px] mt-1 font-bold">Home</span>
                </button>

                {/* 2. LIVE MATCH (Fanta) */}
                <button
                    onClick={() => onTabChange('match')}
                    className={`flex flex-col items-center p-2 transition-colors ${currentTab === 'match' ? 'text-green-400' : 'text-stone-400'}`}
                >
                    <Shield size={24} className={currentTab === 'match' ? 'fill-current' : ''} />
                    <span className="text-[10px] mt-1 font-bold">Partita</span>
                </button>

                {/* 3. SERIE A */}
                <button
                    onClick={() => onTabChange('serie_a')}
                    className={`flex flex-col items-center p-2 transition-colors ${currentTab === 'serie_a' ? 'text-blue-400' : 'text-stone-400'}`}
                >
                    <List size={24} />
                    <span className="text-[10px] mt-1 font-bold">Serie A</span>
                </button>
            </div>
        </div>
    );
}
