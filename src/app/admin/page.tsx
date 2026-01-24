'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ResetManager } from '@/components/admin/reset-manager';
import { DevTools } from '@/components/admin/dev-tools';
import { TestNotificationButton } from '@/components/admin/test-notification-button';
import { useLanguage } from '@/contexts/LanguageContext';

export default function AdminDashboard() {
    const { t } = useLanguage();

    return (
        <div className="container mx-auto p-8">
            <h1 className="text-4xl font-bold mb-8 text-gray-900 dark:text-white">{t('adminDashboard')}</h1>

            {/* Core Management */}
            <h2 className="text-2xl font-bold mb-4 text-gray-700 dark:text-gray-300">{t('coreManagement')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                <Card className="flex flex-col h-full bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800">
                    <CardHeader>
                        <CardTitle className="dark:text-white">{t('dataImport')}</CardTitle>
                        <CardDescription className="dark:text-gray-400">{t('dataImportDesc')}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col flex-1">
                        <div className="mt-auto w-full">
                            <Link href="/admin/import">
                                <Button className="w-full">{t('goToImports')}</Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>

                <Card className="flex flex-col h-full bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800">
                    <CardHeader>
                        <CardTitle className="dark:text-white">{t('matchCalendar')}</CardTitle>
                        <CardDescription className="dark:text-gray-400">{t('matchCalendarDesc')}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col flex-1">
                        <div className="mt-auto w-full">
                            <Link href="/admin/calendar">
                                <Button className="w-full" variant="secondary">{t('manageCalendar')}</Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>

                <Card className="flex flex-col h-full bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800">
                    <CardHeader>
                        <CardTitle className="dark:text-white">{t('teams')}</CardTitle>
                        <CardDescription className="dark:text-gray-400">{t('teamsDesc')}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col flex-1">
                        <div className="mt-auto w-full">
                            <Link href="/admin/teams">
                                <Button className="w-full" variant="outline">{t('manageTeams')}</Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>

                <Card className="flex flex-col h-full bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800">
                    <CardHeader>
                        <CardTitle className="dark:text-white">{t('marketSettings')}</CardTitle>
                        <CardDescription className="dark:text-gray-400">{t('marketSettingsDesc')}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col flex-1">
                        <div className="mt-auto w-full">
                            <Link href="/admin/settings">
                                <Button className="w-full" variant="outline">{t('settings')}</Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>

                <Card className="flex flex-col h-full border-blue-200 bg-blue-50 dark:bg-blue-950/30 dark:border-blue-900">
                    <CardHeader>
                        <CardTitle className="text-blue-700 dark:text-blue-400">{t('userManagement')}</CardTitle>
                        <CardDescription className="dark:text-gray-400">{t('userManagementDesc')}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col flex-1">
                        <div className="text-sm text-gray-500 dark:text-gray-400 mb-4 flex-1">
                            {/* Static text for now */}
                            View list of signed up users.
                        </div>
                        <div className="mt-auto w-full">
                            <Link href="/admin/users">
                                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                                    {t('manageUsers')}
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>

                <Card className="flex flex-col h-full bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800">
                    <CardHeader>
                        <CardTitle className="dark:text-white">{t('systemLogs')}</CardTitle>
                        <CardDescription className="dark:text-gray-400">{t('systemLogsDesc')}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col flex-1">
                        <div className="mt-auto w-full">
                            <Link href="/admin/logs">
                                <Button className="w-full" variant="outline">{t('viewLogs')}</Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* System Utilities */}
            <h2 className="text-2xl font-bold mb-4 mt-12 text-gray-700 dark:text-gray-300">{t('systemUtilities')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="flex flex-col h-full border-indigo-200 bg-indigo-50 dark:bg-indigo-950/30 dark:border-indigo-900">
                    <CardHeader>
                        <CardTitle className="text-indigo-700 dark:text-indigo-400">{t('devTools')}</CardTitle>
                        <CardDescription className="dark:text-gray-400">{t('devToolsDesc')}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col flex-1 gap-4">
                        <TestNotificationButton />
                        <div className="mt-auto w-full">
                            <DevTools />
                        </div>
                    </CardContent>
                </Card>

                <Card className="flex flex-col h-full border-red-200 bg-red-50 dark:bg-red-950/30 dark:border-red-900">
                    <CardHeader>
                        <CardTitle className="text-red-600 dark:text-red-400">{t('dangerZone')}</CardTitle>
                        <CardDescription className="dark:text-gray-400">{t('dangerZoneDesc')}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col flex-1">
                        <div className="mt-auto w-full">
                            <ResetManager />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
