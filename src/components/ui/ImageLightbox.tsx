import { useEffect, useRef } from "react";

type ImageLightboxProps = {
    src: string;
    alt: string;
    onClose: () => void;
};

export function ImageLightbox({ src, alt, onClose }: ImageLightboxProps) {
    const dialogRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const previouslyFocused = document.activeElement as HTMLElement | null;

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                onClose();
            }
        };

        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            previouslyFocused?.focus();
        };
    }, [onClose]);

    function handleDialogKeyDown(event: React.KeyboardEvent) {
        if (event.key !== "Tab") {
            return;
        }

        const dialog = dialogRef.current;

        if (!dialog) {
            return;
        }

        const focusable = Array.from(
            dialog.querySelectorAll<HTMLElement>(
                'button, a[href], input, [tabindex]:not([tabindex="-1"])',
            ),
        ).filter((element) => !element.hasAttribute("disabled"));

        if (focusable.length === 0) {
            return;
        }

        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        const active = document.activeElement;

        if (event.shiftKey && active === first) {
            event.preventDefault();
            last.focus();
        } else if (!event.shiftKey && active === last) {
            event.preventDefault();
            first.focus();
        }
    }

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4"
            onClick={onClose}
        >
            <div
                ref={(element) => {
                    dialogRef.current = element;
                    element?.focus();
                }}
                role="dialog"
                aria-modal="true"
                aria-label={alt}
                tabIndex={-1}
                onClick={(event) => event.stopPropagation()}
                onKeyDown={handleDialogKeyDown}
                className="max-h-full w-auto max-w-full outline-none"
            >
                <img
                    src={src}
                    alt={alt}
                    className="max-h-[80vh] w-auto max-w-full rounded-xl border border-white/20 object-contain"
                />

                <div className="mt-3 flex items-center justify-between gap-4">
                    <p className="truncate font-mono text-[11px] text-white/80">{alt}</p>

                    <button
                        type="button"
                        onClick={onClose}
                        className="
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
                        "
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
