import type { Certification } from "@/services/certifications/certifications";
import { CertificationItem } from "./CertificationItem";

type CertificationGridProps = {
    certifications: Certification[];
};

export function CertificationGrid({ certifications }: CertificationGridProps) {
    return (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {certifications.map((certification) => (
                <CertificationItem
                    key={certification.id}
                    className="w-full"
                    {...certification}
                />
            ))}
        </div>
    );
}