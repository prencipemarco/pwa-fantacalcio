'use client';

import { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TeamLogo, LogoConfig } from '@/components/team-logo';
import { updateTeamLogo, uploadLogoFile } from '@/app/actions/team-settings';
import { Pencil, Loader2, ZoomIn, ZoomOut, Check, X } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'sonner';
import Cropper from 'react-easy-crop';
import getCroppedImg from '@/utils/canvasUtils';
import { Slider } from '@/components/ui/slider';

type Props = {
    teamId: string;
    teamName: string;
    initialLogoUrl?: string | null;
    initialLogoConfig?: LogoConfig | null;
    trigger?: React.ReactNode;
};

const PRESET_COLORS = [
    '#EF4444', '#F97316', '#F59E0B', '#84CC16', '#10B981', '#06B6D4',
    '#3B82F6', '#6366F1', '#8B5CF6', '#EC4899', '#111827', '#000000',
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

    const [activeTab, setActiveTab] = useState<'preset' | 'upload'>(initialLogoUrl ? 'upload' : 'preset');

    // -- Upload & Crop State --
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
    const [showCropper, setShowCropper] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(initialLogoUrl ?? null);

    const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.addEventListener('load', () => {
                setImageSrc(reader.result?.toString() || null);
                setShowCropper(true);
            });
            reader.readAsDataURL(file);
            // Clear input so same file can be selected again if needed
            e.target.value = '';
        }
    };

    const handleCropSave = async () => {
        if (!imageSrc || !croppedAreaPixels) return;
        try {
            setLoading(true);
            const croppedImageBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
            if (!croppedImageBlob) throw new Error('Failed to crop image');

            // Create a preview URL for the UI
            const objectUrl = URL.createObjectURL(croppedImageBlob);
            setPreviewUrl(objectUrl);
            setShowCropper(false);

            // We store the blob in state to upload it later when "Save Logo" is clicked, 
            // OR we could upload it right now. 
            // Let's store it in a temp variable for the final save, 
            // but for simplicity, let's just keep the blob in a ref or state if needed.
            // Actually, to keep it simple: we can regenerate the blob on save OR store it.
            // Let's store the blob in a state variable `uploadBlob`
            setUploadBlob(croppedImageBlob as Blob);

        } catch (e) {
            console.error(e);
            toast.error('Error cropping image');
        } finally {
            setLoading(false);
        }
    };

    const [uploadBlob, setUploadBlob] = useState<Blob | null>(null);

    const handleSave = async () => {
        setLoading(true);
        try {
            let finalLogoUrl: string | null = initialLogoUrl ?? null;
            let finalConfig = null;

            if (activeTab === 'upload') {
                if (uploadBlob) {
                    const formData = new FormData();
                    formData.append('file', uploadBlob);

                    const uploadRes = await uploadLogoFile(teamId, formData);
                    if (!uploadRes.success) throw new Error(uploadRes.error);

                    finalLogoUrl = uploadRes.url || null;
                }
                // If switching to upload tab but keeping existing URL (and no new upload), finalLogoUrl remains
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

    const closeCropper = () => {
        setShowCropper(false);
        setImageSrc(null);
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

                {showCropper && imageSrc ? (
                    <div className="flex flex-col h-[400px]">
                        <div className="relative flex-1 w-full bg-black rounded-lg overflow-hidden mb-4">
                            <Cropper
                                image={imageSrc}
                                crop={crop}
                                zoom={zoom}
                                aspect={1}
                                onCropChange={setCrop}
                                onCropComplete={onCropComplete}
                                onZoomChange={setZoom}
                            />
                        </div>
                        <div className="flex items-center gap-4 mb-4 px-2">
                            <ZoomOut className="h-4 w-4 text-muted-foreground" />
                            <Slider
                                value={[zoom]}
                                min={1}
                                max={3}
                                step={0.1}
                                onValueChange={(v) => setZoom(v[0])}
                                className="flex-1"
                            />
                            <ZoomIn className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button variant="ghost" onClick={closeCropper}>
                                <X className="mr-2 h-4 w-4" /> Annulla
                            </Button>
                            <Button onClick={handleCropSave} disabled={loading}>
                                <Check className="mr-2 h-4 w-4" /> Conferma Ritaglio
                            </Button>
                        </div>
                    </div>
                ) : (
                    <>
                        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="preset">Editor</TabsTrigger>
                                <TabsTrigger value="upload">Upload</TabsTrigger>
                            </TabsList>

                            <div className="py-6 flex justify-center bg-slate-50 dark:bg-slate-900/50 rounded-xl my-4 border min-h-[160px] items-center transition-colors">
                                <TeamLogo
                                    teamName={teamName}
                                    logoUrl={activeTab === 'upload' ? previewUrl : null}
                                    logoConfig={activeTab === 'preset' ? config : null}
                                    size={100}
                                    className="shadow-2xl"
                                />
                            </div>

                            <TabsContent value="preset" className="space-y-4">
                                {/* Shape Selection */}
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
                                {/* Icon Selection */}
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
                                {/* Color Selection */}
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
                                    Seleziona un'immagine per ritagliarla e caricarla come logo.
                                </p>
                                {uploadBlob && (
                                    <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-2 rounded border border-green-100">
                                        <Check className="h-4 w-4" /> Immagine pronta per il salvataggio
                                    </div>
                                )}
                            </TabsContent>
                        </Tabs>

                        <div className="flex justify-end gap-2 mt-4">
                            <Button variant="ghost" onClick={() => setOpen(false)}>Annulla</Button>
                            <Button onClick={handleSave} disabled={loading}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Salva Logo
                            </Button>
                        </div>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
