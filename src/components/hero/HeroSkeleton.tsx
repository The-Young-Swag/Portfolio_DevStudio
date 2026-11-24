import { Skeleton } from "@/components/ui";

export function HeroInfoSkeleton() {
    return (
        <div className="min-w-0 pt-1" role="status">
            <span className="sr-only">Loading profile...</span>

            <div className="mb-4 flex items-center gap-1.5">
                <Skeleton className="h-1.5 w-1.5 rounded-full" />
                <Skeleton className="h-4 w-40" />
            </div>

            <div className="space-y-1">
                {["w-full", "w-11/12", "w-2/3"].map((width) => (
                    <Skeleton
                        key={width}
                        className={`h-[47px] rounded-xl md:h-[59px] ${width}`}
                    />
                ))}
            </div>

            <div className="mt-7 max-w-130 space-y-2">
                {[0, 1, 2, 3, 4, 5, 6, 7].map((line) => (
                    <Skeleton
                        key={line}
                        className={`h-6 ${line === 7 ? "w-3/4" : "w-full"}`}
                    />
                ))}
            </div>

            <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2">
                {[0, 1, 2, 3].map((link) => (
                    <Skeleton key={link} className="h-11 w-20" />
                ))}
            </div>
        </div>
    );
}

export function HeroStatsSkeleton() {
    return (
        <div role="status">
            <span className="sr-only">Loading stats...</span>

            <div
                className="grid"
                style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}
            >
                {[0, 1].map((stat) => (
                    <div
                        key={stat}
                        className={`px-4 py-5 sm:px-4 ${
                            stat === 0 ? "border-r hairline" : ""
                        }`}
                    >
                        <div className="flex items-center gap-1.5">
                            <Skeleton className="h-[15px] w-[15px] rounded-sm" />
                            <Skeleton className="h-[18px] w-24" />
                        </div>

                        <Skeleton className="mt-2 h-[27px] w-16" />
                    </div>
                ))}
            </div>
        </div>
    );
}

export function AlsoTrueSkeleton() {
    return (
        <div
            className="border-t hairline px-1 py-5 sm:py-6"
            role="status"
        >
            <span className="sr-only">Loading also true...</span>

            <Skeleton className="mb-3 h-[18px] w-20" />

            <div className="flex flex-wrap gap-2.5">
                {["w-44", "w-56", "w-40"].map((width) => (
                    <Skeleton
                        key={width}
                        className={`h-[33px] rounded-xl border border-(--glass-border) bg-(--glass-bg) ${width}`}
                    />
                ))}
            </div>
        </div>
    );
}
