import { useEffect, useState } from "react";

import {
    topLevelCertifications,
    type Certification,
} from "@/services/certifications/certifications";
import { CertificationDetail } from "./CertificationDetail";
import { CertificationRail } from "./CertificationRail";
import { ImageLightbox } from "@/components/ui";
import { PdfLightbox } from "./PdfLightbox";
import { certTabId } from "./certificationIds";
import { safeHttpUrl } from "./certificationUrls";

function idFromHash(): number | null {
    const match = window.location.hash.match(/^#certification-(\d+)$/);

    if (!match) {
        return null;
    }

    const id = Number(match[1]);

    return Number.isInteger(id) ? id : null;
}

export function CertificationShowcase({
    certifications,
}: {
    certifications: Certification[];
}) {
    const [selectedId, setSelectedId] = useState<number | null>(() => idFromHash());
    const [expanded, setExpanded] = useState<Certification | null>(null);

    const childrenByParent = new Map<number, Certification[]>();

    for (const certification of certifications) {
        if (certification.parent_id === null) {
            continue;
        }

        const siblings = childrenByParent.get(certification.parent_id) ?? [];
        siblings.push(certification);
        childrenByParent.set(certification.parent_id, siblings);
    }

    const listed = topLevelCertifications(certifications);

    const selected = listed.find((certification) => certification.id === selectedId) ?? null;
    const active = selected ?? listed[0] ?? null;
    const expandedImage = expanded ? safeHttpUrl(expanded.image) : "";
    const expandedPdf = expanded ? safeHttpUrl(expanded.pdf) : "";

    useEffect(() => {
        function handleHashChange() {
            const id = idFromHash();

            if (id === null) {
                return;
            }

            setSelectedId(id);
        }

        window.addEventListener("hashchange", handleHashChange);

        return () => {
            window.removeEventListener("hashchange", handleHashChange);
        };
    }, []);

    function select(id: number) {
        setSelectedId(id);
        window.history.replaceState(null, "", `#certification-${id}`);
    }

    if (active === null) {
        return null;
    }

    return (
        <div>
            <CertificationRail
                certifications={listed}
                selectedId={active.id}
                onSelect={select}
                onExpand={setExpanded}
            />

            <div className="mt-2 min-w-0">
                <CertificationDetail
                    key={active.id}
                    certification={active}
                    courses={childrenByParent.get(active.id) ?? []}
                    tabId={certifications.length === 1 ? null : certTabId(active.id)}
                />
            </div>

            {expanded !== null && expandedImage !== "" && (
                <ImageLightbox
                    src={expandedImage}
                    alt={`${expanded.name} certificate`}
                    onClose={() => setExpanded(null)}
                />
            )}

            {expanded !== null && expandedImage === "" && expandedPdf !== "" && (
                <PdfLightbox
                    src={expandedPdf}
                    title={`${expanded.name} certificate`}
                    onClose={() => setExpanded(null)}
                />
            )}
        </div>
    );
}
