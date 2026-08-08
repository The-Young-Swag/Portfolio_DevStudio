type ProjectCardProps = {
    title: string;
    description: string;
    stack: string[];
};

export function ProjectCard({
    title,
    description,
    stack,
}: ProjectCardProps) {
    return (
        <article className="rounded-xl border border-neutral-200 p-6">
            <h3 className="text-xl font-semibold">
                {title}
            </h3>

            <p className="mt-3 text-sm leading-6 text-neutral-600">
                {description}
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
                {stack.map((technology) => (
                    <span
                        key={technology}
                        className="rounded-md border border-neutral-200 px-2 py-1 text-xs text-neutral-500"
                    >
                        {technology}
                    </span>
                ))}
            </div>
        </article>
    );
}