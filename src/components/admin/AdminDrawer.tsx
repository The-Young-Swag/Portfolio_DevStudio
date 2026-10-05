import { useEffect } from "react";
import type { PropsWithChildren, ReactNode } from "react";
import { X } from "lucide-react";

import { useFocusTrap } from "@/components/ui/useFocusTrap";
import { IconButton } from "./AdminButtons";

type AdminDrawerProps = PropsWithChildren<{
    open: boolean;
    title: string;
    onClose: () => void;
    footer: ReactNode;
}>;

export function AdminDrawer({ open, title, onClose, footer, children }: AdminDrawerProps) {
    const trapRef = useFocusTrap<HTMLDivElement>(open);

    useEffect(() => {
        if (!open) {
            return;
        }

        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape") {
                onClose();
            }
        }

        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [open, onClose]);

    if (!open) {
        return null;
    }

    return (
        <>
            <button
                type="button"
                aria-label="Close editor"
                onClick={onClose}
                className="fixed inset-0 z-50 cursor-default bg-black/45"
            />

            <div
                ref={trapRef}
                role="dialog"
                aria-modal="true"
                aria-label={title}
                className="
                    fixed
                    bottom-0
                    right-0
                    top-0
                    z-50
                    flex
                    w-[min(35rem,100%)]
                    flex-col
                    border-l
                    border-(--glass-border)
                    bg-(--paper)
                    pt-[env(safe-area-inset-top,0px)]
                "
            >
                <div className="flex items-center gap-3 border-b border-(--line) px-5 py-4">
                    <h2 className="min-w-0 flex-1 truncate font-display text-[20px] font-medium text-(--ink)">
                        {title}
                    </h2>

                    <IconButton label="Close editor" onClick={onClose}>
                        <X size={16} strokeWidth={2} aria-hidden="true" />
                    </IconButton>
                </div>

                <div className="flex-1 space-y-3 overflow-y-auto px-5 py-5">{children}</div>

                <div className="flex gap-3 border-t border-(--line) bg-(--glass-bg) px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
                    {footer}
                </div>
            </div>
        </>
    );
}
