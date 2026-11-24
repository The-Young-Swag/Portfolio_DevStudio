import { Skeleton } from "@/components/ui";

export function GitHubActivitySkeleton() {
    return (
        <div className="mt-8" role="status">
            <span className="sr-only">Loading GitHub activity...</span>

            <div className="flex flex-wrap items-center gap-2">
                {["w-32", "w-16", "w-16"].map((width) => (
                    <Skeleton
                        key={width}
                        className={`h-[30px] rounded-full border border-(--glass-border) bg-(--glass-bg) ${width}`}
                    />
                ))}
            </div>

            <div className="mt-6 overflow-hidden rounded-[26px] glass p-7 sm:p-9">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <Skeleton className="h-6 w-40" />

                    <div className="flex items-center gap-2">
                        <Skeleton className="h-3 w-8" />

                        {[0, 1, 2, 3, 4].map((step) => (
                            <Skeleton
                                key={step}
                                className="h-2.75 w-2.75 shrink-0 rounded-[3px]"
                            />
                        ))}

                        <Skeleton className="h-3 w-8" />
                    </div>
                </div>

                <div className="mt-8 overflow-hidden rounded-xl">
                    <Skeleton className="h-[95px] w-full rounded-xl bg-(--glass-bg)" />
                </div>

                <div className="mt-8 space-y-3 border-t hairline pt-6">
                    <Skeleton className="h-4 w-64" />
                    <Skeleton className="h-4 w-56" />
                </div>
            </div>
        </div>
    );
}
