import { Skeleton } from "@/components/ui";

export function CertificationCardSkeleton() {
    return (
        <div className="flex h-full min-w-0 flex-col" role="status">
            <span className="sr-only">Loading certifications...</span>

            <Skeleton className="aspect-[4/3] w-full rounded-xl border border-(--line) bg-(--glass-bg)" />

            <div className="flex min-w-0 flex-1 flex-col px-1 pt-3.5">
                <Skeleton className="tile-title h-[47px] w-4/5" />

                <div className="mb-1 mt-auto pt-2">
                    <Skeleton className="h-[19px] w-1/2" />
                </div>
            </div>
        </div>
    );
}

export function CertificationShowcaseSkeleton() {
    return (
        <div role="status">
            <span className="sr-only">Loading certifications...</span>

            <Skeleton className="mb-4 h-4 w-32" />

            <div className="flex gap-7 overflow-hidden">
                {[0, 1, 2].map((item) => (
                    <div
                        key={item}
                        className="flex min-w-0 flex-col gap-3.5"
                        style={{ flex: "0 0 min(13rem, 100%)" }}
                    >
                        <Skeleton className="aspect-[4/3] w-full rounded-xl border border-(--line) bg-(--glass-bg)" />
                        <Skeleton className="h-[47px] w-4/5" />
                        <Skeleton className="h-[19px] w-1/2" />
                        <Skeleton className="h-[3px] w-8 rounded-full" />
                    </div>
                ))}
            </div>

            <div className="mt-2 min-w-0">
                <Skeleton className="aspect-[4/3] w-full rounded-xl border border-(--line) bg-(--glass-bg)" />

                <div className="mt-6 space-y-3">
                    <Skeleton className="h-[37px] w-2/3" />
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-11/12" />
                </div>
            </div>
        </div>
    );
}
