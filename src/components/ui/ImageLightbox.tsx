import { useEffect } from "react";

import { useFocusTrap } from "./useFocusTrap";

type ImageLightboxProps = {
    src: string;
    alt: string;
    onClose: () => void;
};

export function ImageLightbox({ src, alt, onClose }: ImageLightboxProps) {
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
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4"
            onClick={onClose}
        >
            <div
                ref={trapRef}
                role="dialog"
                aria-modal="true"
                aria-label={alt}
                tabIndex={-1}
                onClick={(event) => event.stopPropagation()}
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
