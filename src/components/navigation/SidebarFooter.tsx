import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/context/theme";

export function SidebarFooter() {
    const { theme, toggleTheme } = useTheme();

    const isDark = theme === "dark";

    return (
        <footer
            className="
                shrink-0
                border-t
                border-white/40
                px-4
                py-4
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
                        text-(--graphite)
                    "
                >
                    {isDark ? "Dark mode" : "Light mode"}
                </span>

                    <button
                        type="button"
                        role="switch"
                        aria-checked={isDark}
                        aria-label={
                            isDark
                                ? "Switch to light mode"
                                : "Switch to dark mode"
                        }
                        onClick={toggleTheme}
                        className={`
                            relative
                            flex
                            h-11
                            w-20
                            items-center
                            rounded-full
                            border
                            p-1
                            backdrop-blur-md
                            transition-colors
                            duration-200
                            focus-visible:outline-none
                            focus-visible:ring-2
                            focus-visible:ring-(--accent-strong)

                            ${
                                isDark
                                    ? `
                                        border-(--viridian)
                                        bg-(--viridian)
                                        shadow-none
                                    `
                                    : `
                                        border-black/5
                                        bg-black/[0.035]
                                        shadow-[inset_0_1px_3px_rgba(0,0,0,0.10)]
                                    `
                            }
                        `}
                    >
                        <span
                            className={`
                                flex
                                h-8
                                w-8
                                items-center
                                justify-center
                                rounded-full
                                shadow-[0_2px_8px_rgba(0,0,0,0.18)]
                                transition-transform
                                duration-200

                                ${
                                    isDark
                                        ? `
                                            translate-x-9
                                            bg-[#111113]
                                            text-white
                                        `
                                        : `
                                            translate-x-0
                                            bg-(--accent-strong)
                                            text-white
                                        `
                                }
                            `}
                        >
                        {isDark ? (
                            <Moon size={13} strokeWidth={2} />
                        ) : (
                            <Sun size={13} strokeWidth={2} />
                        )}
                    </span>
                </button>
            </div>
        </footer>
    );
} 