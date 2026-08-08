import { useState } from "react";

const years = [2026, 2025, 2024];

export function YearSelector() {
    const [selectedYear, setSelectedYear] = useState(2026);

    return (
        <div className="flex items-center gap-3">
            {years.map((year) => (
                <button
                    key={year}
                    onClick={() => setSelectedYear(year)}
                    className={
                        selectedYear === year
                            ? "rounded-lg bg-neutral-900 px-4 py-2 text-white"
                            : "rounded-lg border border-neutral-300 px-4 py-2"
                    }
                >
                    {year}
                </button>
            ))}
        </div>
    );
}