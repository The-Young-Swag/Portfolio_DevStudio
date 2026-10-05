import type { Certification } from "@/services/certifications/certifications";

export function VerificationBadge({
    certification,
    onCover = false,
}: {
    certification: Pick<Certification, "link">;
    onCover?: boolean;
}) {
    const verifiable = certification.link !== "";

    if (onCover) {
        return (
            <span
                className="
                    inline-flex
                    items-center
                    gap-1.5
                    whitespace-nowrap
                    rounded-full
                    border
                    border-white/20
                    bg-black/30
                    px-2
                    py-0.5
                    font-mono
                    text-[9.5px]
                    tracking-wider
                    text-white
                    backdrop-blur-md
                "
            >
                <span
                    aria-hidden="true"
                    className={`
                        h-2
                        w-2
                        shrink-0
                        rounded-full
                        ${verifiable ? "bg-(--accent-strong)" : "bg-white/60"}
                    `}
                />
                {verifiable ? "Verifiable" : "Certificate only"}
            </span>
        );
    }

    return (
        <span
            className={`
                inline-flex
                items-center
                gap-1.5
                whitespace-nowrap
                rounded-full
                border
                px-2.5
                py-1
                font-mono
                text-[10.5px]
                ${
                    verifiable
                        ? "border-(--accent-strong)/50 text-(--accent-strong)"
                        : "border-(--line) text-(--graphite)"
                }
            `}
        >
            <span
                aria-hidden="true"
                className={`
                    h-2
                    w-2
                    shrink-0
                    rounded-full
                    ${verifiable ? "bg-(--accent-strong)" : "bg-(--graphite-soft)"}
                `}
            />
            {verifiable ? "Verifiable" : "Certificate only"}
        </span>
    );
}
