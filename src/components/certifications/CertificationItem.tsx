import clsx from "clsx";

type CertificationItemProps = {
    name: string;
    issuer: string;
    year: string;
    credential: string;
    className?: string;
};

export function CertificationItem({
    name,
    issuer,
    year,
    credential,
    className,
}: CertificationItemProps) {
    return (
        <article
            className={clsx(
                "group w-[260px] shrink-0 rounded-2xl border border-(--glass-border) bg-(--glass-bg) p-5 shadow-[inset_0_1px_0_var(--glass-highlight),0_10px_30px_-20px_rgba(31,38,135,0.12)] backdrop-blur-xl backdrop-saturate-160 transition-colors duration-150 hover:border-(--accent-strong)",
                className,
            )}
        >
            <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-(--graphite-soft)">
                {year} · {credential}
            </p>

            <h3 className="mt-3 font-display text-[16px] font-medium leading-snug text-(--ink)">
                {name}
            </h3>

            <p className="mt-2 font-mono text-[11px] leading-relaxed text-(--graphite)">
                {issuer}
            </p>
        </article>
    );
}