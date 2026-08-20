import {
    Bot,
    GitCommit,
    Coffee,
} from "lucide-react";

const items = [
    {
        text: "AI tabs opened: Classified",
        icon: Bot,
    },
    {
        text: "Commit messages: surprisingly descriptive",
        icon: GitCommit,
    },
    {
        text: "Sleep: pending PR review",
        icon: Coffee,
    },
];

export function AlsoTrue() {
    return (
        <div className="border-t hairline px-1 py-5 sm:py-6">
<p
                    className="
                        mb-3
                        font-mono
                        text-[12px]
                        uppercase
                        tracking-[0.08em]
                        text-(--graphite-soft)
                    "
                >
                Also true
            </p>

            <div className="flex flex-wrap gap-2.5">
                {items.map(({ text, icon: Icon }) => (
                    <span
                        key={text}
                        className="
                        group
                        inline-flex
                        items-center
                        gap-2
                        rounded-xl
                        border
                        border-(--glass-border)
                        bg-(--glass-bg)
                        px-3
                        py-1.5
                        font-mono
                        text-[12.5px]
                        text-(--graphite)
                        shadow-[0_6px_20px_rgba(31,38,135,0.06)]
                        backdrop-blur-md
                        backdrop-saturate-140
                        transition-colors
                        duration-150
                        hover:border-(--accent-strong)
                        hover:text-(--accent-strong)
                    "
                    >
                        <Icon
                            size={15}
                            strokeWidth={1.8}
                            className="
                                text-(--graphite)
                                transition-colors
                                duration-150
                                group-hover:text-(--accent-strong)
                            "
                        />

                        {text}
                    </span>
                ))}
            </div>
        </div>
    );
}