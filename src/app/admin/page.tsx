'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ResetManager } from '@/components/admin/reset-manager';
import { DevTools } from '@/components/admin/dev-tools';
import { TestNotificationButton } from '@/components/admin/test-notification-button';
import { useLanguage } from '@/contexts/LanguageContext';
import {
    Upload, Calendar, Shield, ShoppingCart, UserCog,
    FileText, Code, AlertTriangle, ArrowRight, Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';

// --- Shared Components for Admin UI ---

function AdminSectionHeader({ title, icon: Icon }: { title: string, icon?: any }) {
    return (
        <div className="flex items-center gap-3 mb-6 pb-3 border-b-2 border-border/60">
            {Icon && <Icon className="w-6 h-6 text-muted-foreground" />}
            <h2 className="text-2xl md:text-[28px] font-bold text-foreground tracking-tight">
                {title}
            </h2>
        </div>
    );
}

function AdminCard({
    title,
    description,
    icon: Icon,
    children,
    className,
    badge,
    variant = 'default'
}: {
    title: string,
    description: string,
    icon?: any,
    children: React.ReactNode,
    className?: string,
    badge?: string,
    variant?: 'default' | 'user' | 'danger'
}) {
    const baseStyles = "relative rounded-[16px] p-6 transition-all duration-200 border flex flex-col h-full";

    const variants = {
        default: "bg-card border-border shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)] hover:-translate-y-0.5",
        user: "bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/30 dark:to-zinc-900 border-blue-200 dark:border-blue-800 shadow-md",
        danger: "bg-gradient-to-br from-red-50 to-white dark:from-red-950/30 dark:to-zinc-900 border-red-200 dark:border-red-800"
    };

    return (
        <div className={cn(baseStyles, variants[variant], className)}>
            {badge && (
                <div className="absolute top-4 right-4 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                    {badge}
                </div>
            )}

            <div className="flex flex-col mb-5">
                <div className="flex items-center gap-3 mb-2">
                    {Icon && (
                        <div className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                            variant === 'user' ? "bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400" :
                                variant === 'danger' ? "bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-400" :
                                    "bg-muted text-foreground/70"
                        )}>
                            <Icon className="w-5 h-5" />
                        </div>
                    )}
                    <h3 className={cn("text-xl font-bold tracking-tight", variant === 'danger' ? "text-red-600" : "text-foreground")}>
                        {title}
                    </h3>
                </div>
                <p className="text-[14px] text-muted-foreground leading-relaxed pl-1">
                    {description}
                </p>
            </div>

            <div className="mt-auto">
                {children}
            </div>
        </div>
    );
}

// Button Styles Helper
const btnPrimary = "w-full bg-gradient-to-r from-[#4169E1] to-[#5B7FE8] hover:shadow-lg hover:shadow-blue-500/25 text-white font-bold h-[50px] rounded-[10px] transition-all active:scale-[0.98]";
const btnSecondary = "w-full bg-background border-2 border-border hover:border-[#4169E1] hover:bg-muted/30 text-foreground font-medium h-[50px] rounded-[10px] transition-all";
const btnDanger = "w-full bg-gradient-to-r from-red-600 to-red-500 hover:shadow-lg hover:shadow-red-500/25 text-white font-bold h-[50px] rounded-[10px] transition-all active:scale-[0.98]";

export default function AdminDashboard() {
    const { t } = useLanguage();

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-black dark:to-zinc-950 pb-24">
            <div className="container mx-auto px-4 py-8 md:py-12 max-w-[1400px]">

                {/* Header */}
                <div className="mb-12">
                    <h1 className="text-3xl md:text-4xl font-black text-foreground mb-2">
                        {t('adminDashboard')}
                    </h1>
                    <p className="text-muted-foreground">
                        Pannello di controllo centralizzato per la gestione della lega.
                    </p>
                </div>

                {/* SECTION 1: CORE MANAGEMENT */}
                <AdminSectionHeader title={t('coreManagement')} />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">

                    {/* Import Data */}
                    <AdminCard
                        title={t('dataImport')}
                        description={t('dataImportDesc')}
                        icon={Upload}
                    >
                        <Button asChild className={btnPrimary}>
                            <Link href="/admin/import" className="flex items-center justify-center gap-2">
                                {t('goToImports')} <ArrowRight className="w-4 h-4 ml-1 opacity-80" />
                            </Link>
                        </Button>
                    </AdminCard>

                    {/* Calendar */}
                    <AdminCard
                        title={t('matchCalendar')}
                        description={t('matchCalendarDesc')}
                        icon={Calendar}
                    >
                        <Button asChild className={btnSecondary}>
                            <Link href="/admin/calendar">
                                {t('manageCalendar')}
                            </Link>
                        </Button>
                    </AdminCard>

                    {/* Teams */}
                    <AdminCard
                        title={t('teams')}
                        description={t('teamsDesc')}
                        icon={Shield}
                    >
                        <Button asChild className={btnSecondary}>
                            <Link href="/admin/teams">
                                {t('manageTeams')}
                            </Link>
                        </Button>
                    </AdminCard>

                    {/* Market Settings */}
                    <AdminCard
                        title={t('marketSettings')}
                        description={t('marketSettingsDesc')}
                        icon={ShoppingCart}
                    >
                        <Button asChild className={btnSecondary}>
                            <Link href="/admin/settings">
                                {t('settings')}
                            </Link>
                        </Button>
                    </AdminCard>

                    {/* User Management (Highlighted) */}
                    <AdminCard
                        title={t('userManagement')}
                        description={t('userManagementDesc')}
                        icon={UserCog}
                        variant="user"
                    >
                        <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 px-3 py-2 rounded-lg text-xs font-medium mb-4 border border-blue-100 dark:border-blue-800">
                            View list of signed up users.
                        </div>
                        <Button asChild className={btnPrimary}>
                            <Link href="/admin/users" className="flex items-center justify-center gap-2">
                                {t('manageUsers')}
                                <Settings className="w-4 h-4 ml-1 opacity-70" />
                            </Link>
                        </Button>
                    </AdminCard>

                    {/* System Logs */}
                    <AdminCard
                        title={t('systemLogs')}
                        description={t('systemLogsDesc')}
                        icon={FileText}
                    >
                        <Button asChild className={btnSecondary}>
                            <Link href="/admin/logs">
                                {t('viewLogs')}
                            </Link>
                        </Button>
                    </AdminCard>
                </div>

                {/* Separator */}
                <div className="h-px w-full bg-gradient-to-r from-transparent via-border to-transparent my-10 opacity-60" />

                {/* SECTION 2: SYSTEM UTILITIES */}
                <AdminSectionHeader title={t('systemUtilities')} icon={Code} />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Dev Tools */}
                    <AdminCard
                        title={t('devTools')}
                        description={t('devToolsDesc')}
                        icon={Code}
                    >
                        <div className="space-y-4">
                            <TestNotificationButton />
                            <div className="pt-2 border-t border-dashed border-border">
                                <DevTools />
                            </div>
                        </div>
                    </AdminCard>

                    {/* Danger Zone */}
                    <AdminCard
                        title={t('dangerZone')}
                        description={t('dangerZoneDesc')}
                        icon={AlertTriangle}
                        variant="danger"
                    >
                        <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 text-red-800 dark:text-red-300 p-3 rounded-r-md text-[13px] font-medium mb-4">
                            ⚠️ Attenzione: questa azione è irreversibile
                        </div>
                        <ResetManager />
                    </AdminCard>

                </div>
            </div>
        </div>
    );
}
