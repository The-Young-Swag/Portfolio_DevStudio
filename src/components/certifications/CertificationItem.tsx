import clsx from "clsx";
import type { ReactNode } from "react";
import { Expand } from "lucide-react";

import { ContentImage, ImagePlaceholder } from "@/components/ui";
import { PdfEmbed } from "./PdfEmbed";

type CertificationItemProps = {
    name: string;
    issuer: string;
    year: string;
    credential: string;
    badge: string;
    code: string;
    image: string;
    pdf: string;
    badge_image: string;
    badge_link: string;
    className?: string;
    actions?: ReactNode;
    onPreview?: () => void;
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
    badge_image,
    badge_link,
    className,
    actions,
    onPreview,
}: CertificationItemProps) {
    return (
        <article
            className={clsx(
                "group flex h-full w-full flex-col overflow-hidden rounded-2xl border border-(--glass-border) bg-(--glass-bg) shadow-[inset_0_1px_0_var(--glass-highlight),0_10px_30px_-20px_rgba(31,38,135,0.12)] transition-colors duration-150 hover:border-(--accent-strong)",
                className,
            )}
        >
            <div className="relative h-36 overflow-hidden border-b border-(--line)">
                {image !== "" ? (
                    <ContentImage
                        src={image}
                        alt={`${name} certificate`}
                        imageClassName="absolute inset-0 h-full w-full object-cover"
                        placeholderClassName="absolute inset-0"
                    />
                ) : pdf !== "" ? (
                    <span aria-hidden="true" className="absolute inset-0 overflow-hidden">
                        <PdfEmbed
                            src={pdf}
                            title=""
                            className="pointer-events-none h-full w-full"
                        />
                    </span>
                ) : (
                    <ImagePlaceholder className="absolute inset-0" />
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

                {image === "" && pdf !== "" && onPreview !== undefined && (
                    <button
                        type="button"
                        onClick={onPreview}
                        aria-label={`Preview ${name} PDF`}
                        className="
                            absolute
                            bottom-2.5
                            right-2.5
                            inline-flex
                            items-center
                            gap-1.5
                            rounded-full
                            border
                            border-white/20
                            bg-black/30
                            px-2.5
                            py-1
                            font-mono
                            text-[9.5px]
                            tracking-wider
                            text-white
                            backdrop-blur-md
                            transition-colors
                            duration-150
                            hover:bg-black/55
                            focus-visible:outline-none
                            focus-visible:ring-2
                            focus-visible:ring-white
                        "
                    >
                        <Expand size={11} strokeWidth={2} aria-hidden="true" />
                        Preview
                    </button>
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

                {badge_image !== "" && (
                    <div className="mt-3">
                        {badge_link !== "" ? (
                            <a href={badge_link} target="_blank" rel="noreferrer">
                                <ContentImage
                                    src={badge_image}
                                    alt={`${issuer} badge`}
                                    imageClassName="h-8 w-auto rounded-md border border-(--line) object-contain"
                                    placeholderClassName="h-8 w-8 rounded-md border border-(--line)"
                                />
                            </a>
                        ) : (
                            <ContentImage
                                src={badge_image}
                                alt={`${issuer} badge`}
                                imageClassName="h-8 w-auto rounded-md border border-(--line) object-contain"
                                placeholderClassName="h-8 w-8 rounded-md border border-(--line)"
                            />
                        )}
                    </div>
                )}

                {actions !== undefined && (
                    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2">{actions}</div>
                )}
            </div>
        </article>
    );
}