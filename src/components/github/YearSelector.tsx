import type {
    ContributionPeriod,
    ContributionPeriodId,
} from "./types";

type YearSelectorProps = {
    periods: ContributionPeriod[];
    selectedPeriod: ContributionPeriodId;
    onPeriodChange: (
        periodId: ContributionPeriodId,
    ) => void;
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
                            backdrop-blur-md
                            backdrop-saturate-140
                            transition-colors
                            duration-150

                            ${
                                isSelected
                                    ? `
                                        border-(--viridian)
                                        bg-(--viridian)
                                        text-white
                                    `
                                    : `
                                        border-(--glass-border)
                                        bg-(--glass-bg)
                                        text-(--graphite)
                                        hover:border-(--accent-strong)
                                        hover:text-(--accent-strong)
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