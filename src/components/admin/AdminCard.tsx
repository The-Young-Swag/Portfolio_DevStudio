import { useState } from "react";
import type { PropsWithChildren } from "react";
import { ChevronDown } from "lucide-react";

export function AdminCard({
    title,
    subtitle,
    defaultOpen = true,
    children,
}: PropsWithChildren<{
    title: string;
    subtitle: string;
    defaultOpen?: boolean;
}>) {
    const [open, setOpen] = useState(defaultOpen);

    return (
        <section className="overflow-hidden rounded-2xl border border-(--glass-border) bg-(--glass-bg) shadow-[inset_0_1px_0_var(--glass-highlight)] backdrop-blur-xl backdrop-saturate-160">
            <button
                type="button"
                aria-expanded={open}
                onClick={() => setOpen((wasOpen) => !wasOpen)}
                className="
                    flex
                    w-full
                    items-center
                    gap-3
                    p-5
                    text-left
                    focus-visible:outline-none
                    focus-visible:ring-2
                    focus-visible:ring-inset
                    focus-visible:ring-(--accent-strong)
                "
            >
                <span className="min-w-0 flex-1">
                    <span className="block font-display text-[16px] font-medium text-(--ink)">
                        {title}
                    </span>
                    <span className="mt-0.5 block truncate text-[12.5px] text-(--graphite)">
                        {subtitle}
                    </span>
                </span>

                <ChevronDown
                    size={16}
                    strokeWidth={2}
                    aria-hidden="true"
                    className={`
                        shrink-0
                        text-(--graphite-soft)
                        transition-transform
                        duration-200
                        motion-reduce:transition-none
                        ${open ? "" : "-rotate-90"}
                    `}
                />
            </button>

            {open && <div className="px-5 pb-5">{children}</div>}
        </section>
    );
}
