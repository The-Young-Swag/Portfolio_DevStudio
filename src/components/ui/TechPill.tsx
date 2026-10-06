import { Link } from "react-router";

const techPillClassName = `
    inline-block
    max-w-full
    break-words
    rounded-full
    border
    border-(--accent-strong)/40
    px-2.5
    py-1
    font-mono
    text-[9.5px]
    text-(--graphite)
`;

type TechPillProps = {
    name: string;
    href?: string;
};

/**
 * Small technology pill. Renders as a link to the given page when an
 * href is provided (hoverable, focusable), otherwise as static text.
 */
export function TechPill({ name, href }: TechPillProps) {
    if (href === undefined) {
        return <span className={techPillClassName}>{name}</span>;
    }

    return (
        <Link
            to={href}
            title={`${name} — view on the Stack page`}
            className={`
                ${techPillClassName}
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
        </Link>
    );
}
