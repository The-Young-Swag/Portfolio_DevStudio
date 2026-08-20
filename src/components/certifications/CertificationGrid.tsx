import { certifications } from "@/constants/certifications";
import { CertificationItem } from "./CertificationItem";

export function CertificationGrid() {
    return (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {certifications.map((certification) => (
                <CertificationItem
                    key={`${certification.issuer}-${certification.name}`}
                    className="w-full"
                    {...certification}
                />
            ))}
        </div>
    );
}