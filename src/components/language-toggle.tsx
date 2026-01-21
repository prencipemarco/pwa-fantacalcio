'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';

export function LanguageToggle() {
    const { language, setLanguage } = useLanguage();

    return (
        <div className="flex gap-2">
            <Button
                variant={language === 'en' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setLanguage('en')}
                className="w-10 h-8 p-0"
            >
                EN
            </Button>
            <Button
                variant={language === 'it' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setLanguage('it')}
                className="w-10 h-8 p-0"
            >
                IT
            </Button>
        </div>
    );
}
