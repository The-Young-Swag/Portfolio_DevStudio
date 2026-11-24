import { Skeleton } from "@/components/ui";

export function ProjectCardSkeleton() {
    return (
        <div className="flex h-full min-w-0 flex-col gap-3.5" role="status">
            <span className="sr-only">Loading projects...</span>

            <Skeleton className="aspect-[16/10] w-full rounded-xl border border-(--line) bg-(--glass-bg)" />

            <div className="flex min-w-0 flex-1 flex-col px-1">
                <Skeleton className="tile-title h-[52px] w-4/5" />

                <div className="mb-1 mt-auto pt-2">
                    <Skeleton className="h-[19px] w-1/2" />
                </div>
            </div>
        </div>
    );
}

export function ProjectShowcaseSkeleton() {
    return (
        <div role="status">
            <span className="sr-only">Loading projects...</span>

            <Skeleton className="mb-4 h-4 w-24" />

            <div className="flex gap-7 overflow-hidden">
                {[0, 1, 2, 3].map((item) => (
                    <div
                        key={item}
                        className="flex min-w-0 flex-col gap-3.5"
                        style={{ flex: "0 0 min(13rem, 100%)" }}
                    >
                        <Skeleton className="aspect-[16/10] w-full rounded-xl border border-(--line) bg-(--glass-bg)" />
                        <Skeleton className="h-[47px] w-4/5" />
                        <Skeleton className="h-[19px] w-1/2" />
                        <Skeleton className="h-[3px] w-8 rounded-full" />
                    </div>
                ))}
            </div>

            <div className="mt-2 min-w-0">
                <Skeleton className="h-[46px] w-2/3" />

                <div className="mb-3 mt-3 flex flex-wrap gap-3">
                    <Skeleton className="h-7 w-24 rounded-full" />
                    <Skeleton className="h-7 w-20 rounded-full" />
                    <Skeleton className="h-7 w-28 rounded-full" />
                </div>

                <div className="mt-2 space-y-2">
                    <Skeleton className="h-7 w-full" />
                    <Skeleton className="h-7 w-11/12" />
                    <Skeleton className="h-7 w-4/5" />
                </div>

                <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_19rem] lg:gap-12">
                    <div className="space-y-4">
                        {[0, 1, 2].map((feature) => (
                            <div key={feature} className="flex items-start gap-3">
                                <Skeleton className="h-5 w-5 shrink-0 rounded-full" />
                                <Skeleton className="h-6 w-full" />
                            </div>
                        ))}
                    </div>

                    <Skeleton className="h-72 w-full rounded-2xl border border-(--glass-border) bg-(--glass-bg)" />
                </div>
            </div>
        </div>
    );
}
