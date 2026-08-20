type ExperienceItemProps = {
    period: string;
    role: string;
    company: string;
    description: string[];
};

export function ExperienceItem({
    period,
    role,
    company,
    description,
}: ExperienceItemProps) {
    return (
        <div className="relative">
            {/* Timeline dot */}
            <span
                className="
                    absolute
                    -left-[25.5px]
                    top-[3px]
                    h-2.5
                    w-2.5
                    rounded-full
                    border-2
                    border-(--accent-strong)
                    bg-(--paper)
                    shadow-[0_0_0_4px_var(--accent-strong)/15]
                "
            />

            {/* Period */}
            <p className="mb-1 font-mono text-[10.5px] uppercase tracking-[0.1em] text-(--graphite-soft)">
                {period}
            </p>

            {/* Role */}
            <h3 className="font-display text-[17px] font-medium leading-snug text-(--ink)">
                {role}
            </h3>

            {/* Company */}
            <p className="mt-0.5 font-mono text-[11.5px] text-(--graphite)">
                {company}
            </p>

            {/* Experience bullets */}
            <ul
                className="
                    mt-2.5
                    ml-4
                    list-outside
                    list-disc
                    space-y-1.5
                    text-[13px]
                    leading-relaxed
                    text-(--graphite)
                    marker:text-(--accent-strong)
                "
            >
                {description.map((item, index) => (
                    <li key={index}>{item}</li>
                ))}
            </ul>
        </div>
    );
}