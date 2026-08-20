type SectionHeadingProps = {
    number: string;
    title: string;
};

export function SectionHeading({
    number,
    title,
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

            <span
                aria-hidden="true"
                className="
                    ml-2
                    text-sm
                    text-(--graphite-soft)
                    opacity-0
                    transition-opacity
                    group-hover:opacity-100
                "
            >
                #
            </span>
        </h2>
    );
}