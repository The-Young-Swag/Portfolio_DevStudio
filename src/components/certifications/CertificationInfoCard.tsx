import type { Certification } from "@/services/certifications/certifications";

type CertificationInfoCardProps = {
    certification: Pick<
        Certification,
        "issuer" | "year" | "code"
    >;
};

export function CertificationInfoCard({ certification }: CertificationInfoCardProps) {
    const rows = [
        { label: "Issuer", value: certification.issuer },
        { label: "Issued", value: certification.year },
        { label: "Credential ID", value: certification.code, mono: true },
    ].filter((row) => row.value !== "");

    if (rows.length === 0) {
        return null;
    }

    return (
        <div
            className="
                rounded-2xl
                border
                border-(--glass-border)
                bg-(--glass-bg)
                p-6
                shadow-[inset_0_1px_0_var(--glass-highlight)]
                backdrop-blur-xl
                backdrop-saturate-160
                @aside:sticky
                @aside:top-6
                @aside:self-start
            "
        >
            <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-(--graphite-soft)">
                Certificate info
            </p>

            <dl className="mt-4">
                {rows.map((row) => (
                    <div key={row.label} className="mb-3.5 last:mb-0">
                        <dt className="font-mono text-[11px] text-(--graphite-soft)">
                            {row.label}
                        </dt>
                        <dd
                            className={
                                row.mono === true
                                    ? "mt-0.5 break-words font-mono text-[13px] text-(--ink)"
                                    : "mt-0.5 break-words text-[14px] text-(--ink)"
                            }
                        >
                            {row.value}
                        </dd>
                    </div>
                ))}
            </dl>
        </div>
    );
}
