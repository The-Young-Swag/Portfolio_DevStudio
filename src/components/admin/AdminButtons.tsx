import type { ButtonHTMLAttributes, PropsWithChildren } from "react";

type ButtonProps = PropsWithChildren<{
    onClick?: () => void;
    type?: "button" | "submit";
    disabled?: boolean;
    form?: string;
}>;

function baseClassName(extra: string) {
    return `
        inline-flex
        items-center
        justify-center
        gap-2
        rounded-xl
        px-4
        py-2
        text-[13px]
        font-medium
        transition-colors
        duration-150
        focus-visible:outline-none
        focus-visible:ring-2
        focus-visible:ring-(--accent-strong)
        disabled:opacity-60
        ${extra}
    `;
}

export function PrimaryButton({ children, ...rest }: ButtonProps) {
    return (
        <button
            {...rest}
            className={baseClassName(
                "border border-(--accent-strong) bg-(--accent-strong) text-white hover:border-(--accent-deep) hover:bg-(--accent-deep)",
            )}
        >
            {children}
        </button>
    );
}

export function SecondaryButton({ children, ...rest }: ButtonProps) {
    return (
        <button
            {...rest}
            className={baseClassName(
                "border border-(--glass-border) bg-(--glass-bg) text-(--ink) hover:border-(--accent-strong) hover:text-(--accent-strong)",
            )}
        >
            {children}
        </button>
    );
}

export function LinkButton({
    children,
    ...rest
}: ButtonProps & ButtonHTMLAttributes<HTMLButtonElement>) {
    return (
        <button
            type="button"
            {...rest}
            className="
                font-mono
                text-[11px]
                text-(--accent-strong)
                hover:underline
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-(--accent-strong)
            "
        >
            {children}
        </button>
    );
}

export function IconButton({
    label,
    tone = "neutral",
    children,
    ...rest
}: PropsWithChildren<{
    label: string;
    tone?: "neutral" | "danger";
}> &
    ButtonHTMLAttributes<HTMLButtonElement>) {
    return (
        <button
            type="button"
            aria-label={label}
            title={label}
            {...rest}
            className={`
                inline-flex
                h-9
                w-9
                shrink-0
                items-center
                justify-center
                rounded-xl
                text-(--graphite)
                transition-colors
                duration-150
                hover:text-(--accent-strong)
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-(--accent-strong)
                ${tone === "danger" ? "hover:text-red-500" : ""}
            `}
        >
            {children}
        </button>
    );
}
