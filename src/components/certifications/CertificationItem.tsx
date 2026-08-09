type CertificationItemProps = {
    name: string;
    issuer: string;
    year: string;
};

export function CertificationItem({
    name,
    issuer,
    year,
}: CertificationItemProps) {
    return (
        <article
            className="
                group
                w-[220px]
                shrink-0
                rounded-lg
                border
                border-neutral-200
                bg-white
                p-5
                transition-colors
                duration-150
                hover:border-[#059669]
            "
        >
            <p
                className="
                    font-mono
                    text-[10px]
                    uppercase
                    tracking-[0.08em]
                    text-neutral-500
                "
            >
                {year}
            </p>

            <h3
                className="
                    mt-3
                    font-display
                    text-[15px]
                    font-medium
                    leading-snug
                    text-neutral-950
                    transition-colors
                    duration-150
                    group-hover:text-[#059669]
                "
            >
                {name}
            </h3>

            <p
                className="
                    mt-2
                    font-mono
                    text-[11px]
                    leading-relaxed
                    text-neutral-500
                "
            >
                {issuer}
            </p>
        </article>
    );
}