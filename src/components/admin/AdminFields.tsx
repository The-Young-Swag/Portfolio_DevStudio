import type { PropsWithChildren } from "react";

export const adminFieldLabelClassName =
    "font-mono text-[10px] uppercase tracking-[0.12em] text-(--graphite-soft)";

export const adminFieldInputClassName =
    "mt-1 w-full rounded-lg border border-(--glass-border) bg-white/40 px-3 py-2 text-[13px] text-(--ink) outline-none focus:border-(--accent-strong) dark:bg-black/20";

export function Field({
    label,
    hint,
    wide = false,
    children,
}: PropsWithChildren<{
    label: string;
    hint?: string;
    wide?: boolean;
}>) {
    return (
        <label className={`block ${wide ? "sm:col-span-2" : ""}`}>
            <span className={adminFieldLabelClassName}>{label}</span>
            {children}
            {hint !== undefined && (
                <span className="mt-1 block text-[12px] leading-relaxed text-(--graphite-soft)">
                    {hint}
                </span>
            )}
        </label>
    );
}

export function FormError({ message }: { message: string }) {
    return <p className="font-mono text-[11px] text-red-500">{message}</p>;
}
