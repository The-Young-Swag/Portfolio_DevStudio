import type { PropsWithChildren } from "react";
import clsx from "clsx";

type ContainerProps = PropsWithChildren<{
    ClassName?: string;
}>;

export function Container({
    children,
    className,
}: ContainerProps){
    return (
        <div
        className={clsx(
            "mx-auto w-full max-w-7xl px-6 lg:px-8",
            className,
        )}
        >
            {children}
        </div>
    )
}