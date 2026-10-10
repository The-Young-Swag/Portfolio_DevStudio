import { useState } from "react";
import { Check, ShieldCheck } from "lucide-react";

import { ContentImage, ImageLightbox } from "@/components/ui";
import type { Certification } from "@/services/certifications/certifications";
import { certPanelId } from "./certificationIds";
import { linkHostname, safeHttpUrl, verifiableLink } from "./certificationUrls";
import { CertificationViewer } from "./CertificationViewer";

type CertificationDetailProps = {
    certification: Certification;
    courses: Certification[];
    tabId: string | null;
};

function factRows(certification: Certification) {
    return [
        { label: "Issued by", value: certification.issuer, mono: false },
        { label: "Via", value: certification.credential, mono: false },
        { label: "Issued", value: certification.year, mono: false },
        { label: "Credential ID", value: certification.code, mono: true },
        { label: "Badge", value: certification.badge, mono: false },
    ].filter((row) => row.value !== "");
}

function badgeItems(certification: Certification, courses: Certification[]) {
    return [certification, ...courses]
        .map((item) => ({
            src: safeHttpUrl(item.badge_image),
            link: safeHttpUrl(item.badge_link),
            alt: `${item.name} badge`,
        }))
        .filter((badge) => badge.src !== "");
}

function Facts({ certification }: { certification: Certification }) {
    const rows = factRows(certification);

    if (rows.length === 0) {
        return null;
    }

    return (
        <dl className="grid grid-cols-[repeat(auto-fit,minmax(9.5rem,1fr))] gap-x-8 gap-y-6">
            {rows.map((row) => (
                <div key={row.label} className="min-w-0">
                    <dt className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-(--graphite-soft)">
                        {row.label}
                    </dt>
                    <dd
                        className={
                            row.mono
                                ? "mt-1.5 break-words font-mono text-[13px] text-(--ink)"
                                : "mt-1.5 break-words text-[15px] font-medium text-(--ink)"
                        }
                    >
                        {row.value}
                    </dd>
                </div>
            ))}
        </dl>
    );
}

function Badges({
    certification,
    courses,
}: {
    certification: Certification;
    courses: Certification[];
}) {
    const [preview, setPreview] = useState<{ src: string; alt: string } | null>(null);

    const badges = badgeItems(certification, courses);

    if (badges.length === 0) {
        return null;
    }

    return (
        <div>
            <p className="mb-3 font-mono text-[10.5px] uppercase tracking-[0.14em] text-(--graphite-soft)">
                Badges
            </p>

            <div className="flex flex-wrap gap-2.5">
                {badges.map((badge, index) => {
                    const thumb = (
                        <ContentImage
                            src={badge.src}
                            alt={badge.link !== "" ? badge.alt : ""}
                            imageClassName="h-12 w-12 rounded-lg object-contain"
                            placeholderClassName="h-12 w-12 rounded-lg"
                        />
                    );

                    return (
                        <span key={`${badge.src}-${index}`} className="inline-flex">
                            {badge.link !== "" ? (
                                <a
                                    href={badge.link}
                                    target="_blank"
                                    rel="noreferrer"
                                    aria-label={`${badge.alt} (opens in a new tab)`}
                                    className="
                                        surface-stage
                                        block
                                        rounded-xl
                                        p-1.5
                                        focus-visible:outline-none
                                        focus-visible:ring-2
                                        focus-visible:ring-(--accent-strong)
                                    "
                                >
                                    {thumb}
                                </a>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => setPreview(badge)}
                                    aria-label={`Preview ${badge.alt}`}
                                    className="
                                        surface-stage
                                        block
                                        rounded-xl
                                        p-1.5
                                        focus-visible:outline-none
                                        focus-visible:ring-2
                                        focus-visible:ring-(--accent-strong)
                                    "
                                >
                                    {thumb}
                                </button>
                            )}
                        </span>
                    );
                })}
            </div>

            {preview !== null && (
                <ImageLightbox
                    src={preview.src}
                    alt={preview.alt}
                    onClose={() => setPreview(null)}
                />
            )}
        </div>
    );
}

