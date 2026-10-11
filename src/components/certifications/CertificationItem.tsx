import { ContentImage, MediaFrame } from "@/components/ui";
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
 * Cardless home tile mirroring the certificate page rail: one unified
 * frame, title and issuer below, badges kept. No card chrome.
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
    const previewable = onPreview !== undefined && (safeImage !== "" || safePdf !== "");

    const frame = (
        <MediaFrame
            src={safeImage}
            alt={`${name} certificate`}
            ratio="4/3"
            fit="blur-contain"
            name={name}
            label={issuer}
            pdf={
                safePdf !== "" ? (
                    <span
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 overflow-hidden"
                    >
                        <PdfEmbed
                            src={safePdf}
                            title=""
                            className="pointer-events-none h-full w-full"
                        />
                    </span>
                ) : undefined
            }
        />
    );

    return (
        <article
            className={`
                group
                tile-lift
                flex
                h-full
                min-w-0
                flex-col
                ${className ?? ""}
            `}
        >
            {previewable ? (
                <button
                    type="button"
                    onClick={onPreview}
                    aria-label={`Preview ${name}`}
                    className="
                        relative
                        block
                        w-full
                        cursor-zoom-in
                        focus-visible:outline-none
                        focus-visible:ring-2
                        focus-visible:ring-(--accent-strong)
                    "
                >
                    {frame}

                    <span
                        aria-hidden="true"
                        className="tile-expand absolute bottom-2.5 right-2.5 rounded-full bg-black/55 px-2 py-0.5 font-mono text-[10px] text-white"
                    >
                        ⤢
                    </span>
                </button>
            ) : (
                frame
            )}

            <div className="flex min-w-0 flex-1 flex-col px-1 pt-3.5">
                <h3 className="tile-title block break-words font-display text-[18px] font-medium leading-[1.3] text-(--ink)">
                    {name}
                </h3>

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

                {meta !== "" && (
                    <p className="mb-1 mt-auto truncate pt-2 text-[12.5px] text-(--graphite)">
                        {meta}
                    </p>
                )}
            </div>
        </article>
    );
}
