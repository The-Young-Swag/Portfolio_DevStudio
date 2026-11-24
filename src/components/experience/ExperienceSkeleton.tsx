import { Skeleton } from "@/components/ui";

const BULLET_COUNTS = [3, 2, 2];

export function ExperienceListSkeleton() {
    return (
        <div
            className="relative space-y-8 pl-6 sm:space-y-10"
            role="status"
        >
            <span className="sr-only">Loading experience...</span>

            <span
                aria-hidden="true"
                className="absolute bottom-1 left-[3px] top-1 w-px bg-(--line)"
            />

            {BULLET_COUNTS.map((bullets, entry) => (
                <div key={entry} className="relative">
                    <span
                        aria-hidden="true"
                        className="absolute -left-[25.5px] top-[3px] h-2.5 w-2.5 rounded-full border-2 border-(--accent-strong) bg-(--paper)"
                    />

                    <Skeleton className="mb-1 h-4 w-24" />
                    <Skeleton className="h-[23px] w-48" />
                    <Skeleton className="mt-0.5 h-[17px] w-32" />

                    <div className="ml-4 mt-2.5 space-y-1.5">
                        {Array.from({ length: bullets }, (_, bullet) => (
                            <Skeleton key={bullet} className="h-[21px] w-full" />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
