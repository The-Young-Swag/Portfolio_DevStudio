import clsx from "clsx";
import type { PropsWithChildren } from "react";

type TextProps = PropsWithChildren<{
    className?: string;
}>;

export function Text({
    children,
    className,
}: TextProps) {
    return (
        <p
            className={clsx(
                "text-base leading-7 text-neutral-700 dark:text-neutral-300",
                className,
            )}
        >
            {children}
        </p>
    );
}