import { Star } from "lucide-react";

import { LevelDot, type ProficiencyLevel } from "./LevelDot";

const pillClassName = `
    inline-flex
    items-center
    gap-2
    rounded-full
    border
    border-(--glass-border)
    bg-(--glass-bg)
    px-3
    py-1.5
    text-[13px]
    font-medium
    text-(--ink)
    shadow-[inset_0_1px_0_var(--glass-highlight)]
    backdrop-blur-md
`;

type SkillPillProps = {
    name: string;
    level: ProficiencyLevel;
    isCore: boolean;
    onClick?: () => void;
};

function CoreStar() {
    return (
        <Star
            size={12}
            strokeWidth={2}
            aria-hidden="true"
            fill="currentColor"
            className="shrink-0 text-amber-600 dark:text-amber-400"
        />
    );
}

/**
 * Compact skill pill with proficiency dot and core marker. Renders as a
 * button when an onClick handler is given (admin editing), otherwise as a
 * static pill (public pages).
 */
export function SkillPill({ name, level, isCore, onClick }: SkillPillProps) {
    const accessibleName = `${name}, ${level}${isCore ? ", core skill" : ""}`;

    if (onClick !== undefined) {
        return (
            <button
                type="button"
                onClick={onClick}
                aria-label={accessibleName}
                title={accessibleName}
                className={`
                    ${pillClassName}
                    cursor-pointer
                    transition-colors
                    duration-150
                    hover:border-(--accent-strong)
                    hover:text-(--accent-strong)
                    focus-visible:outline-none
                    focus-visible:ring-2
                    focus-visible:ring-(--accent-strong)
                `}
            >
                <LevelDot level={level} />
                {name}
                {isCore && <CoreStar />}
            </button>
        );
    }

    return (
        <span className={pillClassName} title={accessibleName}>
            <LevelDot level={level} />
            {name}
            {isCore && <CoreStar />}
            <span className="sr-only">{`, ${level}${isCore ? ", core skill" : ""}`}</span>
        </span>
    );
}
