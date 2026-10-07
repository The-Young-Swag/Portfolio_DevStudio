import { useState } from "react";
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

export function IconButton({    label,
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

/**
 * Delete button with a built-in second-click confirm, matching the
 * mockup ("Delete" arms it, "Click again to delete" fires it).
 */
export function ConfirmDeleteButton({
    onConfirm,
    confirmLabel = "Click again to delete",
    disabled = false,
    small = false,
}: {
    onConfirm: () => void;
    confirmLabel?: string;
    disabled?: boolean;
    small?: boolean;
}) {
    const [armed, setArmed] = useState(false);
    const sizeClassName = small ? "px-2.5 py-1 text-[12px]" : "px-4 py-2 text-[13px]";

    if (!armed) {
        return (
            <button
                type="button"
                onClick={() => setArmed(true)}
                disabled={disabled}
                className={`
                    inline-flex
                    shrink-0
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    border
                    border-(--glass-border)
                    bg-(--glass-bg)
                    font-medium
                    text-red-500
                    transition-colors
                    duration-150
                    hover:border-red-500
                    focus-visible:outline-none
                    focus-visible:ring-2
                    focus-visible:ring-red-500
                    disabled:opacity-60
                    ${sizeClassName}
                `}
            >
                Delete
            </button>
        );
    }

    return (
        <button
            type="button"
            onClick={() => {
                setArmed(false);
                onConfirm();
            }}
            disabled={disabled}
            className={`
                inline-flex
                shrink-0
                items-center
                justify-center
                gap-2
                rounded-xl
                border
                border-red-500
                bg-red-500
                font-medium
                text-white
                transition-colors
                duration-150
                hover:bg-red-600
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-red-500
                disabled:opacity-60
                ${sizeClassName}
            `}
        >
            {confirmLabel}
        </button>
    );
}
