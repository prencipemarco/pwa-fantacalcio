'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, ShoppingCart, Trophy, ListOrdered } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export function BottomNav() {
    const pathname = usePathname();
    const { t } = useLanguage();

    if (pathname.startsWith('/admin')) return null;

    const isActive = (path: string) => pathname === path;

    return (
        <div className="fixed bottom-0 left-0 right-0 border-t bg-white dark:bg-zinc-950 dark:border-zinc-800 shadow-[0_-1px_3px_rgba(0,0,0,0.1)] dark:shadow-none z-50 pb-safe transition-colors duration-300">
            <div className="flex justify-around items-center h-16">
                <Link href="/" className={`flex flex-col items-center p-2 transition-colors ${isActive('/') ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>
                    <Home size={24} />
                    <span className="text-[10px] mt-1">Home</span>
                </Link>

                <Link href="/team/lineup" className={`flex flex-col items-center p-2 transition-colors ${isActive('/team/lineup') ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>
                    <Users size={24} />
                    <span className="text-[10px] mt-1">{t('myTeam')}</span>
                </Link>

                <Link href="/team/market" className={`flex flex-col items-center p-2 transition-colors ${isActive('/team/market') ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>
                    <ShoppingCart size={24} />
                    <span className="text-[10px] mt-1">{t('market')}</span>
                </Link>

                <Link href="/team/results" className={`flex flex-col items-center p-2 transition-colors ${isActive('/team/results') ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>
                    <Trophy size={24} />
                    <span className="text-[10px] mt-1">{t('results')}</span>
                </Link>

                <Link href="/standings" className={`flex flex-col items-center p-2 transition-colors ${isActive('/standings') ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>
                    <ListOrdered size={24} />
                    <span className="text-[10px] mt-1">{t('standings')}</span>
                </Link>
            </div>
        </div>
    );
}
