import { Skeleton } from '@/components/ui/skeleton';

/** Fallback de carga para rutas con código cargado en diferido. */
export function PageFallback() {
    return (
        <div className="mx-auto w-full max-w-5xl space-y-4 px-5 py-10">
            <Skeleton className="h-9 w-64" />
            <Skeleton className="h-4 w-96 max-w-full" />
            <div className="grid gap-4 pt-4 sm:grid-cols-2 lg:grid-cols-3">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
            </div>
        </div>
    );
}
