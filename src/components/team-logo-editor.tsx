'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TeamLogo, LogoConfig } from '@/components/team-logo';
import { updateTeamLogo } from '@/app/actions/team-settings';
import { Pencil, Upload, Save, Loader2, RefreshCcw } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'sonner';

type Props = {
    teamId: string;
    teamName: string;
    initialLogoUrl?: string | null;
    initialLogoConfig?: LogoConfig | null;
    trigger?: React.ReactNode;
};

const PRESET_COLORS = [
    '#EF4444', // Red
    '#F97316', // Orange
    '#F59E0B', // Amber
    '#84CC16', // Lime
    '#10B981', // Emerald
    '#06B6D4', // Cyan
    '#3B82F6', // Blue
    '#6366F1', // Indigo
    '#8B5CF6', // Violet
    '#EC4899', // Pink
    '#111827', // Gray
    '#000000', // Black
];

const ICONS = ['shield', 'star', 'trophy', 'ball', 'users', 'crown'];
const SHAPES = ['circle', 'square', 'shield'];

export function TeamLogoEditor({ teamId, teamName, initialLogoUrl, initialLogoConfig, trigger }: Props) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // Config State
    const [config, setConfig] = useState<LogoConfig>(initialLogoConfig || {
        shape: 'circle',
        icon: 'shield',
        color1: '#3B82F6',
        color2: '#8B5CF6'
    });

    // Upload State
    const [uploadFile, setUploadFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(initialLogoUrl ?? null);

    const [activeTab, setActiveTab] = useState<'preset' | 'upload'>(initialLogoUrl ? 'upload' : 'preset');

    const handleSave = async () => {
        setLoading(true);
        try {
            let finalLogoUrl: string | null = initialLogoUrl ?? null;
            let finalConfig = null;

            if (activeTab === 'upload') {
                if (uploadFile) {
                    const supabase = createClient();
                    const fileExt = uploadFile.name.split('.').pop();
                    const fileName = `${teamId}-${Date.now()}.${fileExt}`;
                    const { data, error } = await supabase.storage
                        .from('logos')
                        .upload(fileName, uploadFile, { upsert: true });

                    if (error) throw error;

                    const { data: { publicUrl } } = supabase.storage
                        .from('logos')
                        .getPublicUrl(fileName);

                    finalLogoUrl = publicUrl;
                }
                // If switching to upload tab but keeping existing URL, finalLogoUrl remains
            } else {
                finalLogoUrl = null; // Clear URL if using preset
                finalConfig = config;
            }

            const res = await updateTeamLogo(teamId, finalLogoUrl, finalConfig);
            if (!res.success) throw new Error(res.error);

            toast.success('Logo aggiornato con successo!');
            setOpen(false);
        } catch (err: any) {
            console.error(err);
            toast.error('Errore durante il salvataggio: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setUploadFile(file);
            const objectUrl = URL.createObjectURL(file);
            setPreviewUrl(objectUrl);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full shadow-sm">
                        <Pencil className="h-4 w-4" />
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Personalizza Logo Squadra</DialogTitle>
                </DialogHeader>

                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="preset">Editor</TabsTrigger>
                        <TabsTrigger value="upload">Upload</TabsTrigger>
                    </TabsList>

                    <div className="py-6 flex justify-center bg-slate-50 dark:bg-slate-900/50 rounded-xl my-4 border min-h-[160px] items-center">
                        <TeamLogo
                            teamName={teamName}
                            logoUrl={activeTab === 'upload' ? previewUrl : null}
                            logoConfig={activeTab === 'preset' ? config : null}
                            size={100}
                            className="shadow-2xl"
                        />
                    </div>

                    <TabsContent value="preset" className="space-y-4">
                        <div className="space-y-3">
                            <Label>Forma</Label>
                            <div className="flex gap-2">
                                {SHAPES.map(s => (
                                    <Button
                                        key={s}
                                        variant={config.shape === s ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setConfig({ ...config, shape: s as any })}
                                        className="flex-1 capitalize"
                                    >
                                        {s}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Label>Icona</Label>
                            <div className="grid grid-cols-6 gap-2">
                                {ICONS.map(icon => (
                                    <Button
                                        key={icon}
                                        variant={config.icon === icon ? "default" : "ghost"}
                                        size="icon"
                                        onClick={() => setConfig({ ...config, icon: icon as any })}
                                        className="h-10 w-10 rounded-full"
                                    >
                                        <TeamLogo
                                            teamName="icon"
                                            logoUrl={null}
                                            logoConfig={{ ...config, icon: icon as any, shape: 'circle' }}
                                            size={20}
                                        />
                                    </Button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Label>Colori</Label>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-xs text-muted-foreground mb-1 block">Primario</Label>
                                    <div className="flex flex-wrap gap-1.5">
                                        {PRESET_COLORS.map(c => (
                                            <button
                                                key={c}
                                                className={`w-6 h-6 rounded-full border border-black/10 ${config.color1 === c ? 'ring-2 ring-offset-1 ring-primary' : ''}`}
                                                style={{ backgroundColor: c }}
                                                onClick={() => setConfig({ ...config, color1: c })}
                                            />
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <Label className="text-xs text-muted-foreground mb-1 block">Secondario</Label>
                                    <div className="flex flex-wrap gap-1.5">
                                        {PRESET_COLORS.map(c => (
                                            <button
                                                key={c}
                                                className={`w-6 h-6 rounded-full border border-black/10 ${config.color2 === c ? 'ring-2 ring-offset-1 ring-primary' : ''}`}
                                                style={{ backgroundColor: c }}
                                                onClick={() => setConfig({ ...config, color2: c })}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="upload" className="space-y-4">
                        <div className="grid w-full max-w-sm items-center gap-1.5">
                            <Label htmlFor="logo">Immagine</Label>
                            <Input id="logo" type="file" accept="image/*" onChange={handleFileChange} />
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Carica un'immagine PNG o JPG. Max 2MB.
                        </p>
                    </TabsContent>
                </Tabs>

                <div className="flex justify-end gap-2 mt-4">
                    <Button variant="ghost" onClick={() => setOpen(false)}>Annulla</Button>
                    <Button onClick={handleSave} disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Salva Logo
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
