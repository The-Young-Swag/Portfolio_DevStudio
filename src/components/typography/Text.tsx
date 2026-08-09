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
                "text-base leading-7",
                className,
            )}
        >
            {children}
        </p>
    );
}