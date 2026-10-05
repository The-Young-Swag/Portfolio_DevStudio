import { Check, Download, ShieldCheck } from "lucide-react";

import type { Certification } from "@/services/certifications/certifications";
import { CertificationGallery, type GalleryShot } from "./CertificationGallery";
import { CertificationInfoCard } from "./CertificationInfoCard";
import { certPanelId } from "./certificationIds";
import { VerificationBadge } from "./VerificationBadge";

function buildShots(certification: Certification): GalleryShot[] {
    const shots: GalleryShot[] = [];

    if (certification.image !== "") {
        shots.push({ url: certification.image, caption: "Certificate" });
    }

    if (certification.badge_image !== "") {
        shots.push({
            url: certification.badge_image,
            caption: `${certification.issuer} badge`,
            href: certification.badge_link !== "" ? certification.badge_link : undefined,
        });
    }

    return shots;
}

function CourseLinks({ course }: { course: Certification }) {
    if (course.link === "" && course.pdf === "") {
        return null;
    }

    return (
        <span className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1">
            {course.link !== "" && (
                <a
                    href={course.link}
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono text-[11px] text-(--accent-strong) hover:underline"
                >
                    Verify ↗
                </a>
            )}

            {course.pdf !== "" && (
                <a
                    href={course.pdf}
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono text-[11px] text-(--accent-strong) hover:underline"
                >
                    Certificate PDF ↗
                </a>
            )}
        </span>
    );
}

type CertificationDetailProps = {
    certification: Certification;
    courses: Certification[];
    tabId: string | null;
};

export function CertificationDetail({
    certification,
    courses,
    tabId,
}: CertificationDetailProps) {
    const shots = buildShots(certification);
    const hasVerify = certification.link !== "";
    const hasPdf = certification.pdf !== "";

    return (
        <article
            id={certPanelId(certification.id)}
            role={tabId === null ? undefined : "tabpanel"}
            aria-labelledby={tabId ?? undefined}
            aria-label={tabId === null ? certification.name : undefined}
            tabIndex={tabId === null ? undefined : 0}
            className="@container min-w-0"
        >
            <header className="flex flex-wrap items-end justify-between gap-5">
                <div className="min-w-0 flex-1 basis-96">
                    <div className="mb-3 flex flex-wrap items-center gap-2.5">
                        <VerificationBadge certification={certification} />

                        {certification.credential !== "" && (
                            <span className="whitespace-nowrap rounded-full border border-(--glass-border) bg-(--glass-bg) px-2.5 py-1 font-mono text-[11px] text-(--graphite)">
                                {certification.credential}
                            </span>
                        )}
                    </div>

                    <h2 className="mb-3 break-words font-display text-[clamp(1.875rem,4.5cqi,2.875rem)] font-semibold leading-[1.1] tracking-tight text-(--ink)">
                        {certification.name}
                    </h2>
                </div>

                {(hasVerify || hasPdf) && (
                    <div className="flex flex-wrap gap-2.5">
                        {hasVerify && (
                            <a
                                href={certification.link}
                                target="_blank"
                                rel="noreferrer"
                                className="
                                    inline-flex
                                    items-center
                                    gap-2
                                    rounded-[0.875rem]
                                    bg-(--accent-strong)
                                    px-4
                                    py-2.5
                                    text-[13.5px]
                                    font-medium
                                    text-white
                                    transition-colors
                                    duration-150
                                    hover:bg-(--accent-deep)
                                    focus-visible:outline-none
                                    focus-visible:ring-2
                                    focus-visible:ring-(--accent-strong)
                                "
                            >
                                <ShieldCheck size={16} strokeWidth={2} aria-hidden="true" />
                                Verify credential
                            </a>
                        )}

                        {hasPdf && (
                            <a
                                href={certification.pdf}
                                download
                                className="
                                    inline-flex
                                    items-center
                                    gap-2
                                    rounded-[0.875rem]
                                    border
                                    border-(--glass-border)
                                    bg-(--glass-bg)
                                    px-4
                                    py-2.5
                                    text-[13.5px]
                                    font-medium
                                    text-(--ink)
                                    transition-colors
                                    duration-150
                                    hover:border-(--accent-strong)
                                    focus-visible:outline-none
                                    focus-visible:ring-2
                                    focus-visible:ring-(--accent-strong)
                                "
                            >
                                <Download size={16} strokeWidth={2} aria-hidden="true" />
                                Download PDF
                            </a>
                        )}
                    </div>
                )}
            </header>

            {shots.length > 0 && (
                <div className="mt-8">
                    <CertificationGallery title={certification.name} shots={shots} />
                </div>
            )}

            <div className="mt-8 grid gap-8 @aside:grid-cols-[minmax(0,1fr)_19rem] @aside:gap-12">
                <div className="min-w-0 space-y-10">
                    {courses.length > 0 && (
                        <section aria-label="Courses">
                            <h3 className="mb-3 font-display text-[22px] text-(--ink)">
                                Courses
                            </h3>

                            <ul className="space-y-4">
                                {courses.map((course) => (
                                    <li key={course.id} className="flex min-w-0 gap-3">
                                        <Check
                                            size={20}
                                            strokeWidth={2}
                                            aria-hidden="true"
                                            className="mt-0.5 shrink-0 text-(--accent-strong)"
                                        />

                                        <span className="min-w-0">
                                            <span className="block break-words text-[15px] leading-relaxed text-(--graphite)">
                                                {course.name}
                                            </span>

                                            {(course.issuer !== "" ||
                                                course.year !== "") && (
                                                <span className="mt-0.5 block truncate font-mono text-[11px] text-(--graphite-soft)">
                                                    {[course.issuer, course.year]
                                                        .filter((part) => part !== "")
                                                        .join(" · ")}
                                                </span>
                                            )}

                                            <CourseLinks course={course} />
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}
                </div>

                <div className="order-first min-w-0 @aside:order-none">
                    <CertificationInfoCard certification={certification} />
                </div>
            </div>
        </article>
    );
}
