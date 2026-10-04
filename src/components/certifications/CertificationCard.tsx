import { useId, useState } from "react";

import type { Certification } from "@/services/certifications/certifications";
import { ImageLightbox } from "@/components/ui";
import { CertificationItem } from "./CertificationItem";

type CertificationCardProps = {
    certification: Certification;
    courses?: Certification[];
};

const actionClassName =
    "font-mono text-[11px] text-(--accent-strong) hover:underline";

function ChildButtons({ certification }: { certification: Certification }) {
    const [lightboxOpen, setLightboxOpen] = useState(false);

    const hasPdf = certification.pdf !== "";
    const hasImage = certification.image !== "";
    const hasVerify = certification.link !== "";

    return (
        <>
            {hasPdf && (
                <>
                    <a
                        href={certification.pdf}
                        target="_blank"
                        rel="noreferrer"
                        className={actionClassName}
                    >
                        View certificate ↗
                    </a>
                    <a
                        href={certification.pdf}
                        download
                        className={actionClassName}
                    >
                        Download
                    </a>
                </>
            )}

            {!hasPdf && hasImage && (
                <button
                    type="button"
                    onClick={() => setLightboxOpen(true)}
                    className={actionClassName}
                >
                    View certificate
                </button>
            )}

            {hasVerify && (
                <a
                    href={certification.link}
                    target="_blank"
                    rel="noreferrer"
                    className={actionClassName}
                >
                    Verify ↗
                </a>
            )}

            {lightboxOpen && hasImage && (
                <ImageLightbox
                    src={certification.image}
                    alt={`${certification.name} certificate`}
                    onClose={() => setLightboxOpen(false)}
                />
            )}
        </>
    );
}

export function CertificationCard({
    certification,
    courses = [],
}: CertificationCardProps) {
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const childrenId = useId();

    const hasPdf = certification.pdf !== "";
    const hasImage = certification.image !== "";
    const hasVerify = certification.link !== "";

    return (
        <>
            <CertificationItem
                {...certification}
                className="w-full"
                actions={
                    <>
                        {hasPdf && (
                            <>
                                <a
                                    href={certification.pdf}
                                    target="_blank"
                                    rel="noreferrer"
                                    className={actionClassName}
                                >
                                    View certificate ↗
                                </a>
                                <a
                                    href={certification.pdf}
                                    download
                                    className={actionClassName}
                                >
                                    Download
                                </a>
                            </>
                        )}

                        {!hasPdf && hasImage && (
                            <button
                                type="button"
                                onClick={() => setLightboxOpen(true)}
                                className={actionClassName}
                            >
                                View certificate
                            </button>
                        )}

                        {hasVerify && (
                            <a
                                href={certification.link}
                                target="_blank"
                                rel="noreferrer"
                                className={actionClassName}
                            >
                                Verify ↗
                            </a>
                        )}

                        {courses.length > 0 && (
                            <div className="mt-1 w-full">
                                <button
                                    type="button"
                                    aria-expanded={expanded}
                                    aria-controls={childrenId}
                                    onClick={() => setExpanded((open) => !open)}
                                    className="
                                        flex
                                        min-h-[44px]
                                        w-full
                                        items-center
                                        justify-between
                                        gap-2
                                        font-mono
                                        text-[11px]
                                        text-(--graphite)
                                        transition-colors
                                        duration-150
                                        hover:text-(--accent-strong)
                                        focus-visible:outline-none
                                        focus-visible:ring-2
                                        focus-visible:ring-(--accent-strong)
                                    "
                                >
                                    <span>
                                        {expanded ? "Hide" : "Show"} {courses.length}{" "}
                                        {courses.length === 1 ? "course" : "courses"}
                                    </span>

                                    <span
                                        aria-hidden="true"
                                        className={`
                                            inline-block
                                            transition-transform
                                            duration-200
                                            motion-reduce:transition-none
                                            ${expanded ? "rotate-180" : ""}
                                        `}
                                    >
                                        ↓
                                    </span>
                                </button>

                                <div
                                    id={childrenId}
                                    className={`
                                        grid
                                        transition-[grid-template-rows]
                                        duration-300
                                        ease-out
                                        motion-reduce:transition-none
                                        ${expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}
                                    `}
                                >
                                    <ul className="min-h-0 overflow-hidden">
                                        {courses.map((course) => (
                                            <li
                                                key={course.id}
                                                className="border-t hairline py-3 first:mt-3"
                                            >
                                                <p className="font-display text-[14px] font-medium leading-snug text-(--ink)">
                                                    {course.name}
                                                </p>

                                                <p className="mt-1 font-mono text-[10.5px] text-(--graphite-soft)">
                                                    {course.issuer} · {course.year}
                                                </p>

                                                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                                                    <ChildButtons certification={course} />
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}
                    </>
                }
            />

            {lightboxOpen && hasImage && (
                <ImageLightbox
                    src={certification.image}
                    alt={`${certification.name} certificate`}
                    onClose={() => setLightboxOpen(false)}
                />
            )}
        </>
    );
}
