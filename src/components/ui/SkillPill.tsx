import { Star } from "lucide-react";

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
            className="shrink-0 text-amber-500 dark:text-amber-400"
        />
    );
}

/**
 * Compact skill pill with a gold star for core skills. Renders as a
 * button when an onClick handler is given (admin editing), otherwise as a
 * static pill (public pages).
 */
export function SkillPill({ name, isCore, onClick }: SkillPillProps) {
    const accessibleName = isCore ? `${name}, core skill` : name;

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
                {name}
                {isCore && <CoreStar />}
            </button>
        );
    }

    return (
        <span className={pillClassName} title={accessibleName}>
            {name}
            {isCore && <CoreStar />}
            {isCore && <span className="sr-only">, core skill</span>}
        </span>
    );
}
