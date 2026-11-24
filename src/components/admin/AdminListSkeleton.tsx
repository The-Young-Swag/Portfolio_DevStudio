import { Skeleton } from "@/components/ui";

type AdminListSkeletonProps = {
    count?: number;
    label: string;
};

export function AdminListSkeleton({ count = 4, label }: AdminListSkeletonProps) {
    return (
        <div
            className="rounded-2xl border border-(--glass-border) bg-(--glass-bg) backdrop-blur-xl backdrop-saturate-160"
            role="status"
        >
            <span className="sr-only">Loading {label}...</span>

            <div className="divide-y divide-(--line)">
                {Array.from({ length: count }, (_, row) => (
                    <div key={row} className="flex items-center gap-3.5 px-5 py-4">
                        <div className="min-w-0 flex-1">
                            <Skeleton className="h-6 w-48" />
                            <Skeleton className="mt-0.5 h-4 w-32" />
                        </div>

                        <Skeleton className="hidden h-6 w-20 rounded-full min-[820px]:block" />
                        <Skeleton className="h-4 w-4 rounded-sm" />
                    </div>
                ))}
            </div>
        </div>
    );
}
