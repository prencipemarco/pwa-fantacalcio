'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { LogoutButton } from '@/components/logout-button';
import { MatchdayReminder } from '@/components/matchday-reminder';
import { SettingsDialog } from '@/components/settings-dialog';

// Inner component to use the hook
function InnerHome({ user }: { user: any }) {
    const { t } = useLanguage();

    return (
        <>
            {/* Top Left: Logout (if user exists) */}
            {user && (
                <div className="absolute top-4 left-4 z-20">
                    <LogoutButton />
                </div>
            )}

            {/* Top Right: Settings */}
            <div className="absolute top-4 right-4 z-20">
                <SettingsDialog />
            </div>

            <h1 className="text-5xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 tracking-tighter">
                FANTACALCIO
            </h1>

            {user ? (
                <>
                    <p className="text-gray-600 dark:text-gray-300 mb-6 animate-pulse">
                        {t('welcome')}, <span className="font-bold">{user.email?.split('@')[0]}</span>!
                    </p>

                    {/* Width increased to max-w-2xl */}
                    <div className="w-full max-w-2xl px-4 pointer-events-auto z-10">
                        <MatchdayReminder />
                    </div>

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
                        <Link href="/standings">
                            <Button variant="outline" size="lg" className="w-full">{t('standings')}</Button>
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
