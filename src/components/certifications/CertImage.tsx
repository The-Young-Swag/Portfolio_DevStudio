import { ContentImage } from "@/components/ui";

type CertImageProps = {
    src: string;
    alt: string;
    imageClassName?: string;
    placeholderClassName?: string;
    /** Above-the-fold viewers load eagerly instead of lazily. */
    eager?: boolean;
    /** Fires when the source is missing or fails to decode. */
    onUnavailable?: () => void;
};

/**
 * A certificate image at its true proportions. The image decides its
 * own size inside a neutral stage: width and height stay automatic,
 * bounded only by the stage (`--cert-max-h`) and its own width, so it
 * is never cropped, stretched, or upscaled past its natural size.
 * Missing or broken sources fall back to the neutral placeholder.
 */
export function CertImage({
    src,
    alt,
    imageClassName,
    placeholderClassName,
    eager = false,
    onUnavailable,
}: CertImageProps) {
    return (
        <ContentImage
            src={src}
            alt={alt}
            loading={eager ? "eager" : "lazy"}
            onUnavailable={onUnavailable}
            imageClassName={`
                block
                h-auto
                w-auto
                max-w-full
                max-h-[var(--cert-max-h,20rem)]
                ${imageClassName ?? ""}
            `}
            placeholderClassName={placeholderClassName ?? "h-full w-full"}
        />
    );
}
