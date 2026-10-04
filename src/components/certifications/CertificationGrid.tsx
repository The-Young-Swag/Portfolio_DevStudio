import type { Certification } from "@/services/certifications/certifications";
import { CertificationCard } from "./CertificationCard";

type CertificationGridProps = {
    certifications: Certification[];
};

export function CertificationGrid({ certifications }: CertificationGridProps) {
    const childrenByParent = new Map<number, Certification[]>();

    for (const certification of certifications) {
        if (certification.parent_id === null) {
            continue;
        }

        const siblings = childrenByParent.get(certification.parent_id) ?? [];
        siblings.push(certification);
        childrenByParent.set(certification.parent_id, siblings);
    }

    const topLevel = certifications.filter(
        (certification) => certification.parent_id === null,
    );
    const orphans = certifications.filter(
        (certification) =>
            certification.parent_id !== null &&
            !certifications.some((parent) => parent.id === certification.parent_id),
    );

    return (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...topLevel, ...orphans].map((certification) => (
                <CertificationCard
                    key={certification.id}
                    certification={certification}
                    courses={childrenByParent.get(certification.id) ?? []}
                />
            ))}
        </div>
    );
}