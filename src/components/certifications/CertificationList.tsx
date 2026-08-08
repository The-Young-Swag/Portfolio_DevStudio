import { certifications } from "@/constants/certifications";
import { CertificationItem } from "./CertificationItem";

export function CertificationList() {
    return (
        <div>
            {certifications.map((certification) => (
                <CertificationItem
                    key={`${certification.issuer}-${certification.name}`}
                    {...certification}
                />
            ))}
        </div>
    );
}