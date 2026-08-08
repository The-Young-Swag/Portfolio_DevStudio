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
                    border-[#059669]
                    bg-white
                "
            />

            {/* Period */}
            <p
                className="
                    mb-1
                    font-mono
                    text-[10.5px]
                    text-neutral-500
                "
            >
                {period}
            </p>

            {/* Role */}
            <h3
                className="
                    font-display
                    text-[16px]
                    font-medium
                    text-neutral-950
                "
            >
                {role}
            </h3>

            {/* Company */}
            <p
                className="
                    font-mono
                    text-[11.5px]
                    text-neutral-500
                "
            >
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
                    text-neutral-600
                "
            >
                {description.map((item, index) => (
                    <li key={index}>{item}</li>
                ))}
            </ul>
        </div>
    );
}