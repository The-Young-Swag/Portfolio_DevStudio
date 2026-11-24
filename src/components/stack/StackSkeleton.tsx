import { Skeleton } from "@/components/ui";

const TEASER_WIDTHS = ["w-14", "w-20", "w-16", "w-24", "w-12", "w-20", "w-16"];
const CATEGORY_COUNTS = [6, 4, 2, 4, 5];

export function StackPillsSkeleton() {
    return (
        <div className="flex flex-wrap gap-2" role="status">
            <span className="sr-only">Loading stack...</span>

            {TEASER_WIDTHS.map((width) => (
                <Skeleton
                    key={width}
                    className={`h-[27px] rounded-md border border-(--glass-border) bg-(--glass-bg) ${width}`}
                />
            ))}
        </div>
    );
}

export function StackCategoriesSkeleton() {
    return (
        <div role="status">
            <span className="sr-only">Loading stack...</span>

            <div className="mt-4 flex items-center gap-1.5">
                <Skeleton className="h-3 w-3 rounded-sm" />
                <Skeleton className="h-4 w-12" />
            </div>

            {CATEGORY_COUNTS.map((count, section) => (
                <div key={section} className="mt-8">
                    <Skeleton className="h-4 w-28" />

                    <div className="mt-3 flex flex-wrap gap-2">
                        {Array.from({ length: count }, (_, pill) => (
                            <Skeleton
                                key={pill}
                                className="h-[34px] w-24 rounded-full border border-(--glass-border) bg-(--glass-bg)"
                            />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
