import { useState, type ReactNode } from "react";

import { safeHttpUrl } from "./safeUrl";

export type MediaFrameRatio = "16/10" | "4/3";
export type MediaFrameFit = "cover-top" | "blur-contain";

/** Deterministic hue pair derived from a name, about 40 degrees apart. */
function huesFor(name: string): [number, number] {
    let hash = 0;

    for (const char of name) {
        hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
    }

    const hue = hash % 360;

    return [hue, (hue + 40) % 360];
}

function monogramFor(name: string): string {
    const initials = name
        .split(/\s+/)
        .filter((word) => word !== "")
        .slice(0, 2)
        .map((word) => word[0])
        .join("")
        .toUpperCase();

    return initials === "" ? "✳" : initials;
}

type GeneratedFallbackProps = {
    name: string;
    label: string;
    className?: string;
};

/**
 * Designed fallback for a missing or broken image: a deterministic
 * gradient seeded by the item name, a large low-opacity monogram, and
 * a small category label. Looks intentional, never broken.
 */
export function GeneratedFallback({ name, label, className }: GeneratedFallbackProps) {
    const [hueA, hueB] = huesFor(name);

    return (
        <span
            aria-hidden="true"
            style={{
                background: `linear-gradient(135deg, hsl(${hueA} 55% 42%), hsl(${hueB} 60% 32%))`,
            }}
            className={`
                relative
                flex
                h-full
                w-full
                flex-col
                items-center
                justify-center
                gap-1.5
                overflow-hidden
                p-3
                text-center
                ${className ?? ""}
            `}
        >
            <span className="font-display text-[2.5rem] font-semibold leading-none text-white/25">
                {monogramFor(name)}
            </span>

            {label !== "" && (
                <span className="max-w-full truncate font-mono text-[10px] uppercase tracking-[0.14em] text-white/80">
                    {label}
                </span>
            )}
        </span>
    );
}

type MediaFrameProps = {
    src: string;
    alt: string;
    ratio: MediaFrameRatio;
    fit: MediaFrameFit;
    /** Seeds the monogram/gradient fallback. */
    name: string;
    /** Small category label for the fallback. */
    label: string;
    /** Above-the-fold frames load eagerly instead of lazily. */
    eager?: boolean;
    /** Rendered (fitted first page) when the image is missing or fails. */
    pdf?: ReactNode;
    className?: string;
};

/**
 * Single unified media frame for project and certificate thumbnails.
 * One container, fixed aspect ratio, rounded corners, subtle border,
 * overflow hidden. Projects fill the frame top-anchored; certificates
 * get a blurred darkened copy behind the sharp contained image so any
 * ratio fills the frame without bars or distortion. Reserves its own
 * space, shimmers while loading, and degrades gracefully.
 */
export function MediaFrame({
    src,
    alt,
    ratio,
    fit,
    name,
    label,
    eager = false,
    pdf,
    className,
}: MediaFrameProps) {
    const safeSrc = safeHttpUrl(src);
    const [prevSrc, setPrevSrc] = useState(safeSrc);
    const [loadedSrc, setLoadedSrc] = useState<string | null>(null);
    const [failedSrc, setFailedSrc] = useState<string | null>(null);

    if (prevSrc !== safeSrc) {
        setPrevSrc(safeSrc);
        setLoadedSrc(null);
        setFailedSrc(null);
    }

    const failed = safeSrc === "" || failedSrc === safeSrc;
    const loading = safeSrc !== "" && !failed && loadedSrc !== safeSrc;

    return (
        <span
            className={`
                media-frame
                relative
                block
                w-full
                overflow-hidden
                rounded-xl
                border
                border-(--line)
                bg-(--glass-bg)
                ${ratio === "16/10" ? "aspect-[16/10]" : "aspect-[4/3]"}
                ${className ?? ""}
            `}
        >
            {failed ? (
                (pdf ?? (
                    <GeneratedFallback name={name} label={label} className="absolute inset-0" />
                ))
            ) : fit === "cover-top" ? (
                <>
                    {loading && <span aria-hidden="true" className="media-shimmer absolute inset-0" />}

                    <img
                        src={safeSrc}
                        alt={alt}
                        loading={eager ? "eager" : "lazy"}
                        decoding="async"
                        onLoad={() => setLoadedSrc(safeSrc)}
                        onError={() => setFailedSrc(safeSrc)}
                        className="sharp absolute inset-0 h-full w-full object-cover object-top"
                    />
                </>
            ) : (
                <>
                    <img
                        src={safeSrc}
                        alt=""
                        aria-hidden="true"
                        loading={eager ? "eager" : "lazy"}
                        decoding="async"
                        onError={() => setFailedSrc(safeSrc)}
                        className="absolute inset-0 h-full w-full scale-125 object-cover blur-xl brightness-[0.55] saturate-150"
                    />

                    {loading && <span aria-hidden="true" className="media-shimmer absolute inset-0" />}

                    <img
                        src={safeSrc}
                        alt={alt}
                        loading={eager ? "eager" : "lazy"}
                        decoding="async"
                        onLoad={() => setLoadedSrc(safeSrc)}
                        onError={() => setFailedSrc(safeSrc)}
                        className="sharp absolute inset-0 h-full w-full object-contain p-2.5"
                    />
                </>
            )}
        </span>
    );
}
