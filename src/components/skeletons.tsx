import { Skeleton } from "@/components/ui/skeleton"

export function MarketSkeleton() {
    return (
        <div className="space-y-4 p-4">
            <div className="grid grid-cols-2 gap-4 h-32">
                <Skeleton className="h-full w-full rounded-xl" />
                <Skeleton className="h-full w-full rounded-xl" />
            </div>
            <Skeleton className="h-10 w-full" />
            <div className="space-y-2">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
            </div>
        </div>
    )
}

export function ResultsSkeleton() {
    return (
        <div className="container mx-auto max-w-[600px] pt-24 pb-24 px-4 space-y-4">
            <div className="flex justify-center mb-8"><Skeleton className="h-8 w-48 rounded" /></div>
            {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-28 w-full rounded-2xl" />
            ))}
        </div>
    )
}
