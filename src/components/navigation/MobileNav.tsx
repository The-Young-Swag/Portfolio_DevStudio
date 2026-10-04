import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router";

import { useTheme } from "@/context/theme";
import { useFocusTrap } from "@/components/ui/useFocusTrap";
import { ConnectList } from "./ConnectList";
import { NavigationList } from "./NavigationList";

export function MobileNav() {
    const [open, setOpen] = useState(false);
    const { theme, toggleTheme } = useTheme();
    const location = useLocation();
    const [previousPath, setPreviousPath] = useState(
        location.pathname,
    );

    const trapRef = useFocusTrap<HTMLDivElement>(open);

    if (location.pathname !== previousPath) {
        setPreviousPath(location.pathname);
        setOpen(false);
    }

    useEffect(() => {
        if (!open) {
            return;
        }

        function onKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape") {
                setOpen(false);
            }
        }

        document.addEventListener("keydown", onKeyDown);

        const scrollbarWidth =
            window.innerWidth - document.documentElement.clientWidth;
        const previousOverflow = document.body.style.overflow;
        const previousPaddingRight = document.body.style.paddingRight;
        document.body.style.overflow = "hidden";

        if (scrollbarWidth > 0) {
            document.body.style.paddingRight = `${scrollbarWidth}px`;
        }

        return () => {
            document.removeEventListener("keydown", onKeyDown);
            document.body.style.overflow = previousOverflow;
            document.body.style.paddingRight = previousPaddingRight;
        };
    }, [open]);

    const isDark = theme === "dark";

    return (
        <>
            {/* Top bar */}
            <div className="fixed left-[max(1rem,env(safe-area-inset-left))] right-[max(1rem,env(safe-area-inset-right))] top-[max(1rem,env(safe-area-inset-top))] z-50 lg:hidden">
                <div
                    className="
                        flex
                        items-center
                        justify-between
                        rounded-[22px]
                        border
                        border-white/70
                        bg-white/55
                        px-4
                        py-3
                        shadow-[0_12px_40px_rgba(31,38,135,0.10)]
                        backdrop-blur-xl
                        backdrop-saturate-160

                        dark:border-white/15
                        dark:bg-black/25
                        dark:shadow-[0_12px_40px_rgba(0,0,0,0.28)]
                    "
                >
                    <Link
                        to="/"
                        onClick={() => setOpen(false)}
                        className="
                            font-mono
                            text-[12px]
                            font-medium
                            uppercase
                            tracking-[0.14em]
                            text-(--ink)
                        "
                    >
                        Portfolio
                    </Link>

                    <button
                        type="button"
                        aria-label={
                            open ? "Close menu" : "Open menu"
                        }
                        aria-expanded={open}
                        aria-controls="mobile-menu"
                        onClick={() => setOpen((value) => !value)}
                        className="
                            flex
                            h-11
                            w-11
                            items-center
                            justify-center
                            rounded-xl
                            text-(--ink)
                            transition-colors
                            duration-150
                            hover:bg-(--glass-bg)
                            focus-visible:outline-none
                            focus-visible:ring-2
                            focus-visible:ring-(--accent-strong)
                        "
                    >
                        {open ? (
                            <X size={18} strokeWidth={2} />
                        ) : (
                            <Menu size={18} strokeWidth={2} />
                        )}
                    </button>
                </div>
            </div>

            {/* Dimming scrim (no blur, so the page behind never smears) */}
            {open && (
                <button
                    type="button"
                    aria-label="Close menu"
                    onClick={() => setOpen(false)}
                    className="
                        fixed
                        inset-0
                        z-40
                        bg-black/40
                        lg:hidden
                    "
                />
            )}

            {/* Full-height drawer */}
            {open && (
                <div
                    ref={trapRef}
                    id="mobile-menu"
                    role="dialog"
                    aria-modal="true"
                    aria-label="Site menu"
                    tabIndex={-1}
                    className="
                        mobile-drawer
                        fixed
                        inset-y-0
                        left-0
                        z-50
                        flex
                        w-[min(88vw,360px)]
                        flex-col
                        overflow-hidden
                        border-r
                        border-white/70
                        bg-white/85
                        outline-none
                        backdrop-blur-xl
                        backdrop-saturate-160

                        dark:border-white/15
                        dark:bg-black/60
                        lg:hidden
                    "
                >
                    <div className="flex items-center justify-between px-4 pb-2 pt-[max(1rem,env(safe-area-inset-top))]">
                        <span
                            className="
                                font-mono
                                text-[12px]
                                font-medium
                                uppercase
                                tracking-[0.14em]
                                text-(--ink)
                            "
                        >
                            Portfolio
                        </span>

                        <button
                            type="button"
                            aria-label="Close menu"
                            onClick={() => setOpen(false)}
                            className="
                                flex
                                h-11
                                w-11
                                items-center
                                justify-center
                                rounded-xl
                                text-(--ink)
                                transition-colors
                                duration-150
                                hover:bg-(--glass-bg)
                                focus-visible:outline-none
                                focus-visible:ring-2
                                focus-visible:ring-(--accent-strong)
                            "
                        >
                            <X size={18} strokeWidth={2} />
                        </button>
                    </div>

                    <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-4">
                        <nav aria-label="Primary navigation">
                            <NavigationList />
                        </nav>

                        <ConnectList />
                    </div>

                    <div className="shrink-0 border-t border-(--line) p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
                        <button
                            type="button"
                            onClick={toggleTheme}
                            className="
                                flex
                                min-h-12
                                w-full
                                items-center
                                justify-center
                                gap-2
                                rounded-xl
                                border
                                border-(--glass-border)
                                bg-(--glass-bg)
                                px-4
                                font-mono
                                text-[12px]
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
                            {isDark ? "Switch to light mode" : "Switch to dark mode"}
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}