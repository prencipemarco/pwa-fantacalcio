import { LoadingPage } from "@/components/loading-spinner";

export default function Loading() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-background">
            <LoadingPage />
        </div>
    );
}
