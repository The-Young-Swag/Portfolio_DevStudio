import { SkillPill } from "@/components/ui";
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
        <section aria-label={title} className="mt-8">
            <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-(--graphite-soft)">
                {title} <span className="opacity-70">{items.length}</span>
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
                {items.map((item) => (
                    <SkillPill
                        key={item.id}
                        name={item.name}
                        level={item.level}
                        isCore={item.is_core}
                    />
                ))}
            </div>
        </section>
    );
}
