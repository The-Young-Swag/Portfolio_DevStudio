import clsx from "clsx";
import type { PropsWithChildren } from "react";

type HeadingLevel = 1 | 2 | 3;

type HeadingProps = PropsWithChildren<{
    level?: HeadingLevel;
    className?: string;
}>;

const headingStyles = {
    1: "font-display text-5xl font-semibold tracking-tight md:text-6xl",
    2: "font-display text-3xl font-semibold tracking-tight md:text-4xl",
    3: "font-display text-xl font-semibold tracking-tight md:text-2xl",
  };

  export function Heading({
    children,
    level = 2,
    className,
  }: HeadingProps) {
    const Tag = `h${level}` as const;

    return (
        <Tag
        className={clsx(
            headingStyles[level],
            className,
        )}
>
    {children}
    </Tag>
    );
  }