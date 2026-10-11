import clsx from "clsx";

import { ContentImage, ImagePlaceholder } from "@/components/ui";
import { safeHttpUrl } from "./certificationUrls";
import { PdfEmbed } from "./PdfEmbed";

export type CertBadge = {
    src: string;
    link: string;
    alt: string;
};

type CertificationItemProps = {
    name: string;
    issuer: string;
    year: string;
    image: string;
    pdf: string;
    badges: CertBadge[];
    className?: string;
    onPreview?: () => void;
    onBadgePreview?: (badge: CertBadge) => void;
};

/**
 * Cardless home tile mirroring the certificate page rail: the image
 * whole on a soft stage, title and issuer below, badges kept. No card
 * chrome, no overlay pills.
 */
export function CertificationItem({
    name,
    issuer,
    year,
    image,
    pdf,
    badges,
    className,
    onPreview,
    onBadgePreview,
}: CertificationItemProps) {
    const safeImage = safeHttpUrl(image);
    const safePdf = safeHttpUrl(pdf);
    const meta = [issuer, year].filter((part) => part !== "").join(" · ");
    const safeBadges = badges
        .map((badgeItem) => ({
            ...badgeItem,
            src: safeHttpUrl(badgeItem.src),
            link: safeHttpUrl(badgeItem.link),
        }))
        .filter((badgeItem) => badgeItem.src !== "");

    const visual =
        safeImage !== "" ? (
            <span className="flex h-full w-full items-center justify-center">
                <ContentImage
                    src={safeImage}
                    alt={`${name} certificate`}
                    imageClassName="h-auto max-h-full w-auto max-w-full rounded-[2px]"
                    placeholderClassName="h-full w-full"
                />
            </span>
        ) : safePdf !== "" ? (
            <span aria-hidden="true" className="absolute inset-0 overflow-hidden">
                <PdfEmbed
                    src={safePdf}
                    title=""
                    className="pointer-events-none h-full w-full"
                />
            </span>
        ) : (
            <ImagePlaceholder className="absolute inset-0" />
        );

    const stage = (
        <span className="surface-stage relative flex h-40 w-full items-center justify-center overflow-hidden rounded-2xl p-4">
            {visual}
        </span>
    );

    return (
        <article className={clsx("group min-w-0", className)}>
            {onPreview !== undefined && (safeImage !== "" || safePdf !== "") ? (
                <button
                    type="button"
                    onClick={onPreview}
                    aria-label={`Preview ${name}`}
                    className="
                        block
                        w-full
                        cursor-zoom-in
                        focus-visible:outline-none
                        focus-visible:ring-2
                        focus-visible:ring-(--accent-strong)
                    "
                >
                    {stage}
                </button>
            ) : (
                stage
            )}

            <div className="min-w-0 px-1 pt-3.5">
                <h3 className="line-clamp-2 break-words font-display text-[18px] font-medium leading-[1.3] text-(--ink)">
                    {name}
                </h3>

                {meta !== "" && (
                    <p className="mt-1 truncate text-[12.5px] text-(--graphite)">
                        {meta}
                    </p>
                )}

                {safeBadges.length > 0 && (
                    <div className="mt-2.5 flex flex-wrap items-center gap-2">
                        {safeBadges.map((badgeItem, index) => (
                            <span
                                key={`${badgeItem.src}-${index}`}
                                title={badgeItem.alt}
                                className="inline-flex"
                            >
                                {badgeItem.link !== "" ? (
                                    <a
                                        href={badgeItem.link}
                                        target="_blank"
                                        rel="noreferrer"
                                        aria-label={`${badgeItem.alt} (opens in a new tab)`}
                                        className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--accent-strong)"
                                    >
                                        <ContentImage
                                            src={badgeItem.src}
                                            alt={badgeItem.alt}
                                            imageClassName="h-7 w-7 rounded-md object-contain"
                                            placeholderClassName="h-7 w-7 rounded-md"
                                        />
                                    </a>
                                ) : onBadgePreview !== undefined ? (
                                    <button
                                        type="button"
                                        onClick={() => onBadgePreview(badgeItem)}
                                        aria-label={`Preview ${badgeItem.alt}`}
                                        className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--accent-strong)"
                                    >
                                        <ContentImage
                                            src={badgeItem.src}
                                            alt=""
                                            imageClassName="h-7 w-7 rounded-md object-contain"
                                            placeholderClassName="h-7 w-7 rounded-md"
                                        />
                                    </button>
                                ) : (
                                    <ContentImage
                                        src={badgeItem.src}
                                        alt={badgeItem.alt}
                                        imageClassName="h-7 w-7 rounded-md object-contain"
                                        placeholderClassName="h-7 w-7 rounded-md"
                                    />
                                )}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </article>
    );
}
