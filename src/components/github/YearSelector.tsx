type YearSelectorProps = {
    selectedYear: number;
    onYearChange: (year: number) => void;
};

const years = [2026, 2025, 2024];

export function YearSelector({
    selectedYear,
    onYearChange,
}: YearSelectorProps) {
    return (
        <div className="flex items-center gap-2">
            {years.map((year) => {
                const isSelected = selectedYear === year;

                return (
                    <button
                        key={year}
                        type="button"
                        onClick={() => onYearChange(year)}
                        className={`
                            rounded-md
                            border
                            px-3
                            py-1.5
                            font-mono
                            text-[11px]
                            transition-colors
                            ${
                                isSelected
                                    ? "border-[#40826D] bg-[#40826D] text-white"
                                    : "border-neutral-200 text-neutral-500 hover:border-[#40826D] hover:text-[#40826D]"
                            }
                        `}
                    >
                        {year}
                    </button>
                );
            })}
        </div>
    );
}