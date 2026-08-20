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
        "inline-flex items-center justify-center rounded-lg border border-(--glass-border) bg-(--glass-bg) px-4 py-2 text-sm font-medium text-(--ink) transition-colors shadow-[inset_0_1px_0_var(--glass-highlight)] backdrop-blur-md hover:border-(--accent-strong) hover:text-(--accent-strong)",
        className,
      )}
      {...props}
    >
      {children}
    </a>
  );
}