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
        <div className="border-t border-neutral-200 px-1 py-5 sm:py-6">
            <p
                className="
                    mb-3
                    font-mono
                    text-[12px]
                    uppercase
                    tracking-[0.08em]
                    text-neutral-500
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
                            rounded-[7px]
                            border
                            border-neutral-200
                            bg-white
                            px-3
                            py-1.5
                            font-mono
                            text-[12.5px]
                            text-neutral-600
                            transition-colors
                            duration-150
                            hover:border-[#059669]
                            hover:text-[#059669]
                        "
                    >
                        <Icon
                            size={15}
                            strokeWidth={1.8}
                            className="
                                text-neutral-400
                                transition-colors
                                duration-150
                                group-hover:text-[#059669]
                            "
                        />

                        {text}
                    </span>
                ))}
            </div>
        </div>
    );
}