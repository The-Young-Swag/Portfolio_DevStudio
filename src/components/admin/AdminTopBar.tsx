import { ExternalLink, LogOut } from "lucide-react";
import { Link } from "react-router";

export function AdminTopBar({ onSignOut }: { onSignOut: () => void }) {
    return (
        <div
            className="
                sticky
                top-0
                z-30
                flex
                items-center
                gap-3
                border-b
                border-(--line)
                bg-(--paper)/80
                px-4
                py-3
                backdrop-blur-xl
                sm:px-6
            "
        >
            <p
                className="
                    inline-flex
                    items-center
                    gap-2
                    rounded-full
                    bg-(--accent-strong)/10
                    px-3
                    py-1.5
                    font-mono
                    text-[11px]
                    text-(--accent-strong)
                "
            >
                <span
                    aria-hidden="true"
                    className="h-1.5 w-1.5 rounded-full bg-(--accent-strong)"
                />
                Changes go live instantly
            </p>

            <span className="flex-1" />

            <Link
                to="/"
                className="
                    inline-flex
                    items-center
                    gap-1.5
                    rounded-xl
                    border
                    border-(--glass-border)
                    bg-(--glass-bg)
                    px-3.5
                    py-2
                    text-[12.5px]
                    font-medium
                    text-(--ink)
                    transition-colors
                    duration-150
                    hover:border-(--accent-strong)
                    hover:text-(--accent-strong)
                    focus-visible:outline-none
                    focus-visible:ring-2
                    focus-visible:ring-(--accent-strong)
                "
            >
                <ExternalLink size={14} strokeWidth={2} aria-hidden="true" />
                View site
            </Link>

            <button
                type="button"
                onClick={onSignOut}
                className="
                    inline-flex
                    items-center
                    gap-1.5
                    rounded-xl
                    border
                    border-(--glass-border)
                    bg-(--glass-bg)
                    px-3.5
                    py-2
                    text-[12.5px]
                    font-medium
                    text-(--ink)
                    transition-colors
                    duration-150
                    hover:border-(--accent-strong)
                    hover:text-(--accent-strong)
                    focus-visible:outline-none
                    focus-visible:ring-2
                    focus-visible:ring-(--accent-strong)
                "
            >
                <LogOut size={14} strokeWidth={2} aria-hidden="true" />
                Log out
            </button>
        </div>
    );
}
