import { LoadingPage } from "@/components/loading-spinner";

export default function Loading() {
    return (
        <div className="flex items-center justify-center h-[calc(100vh-4rem)] bg-background">
            <LoadingPage />
        </div>
    );
}
