import { useEffect } from "react";

import { useFocusTrap } from "@/components/ui/useFocusTrap";
import { PdfEmbed } from "./PdfEmbed";

type PdfLightboxProps = {
    src: string;
    title: string;
    onClose: () => void;
};

/**
 * Full-document popup for PDF certificates, mirroring the image
 * lightbox. Opened from the rail card so the whole preview is one
 * click away.
 */
export function PdfLightbox({ src, title, onClose }: PdfLightboxProps) {
    const trapRef = useFocusTrap<HTMLDivElement>(true);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                onClose();
            }
        };

        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [onClose]);

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] pt-[max(1rem,env(safe-area-inset-top))]"
            onClick={onClose}
        >
            <div
                ref={trapRef}
                role="dialog"
                aria-modal="true"
                aria-label={title}
                tabIndex={-1}
                onClick={(event) => event.stopPropagation()}
                className="flex max-h-full w-full max-w-4xl flex-col outline-none"
            >
                <PdfEmbed
                    src={src}
                    title={title}
                    interactive
                    className="h-[75dvh] w-full rounded-xl border border-white/20 bg-white"
                />

                <div className="mt-3 flex items-center justify-between gap-4">
                    <a
                        href={src}
                        target="_blank"
                        rel="noreferrer"
                        className="truncate font-mono text-[11px] text-white/80 hover:underline"
                    >
                        Open original ↗
                    </a>

                    <button
                        type="button"
                        onClick={onClose}
                        className="
                            min-h-11
                            min-w-11
                            shrink-0
                            rounded-lg
                            border
                            border-white/25
                            bg-black/40
                            px-4
                            py-1.5
                            font-mono
                            text-[11px]
                            text-white
                            backdrop-blur-md
                            transition-colors
                            duration-150
                            hover:border-white/60
                            focus-visible:outline-none
                            focus-visible:ring-2
                            focus-visible:ring-white
                        "
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
