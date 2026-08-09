import { Sun } from "lucide-react";

export function SidebarFooter() {
    return (
        <footer
            className="
                shrink-0
                border-t
                border-white/50
                px-5
                py-5
                dark:border-white/10
            "
        >
            <div
                className="
                    flex
                    items-center
                    justify-between
                    gap-3
                "
            >
                <span
                    className="
                        font-mono
                        text-[11px]
                        text-neutral-500
                        dark:text-neutral-400
                    "
                >
                    Light mode
                </span>

                <button
                    type="button"
                    role="switch"
                    aria-checked="false"
                    aria-label="Toggle dark mode"
                    className="
                        relative
                        flex
                        h-8
                        w-16
                        items-center
                        rounded-full

                        border
                        border-white/70

                        bg-white/35
                        p-1

                        shadow-[inset_0_1px_3px_rgba(0,0,0,0.06)]

                        backdrop-blur-md
                        backdrop-saturate-150

                        transition-all
                        duration-200

                        hover:border-[#40826D]/40

                        dark:border-white/15
                        dark:bg-white/10
                    "
                >
                    <span
                        className="
                            flex
                            h-6
                            w-6
                            items-center
                            justify-center
                            rounded-full

                            bg-[#059669]
                            text-white

                            shadow-[0_2px_7px_rgba(0,0,0,0.18)]
                        "
                    >
                        <Sun size={14} />
                    </span>
                </button>
            </div>
        </footer>
    );
}