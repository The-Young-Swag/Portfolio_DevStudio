import { ChevronDown, Plus } from "lucide-react";
import type { PropsWithChildren } from "react";

import { PrimaryButton } from "./AdminButtons";

export function AdminSectionHead({
    title,
    description,
}: {
    title: string;
    description: string;
}) {
    return (
        <div className="flex items-start gap-4">
            <div className="min-w-0 flex-1">
                <h1 className="font-display text-[32px] font-medium tracking-tight text-(--ink)">
                    {title}
                </h1>

                <p className="mt-1.5 max-w-2xl text-[15px] leading-relaxed text-(--graphite)">
                    {description}
                </p>
            </div>
        </div>
    );
}

type AccordionItemProps = PropsWithChildren<{
    open: boolean;
    title: string;
    subtitle: string;
    tag?: string;
    onToggle: () => void;
}>;

/**
 * One expandable list row: stacked serif title over muted subtitle,
 * optional tag and a rotating chevron, with the editor rendered below
 * when open. Matches the admin mockup rows.
 */
export function AccordionItem({
    open,
    title,
    subtitle,
    tag,
    onToggle,
    children,
}: AccordionItemProps) {
    return (
        <div>
            <button
                type="button"
                aria-expanded={open}
                onClick={onToggle}
                className="
                    flex
                    w-full
                    items-center
                    gap-3.5
                    px-5
                    py-4
                    text-left
                    focus-visible:outline-none
                    focus-visible:ring-2
                    focus-visible:ring-inset
                    focus-visible:ring-(--accent-strong)
                "
            >
                <span className="min-w-0 flex-1">
                    <span className="block truncate font-display text-[17px] font-medium text-(--ink)">
                        {title}
                    </span>

                    <span className="mt-0.5 block truncate text-[13px] text-(--graphite)">
                        {subtitle}
                    </span>
                </span>

                {tag !== undefined && tag !== "" && (
                    <span className="hidden shrink-0 rounded-full border border-(--accent-strong)/50 px-2.5 py-1 font-mono text-[11px] font-medium text-(--accent-strong) min-[820px]:inline-flex">
                        {tag}
                    </span>
                )}

                <ChevronDown
                    size={18}
                    strokeWidth={2}
                    aria-hidden="true"
                    className={`
                        shrink-0
                        text-(--graphite-soft)
                        transition-transform
                        duration-200
                        ${open ? "rotate-180" : ""}
                    `}
                />
            </button>

            {open && <div className="px-5 pb-5 pt-1">{children}</div>}
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

export function AddRowButton({
    onClick,
    children,
}: PropsWithChildren<{ onClick: () => void }>) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="
                flex
                w-full
                items-center
                gap-2.5
                border-t
                border-(--line)
                px-5
                py-[15px]
                font-semibold
                text-(--accent-strong)
                transition-colors
                duration-150
                hover:text-(--accent-deep)
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-inset
                focus-visible:ring-(--accent-strong)
            "
        >
            <Plus size={17} strokeWidth={2} aria-hidden="true" />
            {children}
        </button>
    );
}
