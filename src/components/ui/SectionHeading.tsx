type SectionHeadingProps = {
    number: string;
    title: string;
};

export function SectionHeading({
    number,
    title,
}: SectionHeadingProps) {
    return (
        <div className="mb-8">
            <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">
                {number}
            </p>

            <h2 className="mt-2 text-3xl font-bold uppercase tracking-tight">
                {title}
            </h2>
        </div>
    );
}