'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';

export function LanguageToggle() {
    const { language, setLanguage } = useLanguage();

    return (
        <div className="flex items-center gap-2 bg-gray-100 rounded-full p-1 border">
            <Button
                variant="ghost"
                size="sm"
                onClick={() => setLanguage('en')}
                className={`rounded-full transition-all duration-300 ${language === 'en' ? 'bg-white shadow-sm scale-110' : 'opacity-50 grayscale'}`}
            >
                <span className="text-xl">🇬🇧</span>
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => setLanguage('it')}
                className={`rounded-full transition-all duration-300 ${language === 'it' ? 'bg-white shadow-sm scale-110' : 'opacity-50 grayscale'}`}
            >
                <span className="text-xl">🇮🇹</span>
            </Button>
        </div>
    );
}
