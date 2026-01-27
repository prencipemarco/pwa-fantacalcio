'use client';
import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Settings, Moon, Sun, Shield, User, Mail, Lock, LogOut } from 'lucide-react';
import Link from 'next/link';
import { PushNotificationManager } from '@/components/push-notification-manager';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

export function SettingsDialog() {
    const { language, setLanguage, theme, setTheme, t } = useLanguage();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    const handleUpdateProfile = async () => {
        if (!email && !password) return;
        setLoading(true);

        const updates: any = {};
        if (email) updates.email = email;
        if (password) updates.password = password;

        const { error } = await supabase.auth.updateUser(updates);

        if (error) {
            alert('Error: ' + error.message);
        } else {
            alert('Profile updated! If you changed your email, please verify the new address. You will now be logged out.');
            await supabase.auth.signOut();
            window.location.href = '/login';
        }
        setLoading(false);
    };

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
                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('theme')}</h4>
                        <div className="flex bg-gray-100 dark:bg-zinc-800 p-1 rounded-lg">
                            <button
                                onClick={() => setTheme('light')}
                                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all ${theme === 'light'
                                    ? 'bg-white text-gray-900 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-200'
                                    }`}
                            >
                                <Sun className="w-4 h-4" />
                                {t('light')}
                            </button>
                            <button
                                onClick={() => setTheme('dark')}
                                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all ${theme === 'dark'
                                    ? 'bg-slate-700 text-white shadow-sm'
                                    : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-200'
                                    }`}
                            >
                                <Moon className="w-4 h-4" />
                                {t('dark')}
                            </button>
                        </div>
                    </div>

                    {/* Notifications Section */}
                    <div className="space-y-3">
                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Notifications</h4>
                        <div className="flex items-center justify-between bg-gray-50 dark:bg-zinc-800/50 p-4 rounded-xl border border-gray-100 dark:border-zinc-800">
                            <div className="flex flex-col">
                                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{t('enablePush') || 'Enable Push Notifications'}</span>
                                <span className="text-[10px] text-gray-500">Receive alerts for auctions and trades.</span>
                            </div>
                            <PushNotificationManager />
                        </div>
                    </div>

                    {/* Account Section */}
                    <div className="space-y-3">
                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Account</h4>
                        <div className="bg-gray-50 dark:bg-zinc-800/50 p-4 rounded-xl border border-gray-100 dark:border-zinc-800 space-y-3">
                            <div className="space-y-1">
                                <label className="text-xs text-muted-foreground ml-1">Update Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="New Email Address"
                                        className="pl-9 h-9 bg-background"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs text-muted-foreground ml-1">Update Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        type="password"
                                        placeholder="New Password"
                                        className="pl-9 h-9 bg-background"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                            </div>
                            <Button
                                onClick={handleUpdateProfile}
                                disabled={(!email && !password) || loading}
                                size="sm"
                                className="w-full"
                            >
                                {loading ? 'Updating...' : 'Update & Logout'}
                            </Button>
                        </div>
                    </div>

                    {/* Language Section */}
                    <div className="space-y-3">
                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('language')}</h4>
                        <div className="flex bg-gray-100 dark:bg-zinc-800 p-1 rounded-lg">
                            <button
                                onClick={() => setLanguage('it')}
                                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all ${language === 'it'
                                    ? 'bg-white text-gray-900 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-200'
                                    }`}
                            >
                                <span className="text-lg leading-none">🇮🇹</span>
                                Italiano
                            </button>
                            <button
                                onClick={() => setLanguage('en')}
                                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all ${language === 'en'
                                    ? 'bg-white text-gray-900 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-200'
                                    }`}
                            >
                                <span className="text-lg leading-none">🇬🇧</span>
                                English
                            </button>
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
