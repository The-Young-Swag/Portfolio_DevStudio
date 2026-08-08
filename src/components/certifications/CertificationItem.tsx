type CertificationItemProps = {
    name: string;
    issuer: string;
    year: string;
};

export function CertificationItem({
    name,
    issuer,
    year,
}: CertificationItemProps) {
    return (
        <article className="flex flex-col gap-2 border-b border-neutral-200 py-5 last:border-b-0 md:flex-row md:items-center md:justify-between">
            <div>
                <h3 className="font-medium">
                    {name}
                </h3>

                <p className="mt-1 text-sm text-neutral-500">
                    {issuer}
                </p>
            </div>

            <span className="text-sm text-neutral-500">
                {year}
            </span>
        </article>
    );
}