'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, ShoppingCart, Trophy, ListOrdered } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export function BottomNav() {
    const pathname = usePathname();
    const { t } = useLanguage();

    if (pathname.startsWith('/admin') || pathname.startsWith('/live') || pathname === '/login') return null;

    const isActive = (path: string) => pathname === path;

    return (
        <div className="fixed bottom-0 left-0 right-0 border-t bg-white dark:bg-zinc-950 dark:border-zinc-800 shadow-[0_-1px_3px_rgba(0,0,0,0.1)] dark:shadow-none z-50 pb-safe transition-colors duration-300">
            <div className="flex justify-around items-center h-16 px-2">
                <Link href="/" className={`flex flex-col items-center justify-center w-14 h-14 rounded-2xl transition-all duration-300 ${isActive('/') ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400 scale-105' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-900'}`}>
                    <Home size={22} className={isActive('/') ? 'fill-current' : ''} />
                    {isActive('/') && <span className="text-[9px] font-bold mt-0.5">Home</span>}
                </Link>

                <Link href="/team/lineup" className={`flex flex-col items-center justify-center w-14 h-14 rounded-2xl transition-all duration-300 ${isActive('/team/lineup') ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400 scale-105' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-900'}`}>
                    <Users size={22} className={isActive('/team/lineup') ? 'fill-current' : ''} />
                    {isActive('/team/lineup') && <span className="text-[9px] font-bold mt-0.5">{t('myTeam')}</span>}
                </Link>

                <Link href="/team/market" className={`flex flex-col items-center justify-center w-14 h-14 rounded-2xl transition-all duration-300 ${isActive('/team/market') ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400 scale-105' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-900'}`}>
                    <ShoppingCart size={22} className={isActive('/team/market') ? 'fill-current' : ''} />
                    {isActive('/team/market') && <span className="text-[9px] font-bold mt-0.5">{t('market')}</span>}
                </Link>

                <Link href="/team/results" className={`flex flex-col items-center justify-center w-14 h-14 rounded-2xl transition-all duration-300 ${isActive('/team/results') ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400 scale-105' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-900'}`}>
                    <Trophy size={22} className={isActive('/team/results') ? 'fill-current' : ''} />
                    {isActive('/team/results') && <span className="text-[9px] font-bold mt-0.5">{t('results')}</span>}
                </Link>

                <Link href="/standings" className={`flex flex-col items-center justify-center w-14 h-14 rounded-2xl transition-all duration-300 ${isActive('/standings') ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400 scale-105' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-900'}`}>
                    <ListOrdered size={22} className={isActive('/standings') ? 'fill-current' : ''} />
                    {isActive('/standings') && <span className="text-[9px] font-bold mt-0.5">{t('standings')}</span>}
                </Link>
            </div>
        </div>
    );
}
