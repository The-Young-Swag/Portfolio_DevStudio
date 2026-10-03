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
                "mx-auto w-full max-w-270 px-4 min-[400px]:px-5 lg:px-8",
                "pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))]",
                "min-[400px]:pl-[max(1.25rem,env(safe-area-inset-left))] min-[400px]:pr-[max(1.25rem,env(safe-area-inset-right))]",
                "lg:pl-[max(2rem,env(safe-area-inset-left))] lg:pr-[max(2rem,env(safe-area-inset-right))]",
                className,
            )}
        >
            {children}
        </div>
    );
}