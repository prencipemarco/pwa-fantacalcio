import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
    className?: string;
    size?: number;
}

export function LoadingSpinner({ className, size = 24 }: LoadingSpinnerProps) {
    return (
        <Loader2
            className={cn("animate-spin text-primary", className)}
            size={size}
        />
    );
}

export function LoadingPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] w-full">
            <LoadingSpinner size={48} className="mb-4" />
            <p className="text-muted-foreground animate-pulse text-sm font-medium">
                Caricamento...
            </p>
        </div>
    );
}
