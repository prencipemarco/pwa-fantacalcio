'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createClient } from '@/utils/supabase/client';
import { Mic, Send, Image as ImageIcon, X, ChevronLeft, ChevronRight, Loader2, ZoomIn, ZoomOut, Check } from 'lucide-react';
import { TeamLogo } from '@/components/team-logo';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import Cropper from 'react-easy-crop';
import getCroppedImg from '@/utils/canvasUtils';
import { Slider } from '@/components/ui/slider';

interface PressStatement {
    id: string;
    content: string;
    image_url?: string;
    created_at: string;
    teams: {
        name: string;
        logo_url: string;
        logo_config: any;
    };
}

export function HomePressRoom({ userTeamId }: { userTeamId?: string }) {
    const [statements, setStatements] = useState<PressStatement[]>([]);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const supabase = createClient();

    // -- Cropping State --
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
    const [showCropper, setShowCropper] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | Blob | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    // Fetch messages (Active < 2h)
    const fetchStatements = async () => {
        const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();

        const { data } = await supabase
            .from('press_statements')
            .select(`
                id,
                content,
                image_url,
                created_at,
                teams (name, logo_url, logo_config)
            `)
            .gt('created_at', twoHoursAgo)
            .order('created_at', { ascending: false });

        if (data) {
            setStatements(data as any);
            if (currentIdx >= data.length) setCurrentIdx(0);
        }
    };

    useEffect(() => {
        fetchStatements();
        const interval = setInterval(fetchStatements, 30000); // Poll every 30s

        const channel = supabase
            .channel('public:press_statements')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'press_statements' }, () => fetchStatements())
            .subscribe();

        return () => {
            clearInterval(interval);
            supabase.removeChannel(channel);
        };
    }, []);

    // 1. Handle File Selection -> Open Cropper
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.addEventListener('load', () => {
                setImageSrc(reader.result?.toString() || null);
                setShowCropper(true);
            });
            reader.readAsDataURL(file);
            // Reset input so same file can be selected again
            e.target.value = '';
        }
    };

    const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    // 2. Save Cropped Image -> Set as Selected File
    const handleCropSave = async () => {
        if (!imageSrc || !croppedAreaPixels) return;
        try {
            const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
            if (!croppedBlob) throw new Error('Failed to crop image');

            setSelectedFile(croppedBlob);
            setPreviewUrl(URL.createObjectURL(croppedBlob));
            setShowCropper(false);
            setImageSrc(null); // Cleanup source
        } catch (e) {
            console.error(e);
        }
    };

    const clearSelection = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
    };

    // 3. Send Message (Upload Cropped Blob + Insert Text)
    const handleSend = async () => {
        if ((!newMessage.trim() && !selectedFile) || !userTeamId) return;
        setLoading(true);

        let imageUrl = null;

        // Upload Image if present
        if (selectedFile) {
            setIsUploading(true);
            try {
                const fileExt = 'jpg'; // getCroppedImg output
                const fileName = `press-${Date.now()}.${fileExt}`;
                const { error: uploadError } = await supabase.storage.from('app-assets').upload(fileName, selectedFile, { contentType: 'image/jpeg' });

                if (!uploadError) {
                    const { data } = supabase.storage.from('app-assets').getPublicUrl(fileName);
                    imageUrl = data.publicUrl;
                }
            } catch (e) {
                console.error("Image upload failed", e);
            }
            setIsUploading(false);
        }

        const { error } = await supabase.from('press_statements').insert({
            team_id: userTeamId,
            content: newMessage.trim(),
            image_url: imageUrl
        });

        if (!error) {
            setNewMessage('');
            clearSelection();
            fetchStatements();
        }
        setLoading(false);
    };

    // Swipe Logic
    const nextMsg = () => setCurrentIdx((prev) => (prev + 1) % statements.length);
    const prevMsg = () => setCurrentIdx((prev) => (prev - 1 + statements.length) % statements.length);

    const onDragEnd = (event: any, info: any) => {
        if (info.offset.x < -50) nextMsg(); // Swipe Left -> Next
        else if (info.offset.x > 50) prevMsg(); // Swipe Right -> Prev
    };

    const currentStatement = statements[currentIdx];

    return (
        <>
            <Card className="border-red-500/20 shadow-sm overflow-hidden flex flex-col relative w-full">
                <div className="bg-red-50 dark:bg-red-900/10 border-b border-red-100 dark:border-red-900/20 p-2 px-3 flex items-center justify-between gap-2 h-10">
                    <div className="flex items-center gap-2">
                        <div className="bg-red-100 dark:bg-red-900/40 p-1 rounded-full">
                            <Mic className="h-3 w-3 text-red-600 dark:text-red-400" />
                        </div>
                        <h3 className="font-bold text-xs text-red-900 dark:text-red-200 uppercase tracking-widest">Sala Stampa</h3>
                    </div>
                    {statements.length > 0 && (
                        <div className="text-[10px] text-muted-foreground font-mono">
                            {currentIdx + 1}/{statements.length}
                        </div>
                    )}
                </div>

                <div className="relative min-h-[140px] flex items-center justify-center bg-card overflow-hidden">
                    <AnimatePresence mode="popLayout" initial={false}>
                        {statements.length > 0 && currentStatement ? (
                            <motion.div
                                key={currentStatement.id}
                                initial={{ opacity: 0, x: 100 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -100 }}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                drag="x"
                                dragConstraints={{ left: 0, right: 0 }}
                                dragElastic={0.2}
                                onDragEnd={onDragEnd}
                                className="absolute inset-0 p-4 flex flex-col gap-3 w-full h-full cursor-grab active:cursor-grabbing"
                                onPointerDown={(e) => e.stopPropagation()}
                                onTouchStart={(e) => e.stopPropagation()}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="shrink-0">
                                        <TeamLogo
                                            teamName={currentStatement.teams.name}
                                            logoUrl={currentStatement.teams.logo_url}
                                            logoConfig={currentStatement.teams.logo_config}
                                            size={40}
                                        />
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <span className="font-bold text-sm leading-tight">{currentStatement.teams.name}</span>
                                        <span className="text-[10px] text-muted-foreground">
                                            {formatDistanceToNow(new Date(currentStatement.created_at), { addSuffix: true, locale: it })}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto pr-1">
                                    {currentStatement.image_url && (
                                        <div className="mb-2 rounded-lg overflow-hidden border border-border/50 max-h-[200px] flex justify-start">
                                            <img src={currentStatement.image_url} alt="Allegato" className="object-cover h-full w-auto max-w-full" />
                                        </div>
                                    )}
                                    {currentStatement.content && (
                                        <p className="text-sm italic text-foreground/90 leading-relaxed">
                                            "{currentStatement.content}"
                                        </p>
                                    )}
                                </div>
                            </motion.div>
                        ) : (
                            <div className="flex flex-col items-center gap-2 text-muted-foreground p-6 text-center">
                                <Mic className="h-8 w-8 opacity-20" />
                                <p className="text-xs italic">Nessuna dichiarazione nelle ultime 2 ore.</p>
                            </div>
                        )}
                    </AnimatePresence>

                    {/* Navigation Arrows for Desktop */}
                    {statements.length > 1 && (
                        <>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute left-1 bottom-1 h-6 w-6 rounded-full bg-background/50 hover:bg-background/80 backdrop-blur-sm z-10 md:flex hidden"
                                onClick={prevMsg}
                            >
                                <ChevronLeft className="h-3 w-3" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute right-1 bottom-1 h-6 w-6 rounded-full bg-background/50 hover:bg-background/80 backdrop-blur-sm z-10 md:flex hidden"
                                onClick={nextMsg}
                            >
                                <ChevronRight className="h-3 w-3" />
                            </Button>
                        </>
                    )}
                </div>

                {userTeamId && (
                    <div className="p-2 border-t bg-muted/20 flex flex-col gap-2">
                        {previewUrl && (
                            <div className="flex items-center gap-2 bg-background p-2 rounded-md border text-xs">
                                <ImageIcon className="h-3 w-3 text-blue-500" />
                                <span className="truncate flex-1 max-w-[200px]">Immagine ritagliata</span>
                                <Button variant="ghost" size="icon" className="h-5 w-5" onClick={clearSelection}>
                                    <X className="h-3 w-3" />
                                </Button>
                            </div>
                        )}
                        <div className="flex gap-2">
                            <Input
                                placeholder={previewUrl ? "Aggiungi una didascalia..." : "Lascia una dichiarazione..."}
                                className="h-9 text-xs bg-background"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            />
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleFileChange}
                            />
                            <Button
                                variant="outline"
                                size="icon"
                                className={`h-9 w-9 shrink-0 ${previewUrl ? 'text-blue-600 border-blue-200 bg-blue-50' : ''}`}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <ImageIcon className="h-4 w-4" />
                            </Button>
                            <Button size="icon" className="h-9 w-9 shrink-0" onClick={handleSend} disabled={loading || (!newMessage.trim() && !selectedFile)}>
                                {loading && isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                            </Button>
                        </div>
                    </div>
                )}
            </Card>

            {/* Cropper Dialog */}
            <Dialog open={showCropper} onOpenChange={setShowCropper}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Ritaglia Immagine</DialogTitle>
                    </DialogHeader>
                    {imageSrc && (
                        <div className="flex flex-col h-[400px]">
                            <div className="relative flex-1 w-full bg-black rounded-lg overflow-hidden mb-4">
                                <Cropper
                                    image={imageSrc}
                                    crop={crop}
                                    zoom={zoom}
                                    aspect={16 / 9} // Estensione per immagini news, non quadrata
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
                                <Button variant="ghost" onClick={() => { setShowCropper(false); setImageSrc(null); }}>
                                    <X className="mr-2 h-4 w-4" /> Annulla
                                </Button>
                                <Button onClick={handleCropSave}>
                                    <Check className="mr-2 h-4 w-4" /> Conferma
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