function Courses({
    certification,
    courses,
}: {
    certification: Certification;
    courses: Certification[];
}) {
    if (courses.length === 0) {
        return null;
    }

    return (
        <section aria-label="Courses">
            <h3 className="font-display mb-4 text-[22px] text-(--ink)">Courses</h3>

            <ul className="space-y-4">
                {courses.map((course) => {
                    const link = verifiableLink(course.link);
                    const meta = [course.issuer || certification.issuer, course.year]
                        .filter((part) => part !== "")
                        .join(" · ");

                    return (
                        <li key={course.id} className="flex min-w-0 gap-3">
                            <span aria-hidden="true" className="cert-tick">
                                <Check size={11} strokeWidth={3} />
                            </span>

                            <span className="min-w-0">
                                <span className="block break-words text-[15px] leading-relaxed text-(--graphite)">
                                    {course.name}
                                </span>

                                {meta !== "" && (
                                    <span className="mt-0.5 block truncate font-mono text-[11px] text-(--graphite-soft)">
                                        {meta}
                                    </span>
                                )}

                                {link !== "" && (
                                    <span className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1">
                                        <a
                                            href={link}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="font-mono text-[11px] text-(--accent-strong) hover:underline"
                                        >
                                            Verify ↗
                                        </a>
                                    </span>
                                )}
                            </span>
                        </li>
                    );
                })}
            </ul>
        </section>
    );
}

/**
 * Cardless certificate detail, certificate first. The viewer column
 * follows the image's own ratio (capped to a share of the container);
 * everything else is label-led typography that collapses when empty.
 */
export function CertificationDetail({ certification, courses, tabId }: CertificationDetailProps) {
    const verify = verifiableLink(certification.link);
    const domain = verify === "" ? "" : linkHostname(verify);
    const showDetails =
        factRows(certification).length > 0 || badgeItems(certification, courses).length > 0;

    return (
        <article
            id={certPanelId(certification.id)}
            role={tabId === null ? undefined : "tabpanel"}
            aria-labelledby={tabId ?? undefined}
            aria-label={tabId === null ? certification.name : undefined}
            tabIndex={tabId === null ? undefined : 0}
            className="@container min-w-0"
        >
            <div className="grid gap-9 @cert:grid-cols-[minmax(0,min(26rem,45cqi))_minmax(0,1fr)] @cert:gap-x-16 @cert:gap-y-10">
                <header className="min-w-0 @cert:col-start-2">
                    {verify !== "" && (
                        <p className="mb-3 font-mono text-[11.5px] font-medium text-(--accent-strong)">
                            <span aria-hidden="true">✓ </span>Verifiable credential
                        </p>
                    )}

                    <h2 className="font-display mb-3 break-words text-[clamp(1.875rem,4.5cqi,2.875rem)] font-semibold leading-[1.1] tracking-tight text-(--ink)">
                        {certification.name}
                    </h2>

                    {verify !== "" && (
                        <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
                            <a
                                href={verify}
                                target="_blank"
                                rel="noreferrer"
                                className="
                                    inline-flex
                                    min-h-11
                                    items-center
                                    gap-2
                                    rounded-full
                                    bg-(--accent-strong)
                                    px-5
                                    py-2.5
                                    text-[13.5px]
                                    font-medium
                                    text-white
                                    transition-[filter]
                                    duration-150
                                    hover:brightness-110
                                    focus-visible:outline-none
                                    focus-visible:ring-2
                                    focus-visible:ring-(--accent-strong)
                                    focus-visible:ring-offset-2
                                "
                            >
                                <ShieldCheck size={16} strokeWidth={2} aria-hidden="true" />
                                Verify credential ↗
                            </a>

                            {domain !== "" && (
                                <span className="font-mono text-[11px] text-(--graphite-soft)">
                                    opens {domain}
                                </span>
                            )}
                        </div>
                    )}
                </header>

                <div className="min-w-0 @cert:col-start-1 @cert:row-span-3 @cert:row-start-1 @cert:self-start">
                    <div className="@cert:sticky @cert:top-6 [--cert-max-h:min(70vh,32rem)]">
                        <CertificationViewer certification={certification} />
                    </div>
                </div>

                {showDetails && (
                    <section
                        aria-label="Details"
                        className="min-w-0 space-y-8 @cert:col-start-2"
                    >
                        <Facts certification={certification} />
                        <Badges certification={certification} courses={courses} />
                    </section>
                )}

                <div className="min-w-0 @cert:col-start-2">
                    <Courses certification={certification} courses={courses} />
                </div>
            </div>
        </article>
    );
}
