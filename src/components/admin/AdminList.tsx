import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import type { PropsWithChildren, ReactNode } from "react";

import { IconButton, PrimaryButton } from "./AdminButtons";

export function AdminSectionHead({
    title,
    description,
    action,
}: {
    title: string;
    description: string;
    action?: ReactNode;
}) {
    return (
        <div className="flex items-start gap-4">
            <div className="min-w-0 flex-1">
                <h1 className="font-display text-[26px] font-medium tracking-tight text-(--ink)">
                    {title}
                </h1>

                <p className="mt-1.5 max-w-2xl text-[13.5px] leading-relaxed text-(--graphite)">
                    {description}
                </p>
            </div>

            {action}
        </div>
    );
}

export function AddButton({ onClick, children }: PropsWithChildren<{ onClick: () => void }>) {
    return (
        <PrimaryButton onClick={onClick}>
            <Plus size={15} strokeWidth={2} aria-hidden="true" />
            {children}
        </PrimaryButton>
    );
}

export function AdminSearchInput({
    value,
    onChange,
    placeholder,
}: {
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
}) {
    return (
        <div className="relative">
            <Search
                size={15}
                strokeWidth={2}
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-(--graphite-soft)"
            />

            <input
                type="search"
                value={value}
                onChange={(event) => onChange(event.target.value)}
                placeholder={placeholder}
                aria-label={placeholder}
                className="
                    w-full
                    rounded-xl
                    border
                    border-(--glass-border)
                    bg-(--glass-bg)
                    py-2
                    pl-9
                    pr-3
                    text-[13px]
                    text-(--ink)
                    outline-none
                    placeholder:text-(--graphite-soft)
                    focus:border-(--accent-strong)
                "
            />
        </div>
    );
}

export function AdminRow({
    title,
    subtitle,
    tag,
    onEdit,
    onDelete,
    deleting = false,
    children,
}: PropsWithChildren<{
    title: string;
    subtitle?: string;
    tag?: string;
    onEdit: () => void;
    onDelete: () => void;
    deleting?: boolean;
}>) {
    return (
        <li className="flex items-center gap-3 p-4">
            <button
                type="button"
                onClick={onEdit}
                className="
                    min-w-0
                    flex-1
                    text-left
                    focus-visible:outline-none
                    focus-visible:ring-2
                    focus-visible:ring-(--accent-strong)
                "
            >
                <span className="block truncate font-display text-[16px] text-(--ink)">
                    {title}
                </span>

                {subtitle !== undefined && subtitle !== "" && (
                    <span className="mt-0.5 block truncate font-mono text-[10.5px] text-(--graphite-soft)">
                        {subtitle}
                    </span>
                )}
            </button>

            {tag !== undefined && tag !== "" && (
                <span className="hidden shrink-0 rounded-full border border-(--accent-strong)/40 px-2.5 py-1 font-mono text-[10px] text-(--accent-strong) sm:inline-block">
                    {tag}
                </span>
            )}

            {children}

            <span className="flex shrink-0">
                <IconButton label={`Edit ${title}`} onClick={onEdit}>
                    <Pencil size={15} strokeWidth={2} aria-hidden="true" />
                </IconButton>

                <IconButton
                    label={`Delete ${title}`}
                    tone="danger"
                    onClick={onDelete}
                    disabled={deleting}
                >
                    <Trash2 size={15} strokeWidth={2} aria-hidden="true" />
                </IconButton>
            </span>
        </li>
    );
}
