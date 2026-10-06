export type ProficiencyLevel = "learning" | "comfortable" | "confident";

const levelFillClassName: Record<ProficiencyLevel, string> = {
    confident: "bg-(--accent-strong)",
    comfortable:
        "bg-[linear-gradient(90deg,var(--accent-strong)_50%,transparent_50%)]",
    learning: "bg-transparent",
};

/**
 * Small proficiency dot used on skill pills. Filled when confident,
 * half-filled when comfortable, hollow while learning.
 */
export function LevelDot({ level }: { level: ProficiencyLevel }) {
    return (
        <span
            aria-hidden="true"
            title={level}
            className={`
                inline-block
                h-2
                w-2
                shrink-0
                rounded-full
                border
                border-(--accent-strong)
                ${levelFillClassName[level]}
            `}
        />
    );
}
