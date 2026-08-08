type ExperienceItemProps = {
    role: string;
    company: string;
    period: string;
    description: string;
};

export function ExperienceItem({
    role,
    company,
    period,
    description,
}: ExperienceItemProps) {
    return (
        <article className="border-b border-neutral-200 py-6 last:border-b-0">
            <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                <div>
                    <h3 className="text-lg font-semibold">
                        {role}
                    </h3>

                    <p className="mt-1 text-sm text-neutral-500">
                        {company}
                    </p>
                </div>

                <p className="text-sm text-neutral-500">
                    {period}
                </p>
            </div>

            <p className="mt-4 max-w-2xl text-sm leading-6 text-neutral-600">
                {description}
            </p>
        </article>
    );
}