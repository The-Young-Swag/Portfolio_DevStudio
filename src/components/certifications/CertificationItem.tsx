import clsx from "clsx";

type CertificationAccent = "blue" | "purple" | "viridian";

type CertificationItemProps = {
    name: string;
    issuer: string;
    year: string;
    credential: string;
    badge: string;
    code: string;
    accent: CertificationAccent;
    className?: string;
};

const BADGE_GRADIENTS: Record<CertificationAccent, string> = {
    blue: "from-[#209dd7] to-[#1672a8]",
    purple: "from-[#753991] to-[#4c2164]",
    viridian: "from-[#34d399] to-[#047857]",
};

export function CertificationItem({
    name,
    issuer,
    year,
    credential,
    badge,
    code,
    accent,
    className,
}: CertificationItemProps) {
    return (
        <article
            className={clsx(
                "group w-[260px] shrink-0 overflow-hidden rounded-2xl border border-(--glass-border) bg-(--glass-bg) shadow-[inset_0_1px_0_var(--glass-highlight),0_10px_30px_-20px_rgba(31,38,135,0.12)] backdrop-blur-xl backdrop-saturate-160 transition-colors duration-150 hover:border-(--accent-strong)",
                className,
            )}
        >
            {/* Credential tile — a monogram header, kin to the project
                thumbnails but with its own identity (a branded tile
                instead of a screenshot). */}
            <div
                className={clsx(
                    "relative flex h-28 items-center justify-center border-b border-(--line) bg-gradient-to-br",
                    BADGE_GRADIENTS[accent],
                )}
            >
                <span className="font-display text-[30px] font-semibold tracking-tight text-white/95 drop-shadow-[0_2px_6px_rgba(0,0,0,0.25)]">
                    {badge}
                </span>

                <span className="absolute right-2.5 top-2.5 rounded-full border border-white/25 bg-black/20 px-2 py-0.5 font-mono text-[9.5px] tracking-wider text-white backdrop-blur-md">
                    {code}
                </span>
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
            </div>
        </article>
    );
}