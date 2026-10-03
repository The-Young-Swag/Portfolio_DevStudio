import clsx from "clsx";

import { ContentImage } from "@/components/ui";

type CertificationItemProps = {
    name: string;
    issuer: string;
    year: string;
    credential: string;
    badge: string;
    code: string;
    image: string;
    link: string;
    className?: string;
};

export function CertificationItem({
    name,
    issuer,
    year,
    credential,
    badge,
    code,
    image,
    link,
    className,
}: CertificationItemProps) {
    return (
        <article
            className={clsx(
                "group w-[260px] shrink-0 overflow-hidden rounded-2xl border border-(--glass-border) bg-(--glass-bg) shadow-[inset_0_1px_0_var(--glass-highlight),0_10px_30px_-20px_rgba(31,38,135,0.12)] backdrop-blur-xl backdrop-saturate-160 transition-colors duration-150 hover:border-(--accent-strong)",
                className,
            )}
        >
            <div className="relative h-28 overflow-hidden border-b border-(--line)">
                <ContentImage
                    src={image}
                    alt={`${name} certificate`}
                    imageClassName="absolute inset-0 h-full w-full object-cover"
                    placeholderClassName="absolute inset-0"
                />

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

                {link !== "" && (
                    <a
                        href={link}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-3 inline-block font-mono text-[11px] text-(--accent-strong) hover:underline"
                    >
                        Verify ↗
                    </a>
                )}
            </div>
        </article>
    );
}