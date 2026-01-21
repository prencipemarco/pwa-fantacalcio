import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ResetManager } from '@/components/admin/reset-manager';
import { DevTools } from '@/components/admin/dev-tools';
import { useLanguage } from '@/contexts/LanguageContext';

export default function AdminDashboard() {
    const { t } = useLanguage();

    return (
        <div className="container mx-auto p-8">
            <h1 className="text-4xl font-bold mb-8">{t('adminDashboard')}</h1>

            {/* Core Management */}
            <h2 className="text-2xl font-bold mb-4 text-gray-700">{t('coreManagement')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                <Card className="flex flex-col h-full">
                    <CardHeader>
                        <CardTitle>{t('dataImport')}</CardTitle>
                        <CardDescription>{t('dataImportDesc')}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col flex-1">
                        <div className="mt-auto w-full">
                            <Link href="/admin/import">
                                <Button className="w-full">{t('goToImports')}</Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>

                <Card className="flex flex-col h-full">
                    <CardHeader>
                        <CardTitle>{t('matchCalendar')}</CardTitle>
                        <CardDescription>{t('matchCalendarDesc')}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col flex-1">
                        <div className="mt-auto w-full">
                            <Link href="/admin/calendar">
                                <Button className="w-full" variant="secondary">{t('manageCalendar')}</Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>

                <Card className="flex flex-col h-full">
                    <CardHeader>
                        <CardTitle>{t('teams')}</CardTitle>
                        <CardDescription>{t('teamsDesc')}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col flex-1">
                        <div className="mt-auto w-full">
                            <Link href="/admin/teams">
                                <Button className="w-full" variant="outline">{t('manageTeams')}</Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>

                <Card className="flex flex-col h-full">
                    <CardHeader>
                        <CardTitle>{t('marketSettings')}</CardTitle>
                        <CardDescription>{t('marketSettingsDesc')}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col flex-1">
                        <div className="mt-auto w-full">
                            <Link href="/admin/settings">
                                <Button className="w-full" variant="outline">{t('settings')}</Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>

                <Card className="flex flex-col h-full border-blue-200 bg-blue-50">
                    <CardHeader>
                        <CardTitle className="text-blue-700">{t('userManagement')}</CardTitle>
                        <CardDescription>{t('userManagementDesc')}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col flex-1">
                        <div className="text-sm text-gray-500 mb-4 flex-1">
                            {/* Static text for now */}
                            View list of signed up users.
                        </div>
                        <div className="mt-auto w-full">
                            <Link href="/admin/users">
                                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                                    {t('manageUsers')}
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>

                <Card className="flex flex-col h-full">
                    <CardHeader>
                        <CardTitle>{t('systemLogs')}</CardTitle>
                        <CardDescription>{t('systemLogsDesc')}</CardDescription>
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
            <h2 className="text-2xl font-bold mb-4 mt-12 text-gray-700">{t('systemUtilities')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="flex flex-col h-full border-indigo-200 bg-indigo-50">
                    <CardHeader>
                        <CardTitle className="text-indigo-700">{t('devTools')}</CardTitle>
                        <CardDescription>{t('devToolsDesc')}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col flex-1">
                        <div className="mt-auto w-full">
                            <DevTools />
                        </div>
                    </CardContent>
                </Card>

                <Card className="flex flex-col h-full border-red-200 bg-red-50">
                    <CardHeader>
                        <CardTitle className="text-red-600">{t('dangerZone')}</CardTitle>
                        <CardDescription>{t('dangerZoneDesc')}</CardDescription>
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
