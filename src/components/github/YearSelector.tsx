import type {
    ContributionPeriod,
    ContributionPeriodId,
} from "./types";

type YearSelectorProps = {
    periods: ContributionPeriod[];
    selectedPeriod: ContributionPeriodId;
    onPeriodChange: (periodId: ContributionPeriodId) => void;
};

export function YearSelector({
    periods,
    selectedPeriod,
    onPeriodChange,
}: YearSelectorProps) {
    return (
        <div className="flex flex-wrap items-center gap-2">
            {periods.map((period) => {
                const isSelected =
                    selectedPeriod === period.id;

                return (
                    <button
                        key={period.id}
                        type="button"
                        onClick={() =>
                            onPeriodChange(period.id)
                        }
                        className={`
                            rounded-full
                            border
                            px-3.5
                            py-1.5
                            font-mono
                            text-[11px]
                            backdrop-blur-[12px]
                            backdrop-saturate-[140%]
                            transition-colors
                            duration-150

                            ${
                                isSelected
                                    ? `
                                        border-[#059669]
                                        bg-[#059669]
                                        text-white
                                    `
                                    : `
                                        border-white/70
                                        bg-white/30
                                        text-[var(--graphite)]
                                        hover:border-[#42B683]
                                        hover:text-[#059669]
                                    `
                            }
                        `}
                    >
                        {period.label}
                    </button>
                );
            })}
        </div>
    );
}