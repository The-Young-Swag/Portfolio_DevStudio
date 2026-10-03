import type { StackItem } from "@/services/stack/stackItems";

type StackCategorySectionProps = {
    title: string;
    items: StackItem[];
};

export function StackCategorySection({ title, items }: StackCategorySectionProps) {
    if (items.length === 0) {
        return null;
    }

    return (
        <div className="mt-6">
            <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-(--graphite-soft)">
                {title}
            </p>

            <ul className="mt-3 divide-y divide-(--line) rounded-2xl border border-(--glass-border) bg-(--glass-bg) shadow-[inset_0_1px_0_var(--glass-highlight),0_10px_30px_-20px_rgba(31,38,135,0.12)] backdrop-blur-xl backdrop-saturate-160">
                {items.map((item) => (
                    <li
                        key={item.id}
                        className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 p-4"
                    >
                        <p className="font-display text-[16px] text-(--ink)">
                            {item.name}
                        </p>

                        <p className="font-mono text-[10.5px] text-(--graphite-soft)">
                            {item.level}
                            {item.since_year !== null && ` · since ${item.since_year}`}
                        </p>
                    </li>
                ))}
            </ul>
        </div>
    );
}
