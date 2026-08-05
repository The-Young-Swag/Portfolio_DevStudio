type StatCardProps = {
    label: string;
    value: string;
};

export function StatCard({
    label,
    value,
}: StatCardProps) {
    return (
        <article
            className="
                rounded-xl
                border
                border-neutral-200
                p-4
            "
        >
            <p className="text-sm text-neutral-500">
                {label}
            </p>

            <p className="mt-2 text-lg font-semibold">
                {value}
            </p>
        </article>
    );
}