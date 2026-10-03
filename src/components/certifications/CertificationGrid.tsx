import type { Certification } from "@/services/certifications/certifications";
import { CertificationCard } from "./CertificationCard";

type CertificationGridProps = {
    certifications: Certification[];
};

export function CertificationGrid({ certifications }: CertificationGridProps) {
    return (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {certifications.map((certification) => (
                <CertificationCard
                    key={certification.id}
                    certification={certification}
                />
            ))}
        </div>
    );
}