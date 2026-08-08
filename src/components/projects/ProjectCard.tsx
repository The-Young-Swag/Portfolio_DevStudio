type ProjectCardProps = {
    title: string;
    description: string;
    stack: string[];
    year: number;
};

export function ProjectCard({
    title,
    description,
    stack,
    year,
}: ProjectCardProps) {
    return (
        <tr className="border-t border-neutral-200">
            <td className="px-4 py-5 align-top">
                <p className="text-[13.5px] font-medium text-neutral-950">
                    {title}
                </p>

                <p className="mt-0.5 text-[12.5px] leading-5 text-neutral-600">
                    {description}
                </p>
            </td>

            <td className="px-4 py-5 align-top">
                <div className="flex flex-wrap gap-1.5">
                    {stack.map((technology) => (
                        <span
                            key={technology}
                            className="
                                rounded-md
                                border
                                border-neutral-200
                                px-2
                                py-1
                                font-mono
                                text-[10.5px]
                                text-neutral-500
                            "
                        >
                            {technology}
                        </span>
                    ))}
                </div>
            </td>

            <td
                className="
                    px-4
                    py-5
                    text-right
                    align-top
                    font-mono
                    text-[11px]
                    text-neutral-500
                "
            >
                {year}
            </td>
        </tr>
    );
}