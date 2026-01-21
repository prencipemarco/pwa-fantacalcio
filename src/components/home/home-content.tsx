'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LanguageProvider, useLanguage } from '@/contexts/LanguageContext';
import { LanguageToggle } from '@/components/language-toggle';

// Inner component to use the hook
function InnerHome({ user }: { user: any }) {
    const { t } = useLanguage();

    return (
        <>
            <div className="absolute top-4 right-4">
                <LanguageToggle />
            </div>

            <h1 className="text-5xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                FANTACALCIO
            </h1>

            {user ? (
                <>
                    <p className="text-gray-600 mb-8 animate-pulse">
                        {t('welcome')}, <span className="font-bold">{user.email?.split('@')[0]}</span>!
                    </p>
                    <div className="flex flex-col gap-4 w-full max-w-xs">
                        <Link href="/team/lineup">
                            <Button size="lg" className="w-full font-bold text-lg">{t('myTeam')}</Button>
                        </Link>
                        <Link href="/team/market">
                            <Button variant="secondary" size="lg" className="w-full">{t('market')}</Button>
                        </Link>
                        <Link href="/team/results">
                            <Button variant="outline" size="lg" className="w-full">{t('results')}</Button>
                        </Link>
                    </div>
                </>
            ) : (
                <div className="flex flex-col gap-4 w-full max-w-xs">
                    <p className="text-gray-500 mb-4">{t('loginToManage')}</p>
                    <Link href="/login">
                        <Button size="lg" className="w-full font-bold text-lg">{t('login')}</Button>
                    </Link>
                </div>
            )}

            <div className="flex flex-col gap-4 w-full max-w-xs mt-8 border-t pt-8">
                <Link href="/admin">
                    <Button variant="ghost" size="sm" className="text-xs text-gray-400">{t('adminAccess')}</Button>
                </Link>
            </div>

            <div className="mt-12 text-center text-gray-400 text-xs">
                <p>{t('beta')}</p>
            </div>
        </>
    );
}

export function HomeContent({ user }: { user: any }) {
    return (
        <InnerHome user={user} />
    );
}
