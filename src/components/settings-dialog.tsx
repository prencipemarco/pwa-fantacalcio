'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Settings, Moon, Sun, Globe, Shield, User } from 'lucide-react';
import Link from 'next/link';

export function SettingsDialog() {
    const { language, setLanguage, theme, setTheme, t } = useLanguage();

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
                    <Settings className="w-6 h-6 text-gray-700 dark:text-gray-200" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Settings className="w-5 h-5" />
                        {t('settings')}
                    </DialogTitle>
                </DialogHeader>

                <div className="flex flex-col gap-6 py-4">
                    {/* Theme Section */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider">{t('theme')}</h4>
                        <div className="grid grid-cols-2 gap-2">
                            <Button
                                variant={theme === 'light' ? 'default' : 'outline'}
                                onClick={() => setTheme('light')}
                                className="flex items-center gap-2 justify-center"
                            >
                                <Sun className="w-4 h-4" />
                                {t('light')}
                            </Button>
                            <Button
                                variant={theme === 'dark' ? 'default' : 'outline'}
                                onClick={() => setTheme('dark')}
                                className="flex items-center gap-2 justify-center"
                            >
                                <Moon className="w-4 h-4" />
                                {t('dark')}
                            </Button>
                        </div>
                    </div>

                    {/* Language Section */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider">{t('language')}</h4>
                        <div className="grid grid-cols-2 gap-2">
                            <Button
                                variant={language === 'it' ? 'default' : 'outline'}
                                onClick={() => setLanguage('it')}
                                className="flex items-center gap-2 justify-center"
                            >
                                <span className="text-lg">🇮🇹</span>
                                Italiano
                            </Button>
                            <Button
                                variant={language === 'en' ? 'default' : 'outline'}
                                onClick={() => setLanguage('en')}
                                className="flex items-center gap-2 justify-center"
                            >
                                <span className="text-lg">🇬🇧</span>
                                English
                            </Button>
                        </div>
                    </div>

                    {/* Admin Access */}
                    <div className="pt-4 border-t mt-2">
                        <Link href="/admin" className="w-full">
                            <Button variant="ghost" className="w-full flex items-center gap-2 text-gray-500 hover:text-red-600 justify-start px-0 hover:bg-transparent">
                                <Shield className="w-4 h-4" />
                                {t('adminAccess')}
                            </Button>
                        </Link>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
