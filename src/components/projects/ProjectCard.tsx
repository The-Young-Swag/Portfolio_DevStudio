type ProjectCardProps = {
    title: string;
    description: string;
    stack: string[];
    year: number;
    category: string;
    thumbnail: string;
    index: number;
};

export function ProjectCard({
    title,
    description,
    stack,
    year,
    category,
    thumbnail,
    index,
}: ProjectCardProps) {
    return (
        <article
            className="
                group
                overflow-hidden
                rounded-2xl
                border
                border-(--glass-border)
                bg-(--glass-bg)
                shadow-[inset_0_1px_0_var(--glass-highlight),0_10px_30px_-20px_rgba(31,38,135,0.12)]
                backdrop-blur-xl
                backdrop-saturate-160
                transition-[background-color,box-shadow]
                duration-500
                ease-[cubic-bezier(0.22,1,0.36,1)]
                hover:bg-(--glass-bg-strong)
                hover:shadow-[inset_0_1px_0_var(--glass-highlight),0_0_0_1px_var(--accent-strong)/20,0_16px_40px_-20px_var(--accent-strong)/35]
            "
        >
            <div className="relative aspect-video overflow-hidden border-b border-(--line)">
                <img
                    src={thumbnail}
                    alt={`${title} preview`}
                    loading="lazy"
                    decoding="async"
                    className="
                        h-full
                        w-full
                        object-cover
                        transition-transform
                        duration-700
                        ease-[cubic-bezier(0.22,1,0.36,1)]
                        group-hover:scale-[1.04]
                    "
                />

                <span className="absolute left-3 top-3 rounded-full border border-white/20 bg-black/30 px-2.5 py-1 font-mono text-[10px] text-white backdrop-blur-md">
                    {String(index + 1).padStart(2, "0")}
                </span>
            </div>

            <div className="p-5">
                <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-(--graphite)">
                    <span>{year}</span>
                    <span aria-hidden="true" className="opacity-40">·</span>
                    <span>{category}</span>
                </div>

                <h3 className="mt-3 font-display text-[22px] leading-tight text-(--ink)">
                    {title}
                </h3>

                <p className="mt-2 text-[13px] leading-5 text-(--graphite)">
                    {description}
                </p>

                <div className="mt-5 flex flex-wrap gap-1.5">
                    {stack.map((technology) => (
                        <span
                            key={technology}
                            className="
                                rounded-full
                                border
                                border-(--accent-strong)/50
                                px-2.5
                                py-1
                                font-mono
                                text-[9.5px]
                                text-(--graphite)
                                transition-colors
                                duration-500
                                group-hover:border-(--accent-strong)
                                group-hover:text-(--ink)
                            "
                        >
                            {technology}
                        </span>
                    ))}
                </div>
            </div>
        </article>
    );
}