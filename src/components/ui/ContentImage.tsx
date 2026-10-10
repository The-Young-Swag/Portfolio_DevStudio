import { useState } from "react";
import { Image as ImageIcon } from "lucide-react";

export function ImagePlaceholder({ className }: { className?: string }) {
    return (
        <div
            aria-hidden="true"
            className={`
                flex
                items-center
                justify-center
                bg-(--glass-bg)
                text-(--graphite-soft)
                ${className ?? ""}
            `}
        >
            <ImageIcon size={22} strokeWidth={1.5} />
        </div>
    );
}

type ContentImageProps = {
    src: string;
    alt: string;
    imageClassName?: string;
    placeholderClassName?: string;
    /** "eager" for above-the-fold certificate viewers. Defaults to lazy. */
    loading?: "lazy" | "eager";
    /** Fires when the source fails, so callers can fall back further. */
    onUnavailable?: () => void;
};

export function ContentImage({
    src,
    alt,
    imageClassName,
    placeholderClassName,
    loading = "lazy",
    onUnavailable,
}: ContentImageProps) {
    const [failedSrc, setFailedSrc] = useState<string | null>(null);

    if (src === "" || failedSrc === src) {
        return <ImagePlaceholder className={placeholderClassName} />;
    }

    return (
        <img
            src={src}
            alt={alt}
            loading={loading}
            decoding="async"
            onError={() => {
                setFailedSrc(src);
                onUnavailable?.();
            }}
            className={imageClassName}
        />
    );
}
