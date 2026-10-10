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
    credential: string;
    badge: string;
    code: string;
    image: string;
    pdf: string;
    badges: CertBadge[];
    className?: string;
    onPreview?: () => void;
    onBadgePreview?: (badge: CertBadge) => void;
};

export function CertificationItem({
    name,
    issuer,
    year,
    credential,
    badge,
    code,
    image,
    pdf,
    badges,
    className,
    onPreview,
    onBadgePreview,
}: CertificationItemProps) {
    const safeImage = safeHttpUrl(image);
    const safePdf = safeHttpUrl(pdf);
    const visual =
        safeImage !== "" ? (
            <span className="flex h-full w-full items-center justify-center p-3">
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

    return (
        <article
            className={clsx(
                "group flex h-full w-full flex-col overflow-hidden rounded-2xl border border-(--glass-border) bg-(--glass-bg) shadow-[inset_0_1px_0_var(--glass-highlight),0_10px_30px_-20px_rgba(31,38,135,0.12)] transition-colors duration-150 hover:border-(--accent-strong)",
                className,
            )}
        >
            <div className="relative h-36 overflow-hidden border-b border-(--line)">
                {onPreview !== undefined && (safeImage !== "" || safePdf !== "") ? (
                    <button
                        type="button"
                        onClick={onPreview}
                        aria-label={`Preview ${name}`}
                        className="
                            absolute
                            inset-0
                            block
                            h-full
                            w-full
                            cursor-zoom-in
                            focus-visible:outline-none
                            focus-visible:ring-2
                            focus-visible:ring-inset
                            focus-visible:ring-white
                        "
                    >
                        {visual}
                    </button>
                ) : (
                    visual
                )}

                {badge !== "" && (
                    <span className="absolute left-2.5 top-2.5 rounded-full border border-white/20 bg-black/30 px-2 py-0.5 font-mono text-[9.5px] tracking-wider text-white backdrop-blur-md">
                        {badge}
                    </span>
                )}

                {code !== "" && (
                    <span className="absolute right-2.5 top-2.5 rounded-full border border-white/20 bg-black/30 px-2 py-0.5 font-mono text-[9.5px] tracking-wider text-white backdrop-blur-md">
                        {code}
                    </span>
                )}
            </div>

            <div className="p-5">
                <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-(--graphite-soft)">
                    {year} · {credential}
                </p>

                <h3 className="mt-2.5 font-display text-[16px] font-medium leading-snug text-(--ink)">
                    {name}
                </h3>

                <p className="mt-2 font-mono text-[11px] leading-relaxed text-(--graphite)">
                    {issuer}
                </p>

                {badges.length > 0 && (
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                        {badges.map((badgeItem, index) => (
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
                                            imageClassName="h-7 w-7 rounded-md border border-(--line) object-contain"
                                            placeholderClassName="h-7 w-7 rounded-md border border-(--line)"
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
                                            imageClassName="h-7 w-7 rounded-md border border-(--line) object-contain"
                                            placeholderClassName="h-7 w-7 rounded-md border border-(--line)"
                                        />
                                    </button>
                                ) : (
                                    <ContentImage
                                        src={badgeItem.src}
                                        alt={badgeItem.alt}
                                        imageClassName="h-7 w-7 rounded-md border border-(--line) object-contain"
                                        placeholderClassName="h-7 w-7 rounded-md border border-(--line)"
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