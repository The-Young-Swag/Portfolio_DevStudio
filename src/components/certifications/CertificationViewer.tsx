import { useState } from "react";

import { ImageLightbox, ImagePlaceholder } from "@/components/ui";
import type { Certification } from "@/services/certifications/certifications";
import { CertImage } from "./CertImage";
import { safeHttpUrl } from "./certificationUrls";
import { PdfEmbed } from "./PdfEmbed";

type CertificationViewerProps = {
    certification: Pick<Certification, "image" | "name" | "pdf">;
};

/**
 * Certificate-first viewer. The image renders whole at its natural
 * ratio on a neutral stage; the stage belongs to the layout, never to
 * the image. A missing or broken image falls through to the PDF
 * preview, then to the placeholder — never to an enlarge button with
 * nothing inside. PDFs get the interactive document preview plus an
 * explicit open action.
 */
export function CertificationViewer({ certification }: CertificationViewerProps) {
    const [imageZoom, setImageZoom] = useState(false);
    const [failedSrc, setFailedSrc] = useState<string | null>(null);

    const source = safeHttpUrl(certification.image);
    const image = source === "" || failedSrc === source ? "" : source;
    const pdf = safeHttpUrl(certification.pdf);
    const alt = `${certification.name} certificate`;

    if (image === "" && pdf === "") {
        return (
            <figure aria-label="Certificate">
                <div className="surface-stage flex w-full items-center justify-center rounded-2xl p-6">
                    <ImagePlaceholder className="aspect-[4/3] w-full max-w-md rounded-lg" />
                </div>
            </figure>
        );
    }

    return (
        <figure aria-label="Certificate">
            {image !== "" ? (
                <button
                    type="button"
                    onClick={() => setImageZoom(true)}
                    aria-label={`Enlarge image: ${alt}`}
                    className="
                        surface-stage
                        block
                        min-h-64
                        w-full
                        cursor-zoom-in
                        rounded-2xl
                        p-4
                        min-[400px]:p-6
                        focus-visible:outline-none
                        focus-visible:ring-2
                        focus-visible:ring-(--accent-strong)
                    "
                >
                    <span className="flex items-center justify-center">
                        <CertImage
                            src={image}
                            alt={alt}
                            eager
                            onUnavailable={() => setFailedSrc(source)}
                            placeholderClassName="aspect-[4/3] w-full max-w-md rounded-lg"
                            imageClassName="rounded-[3px] shadow-[0_18px_34px_-16px_rgba(30,30,60,0.45),0_2px_6px_rgba(30,30,60,0.12)]"
                        />
                    </span>

                    <span
                        aria-hidden="true"
                        className="mt-3 hidden font-mono text-[11px] text-(--graphite-soft) [@media(hover:hover)]:block"
                    >
                        ⤢ Enlarge
                    </span>
                </button>
            ) : (
                <div className="min-w-0">
                    <PdfEmbed
                        src={pdf}
                        title={alt}
                        interactive
                        className="h-[min(70vh,42rem)] w-full overflow-hidden rounded-2xl bg-white"
                    />

                    <p className="mt-2 font-mono text-[11px] text-(--graphite-soft)">
                        <a
                            href={pdf}
                            target="_blank"
                            rel="noreferrer"
                            className="text-(--accent-strong) hover:underline"
                        >
                            Open PDF ↗
                        </a>
                    </p>
                </div>
            )}

            {imageZoom && image !== "" && (
                <ImageLightbox src={image} alt={alt} onClose={() => setImageZoom(false)} />
            )}
        </figure>
    );
}
