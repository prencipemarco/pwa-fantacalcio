'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { updateSetting } from '@/app/actions/market';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export default function AdminSettingsPage() {
    const [settings, setSettings] = useState<any>({});
    const [loading, setLoading] = useState(false);
    const supabase = createClient();

    useEffect(() => {
        supabase.from('settings').select('*').then(({ data }) => {
            const temp: any = {};
            data?.forEach(s => temp[s.key] = s.value);
            setSettings(temp);
        });
    }, []);

    const handleChange = (key: string, value: string) => {
        setSettings({ ...settings, [key]: value });
    };

    const handleSave = async (key: string) => {
        setLoading(true);
        await updateSetting(key, settings[key]);
        setLoading(false);
        alert('Saved!');
    };

    return (
        <div className="container mx-auto p-4 md:p-8">
            <h1 className="text-3xl font-bold mb-6">Market Settings</h1>

            <Card>
                <CardHeader>
                    <CardTitle>Auction Rules</CardTitle>
                    <CardDescription>Configure timings and constraints.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Auction Duration (Hours)</Label>
                            <div className="flex gap-2">
                                <Input
                                    value={settings.auction_duration_hours || ''}
                                    onChange={(e) => handleChange('auction_duration_hours', e.target.value)}
                                />
                                <Button size="sm" onClick={() => handleSave('auction_duration_hours')} disabled={loading}>Save</Button>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Snippet Threshold (Seconds)</Label>
                            <div className="flex gap-2">
                                <Input
                                    value={settings.snippet_threshold_seconds || ''}
                                    onChange={(e) => handleChange('snippet_threshold_seconds', e.target.value)}
                                />
                                <Button size="sm" onClick={() => handleSave('snippet_threshold_seconds')} disabled={loading}>Save</Button>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Snippet Extension (Minutes)</Label>
                            <div className="flex gap-2">
                                <Input
                                    value={settings.snippet_extension_minutes || ''}
                                    onChange={(e) => handleChange('snippet_extension_minutes', e.target.value)}
                                />
                                <Button size="sm" onClick={() => handleSave('snippet_extension_minutes')} disabled={loading}>Save</Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="mt-6">
                <CardHeader>
                    <CardTitle>Market Hours</CardTitle>
                    <CardDescription>Allowed window for creating auctions.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Open Hour (0-23)</Label>
                            <div className="flex gap-2">
                                <Input
                                    value={settings.market_open_hour || ''}
                                    onChange={(e) => handleChange('market_open_hour', e.target.value)}
                                />
                                <Button size="sm" onClick={() => handleSave('market_open_hour')} disabled={loading}>Save</Button>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Close Hour (0-23)</Label>
                            <div className="flex gap-2">
                                <Input
                                    value={settings.market_close_hour || ''}
                                    onChange={(e) => handleChange('market_close_hour', e.target.value)}
                                />
                                <Button size="sm" onClick={() => handleSave('market_close_hour')} disabled={loading}>Save</Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
