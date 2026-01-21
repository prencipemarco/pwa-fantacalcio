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
        <div className="space-y-6 p-4">
            <Skeleton className="h-8 w-48 mx-auto" />

            {[1, 2, 3].map((i) => (
                <div key={i} className="flex justify-between items-center bg-gray-100 p-4 rounded-lg">
                    <div className="flex items-center gap-2">
                        <Skeleton className="w-10 h-10 rounded-full" />
                        <Skeleton className="w-20 h-4" />
                    </div>
                    <Skeleton className="w-8 h-6" />
                    <div className="flex items-center gap-2">
                        <Skeleton className="w-20 h-4" />
                        <Skeleton className="w-10 h-10 rounded-full" />
                    </div>
                </div>
            ))}
        </div>
    )
}
