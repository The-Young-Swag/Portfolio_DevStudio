import type { PropsWithChildren } from "react";
import clsx from "clsx";

type ContainerProps = PropsWithChildren<{
    className?: string;
}>;

export function Container({
    children,
    className,
}: ContainerProps) {
    return (
        <div
            className={clsx(
                "mx-auto w-full max-w-270 px-6 lg:px-8",
                className,
            )}
        >
            {children}
        </div>
    );
}