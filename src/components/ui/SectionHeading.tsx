type SectionHeadingProps = {
    number: string;
    title: string;
    id?: string;
};

export function SectionHeading({
    number,
    title,
    id,
}: SectionHeadingProps) {
    return (
        <h2
            className="
                group
                font-display
                text-2xl
                leading-tight
                text-(--ink)
            "
        >
            {number}
            {" — "}
            {title}

            {id !== undefined && (
                <a
                    href={`#${id}`}
                    aria-label="Link to this section"
                    className="section-anchor ml-2 align-baseline text-sm text-(--graphite-soft)"
                >
                    <span aria-hidden="true">#</span>
                </a>
            )}
        </h2>
    );
}