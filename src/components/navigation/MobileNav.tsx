import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router";

import { ConnectList } from "./ConnectList";
import { NavigationList } from "./NavigationList";
import { SidebarFooter } from "./SidebarFooter";

export function MobileNav() {
    const [open, setOpen] = useState(false);
    const location = useLocation();
    const [previousPath, setPreviousPath] = useState(
        location.pathname,
    );

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
        document.body.style.overflow = "hidden";

        return () => {
            document.removeEventListener("keydown", onKeyDown);
            document.body.style.overflow = "";
        };
    }, [open]);

    return (
        <>
            {/* Top bar */}
            <div className="fixed left-4 right-4 top-4 z-50 lg:hidden">
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
                        onClick={() => setOpen((value) => !value)}
                        className="
                            flex
                            h-9
                            w-9
                            items-center
                            justify-center
                            rounded-xl
                            text-(--ink)
                            transition-colors
                            duration-150
                            hover:bg-(--glass-bg)
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

            {/* Backdrop */}
            {open && (
                <button
                    type="button"
                    aria-label="Close menu"
                    onClick={() => setOpen(false)}
                    className="
                        fixed
                        inset-0
                        z-40
                        bg-black/25
                        backdrop-blur-sm
                        lg:hidden
                    "
                />
            )}

            {/* Drawer */}
            {open && (
                <div
                    className="
                        fixed
                        left-4
                        right-4
                        top-[84px]
                        z-50
                        max-h-[calc(100vh-104px)]
                        overflow-y-auto
                        lg:hidden
                        rounded-[22px]
                        border
                        border-white/70
                        bg-white/60
                        px-2
                        py-3
                        shadow-[0_12px_40px_rgba(31,38,135,0.10)]
                        backdrop-blur-xl
                        backdrop-saturate-160

                        dark:border-white/15
                        dark:bg-black/30
                        dark:shadow-[0_12px_40px_rgba(0,0,0,0.28)]
                    "
                >
                    <nav aria-label="Primary navigation">
                        <NavigationList />
                    </nav>

                    <ConnectList />

                    <SidebarFooter />
                </div>
            )}
        </>
    );
}