'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, ShoppingCart, Trophy } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export function BottomNav() {
    const pathname = usePathname();
    const { t } = useLanguage();

    // Hide on login/admin pages if desired, or keep global
    if (pathname.startsWith('/admin')) return null;

    const isActive = (path: string) => pathname === path;

    return (
        <div className="fixed bottom-0 left-0 right-0 border-t bg-white shadow-[0_-1px_3px_rgba(0,0,0,0.1)] z-50 pb-safe">
            <div className="flex justify-around items-center h-16">
                <Link href="/" className={`flex flex-col items-center p-2 ${isActive('/') ? 'text-blue-600' : 'text-gray-500'}`}>
                    <Home size={24} />
                    <span className="text-[10px] mt-1">Home</span>
                </Link>

                <Link href="/team/lineup" className={`flex flex-col items-center p-2 ${isActive('/team/lineup') ? 'text-blue-600' : 'text-gray-500'}`}>
                    <Users size={24} />
                    <span className="text-[10px] mt-1">{t('myTeam')}</span>
                </Link>

                <Link href="/team/market" className={`flex flex-col items-center p-2 ${isActive('/team/market') ? 'text-blue-600' : 'text-gray-500'}`}>
                    <ShoppingCart size={24} />
                    <span className="text-[10px] mt-1">{t('market')}</span>
                </Link>

                <Link href="/team/results" className={`flex flex-col items-center p-2 ${isActive('/team/results') ? 'text-blue-600' : 'text-gray-500'}`}>
                    <Trophy size={24} />
                    <span className="text-[10px] mt-1">{t('results')}</span>
                </Link>
            </div>
        </div>
    );
}
