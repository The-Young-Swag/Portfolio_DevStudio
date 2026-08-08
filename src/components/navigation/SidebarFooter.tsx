import { Sun } from "lucide-react";

export function SidebarFooter() {
    return (
        <footer
            className="
                shrink-0
                border-t
                border-neutral-200
                px-4
                py-5
            "
        >
            <div className="flex items-center justify-between">
                <span
                    className="
                        font-mono
                        text-[11px]
                        text-neutral-500
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
                        bg-neutral-200
                        p-1
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
                            bg-white
                            shadow-sm
                        "
                    >
                        <Sun size={14} />
                    </span>
                </button>
            </div>
        </footer>
    );
}