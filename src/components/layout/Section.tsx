import type { PropsWithChildren } from "react";
import clsx from "clsx";

type SectionProps = PropsWithChildren<{
    id?: string;
    className?: string;
}>;

export function Section({
    children,
    id,
    className,
}: SectionProps) {
    return (
        <section
            id={id}
            className={clsx("scroll-mt-10", className)}
        >
            {children}
        </section>
    );
}