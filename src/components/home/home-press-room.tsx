'use client';

import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createClient } from '@/utils/supabase/client';
import { Mic, Send, Image as ImageIcon, X, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { TeamLogo } from '@/components/team-logo';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';

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
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const supabase = createClient();

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

    const handleSend = async () => {
        if ((!newMessage.trim() && !selectedImage) || !userTeamId) return;
        setLoading(true);

        let imageUrl = null;

        // Upload Image if present
        if (selectedImage) {
            setIsUploading(true);
            try {
                const fileExt = selectedImage.name.split('.').pop();
                const fileName = `press-${Date.now()}.${fileExt}`;
                const { error: uploadError } = await supabase.storage.from('app-assets').upload(fileName, selectedImage);

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
            setSelectedImage(null);
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
                    {selectedImage && (
                        <div className="flex items-center gap-2 bg-background p-2 rounded-md border text-xs">
                            <ImageIcon className="h-3 w-3 text-blue-500" />
                            <span className="truncate flex-1 max-w-[200px]">{selectedImage.name}</span>
                            <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => setSelectedImage(null)}>
                                <X className="h-3 w-3" />
                            </Button>
                        </div>
                    )}
                    <div className="flex gap-2">
                        <Input
                            placeholder={selectedImage ? "Aggiungi una didascalia..." : "Lascia una dichiarazione..."}
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
                            onChange={(e) => e.target.files?.[0] && setSelectedImage(e.target.files[0])}
                        />
                        <Button
                            variant="outline"
                            size="icon"
                            className={`h-9 w-9 shrink-0 ${selectedImage ? 'text-blue-600 border-blue-200 bg-blue-50' : ''}`}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <ImageIcon className="h-4 w-4" />
                        </Button>
                        <Button size="icon" className="h-9 w-9 shrink-0" onClick={handleSend} disabled={loading || (!newMessage.trim() && !selectedImage)}>
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        </Button>
                    </div>
                </div>
            )}
        </Card>
    );
}
