import clsx from "clsx";
import type { AnchorHTMLAttributes } from "react";

type ButtonProps = AnchorHTMLAttributes<HTMLAnchorElement>;

export function Button({
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <a
      className={clsx(
        "inline-flex items-center justify-center rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium transition-colors hover:bg-neutral-100",
        className,
      )}
      {...props}
    >
      {children}
    </a>
  );
}