import { Footer, PageHeader, Section } from "@/components/layout";
import { Container } from "@/components/layout";
import { StackCategorySection } from "@/components/stack";
import { SectionHeading } from "@/components/ui";
import { useStackItems } from "@/hooks/stack/useStackItems";
import type { StackItem, StackItemCategory } from "@/services/stack/stackItems";

const CATEGORY_ORDER: { category: StackItemCategory; title: string }[] = [
    { category: "language", title: "Languages" },
    { category: "framework", title: "Frameworks" },
    { category: "library", title: "Libraries" },
    { category: "database", title: "Databases" },
    { category: "tool", title: "Tools" },
];

function byCategory(items: StackItem[], category: StackItemCategory): StackItem[] {
    return items.filter((item) => item.category === category);
}

export function StackPage() {
    const { stackItems, isPending } = useStackItems();

    return (
        <>
            <PageHeader
                index="04"
                title="Stack"
                eyebrow="the toolchain"
                description="The tools I reach for when something needs to actually ship. I favor boring, well-supported technology so the product — not the framework — gets the attention."
            />

            <Section id="tools">
                <Container>
                    <SectionHeading number="01" title="Tools" id="tools" />

                    {isPending ? (
                        <p className="mt-4 font-mono text-[10.5px] text-(--graphite)">
                            Loading stack...
                        </p>
                    ) : stackItems.length === 0 ? (
                        <p className="mt-4 font-mono text-[10.5px] text-(--graphite)">
                            No stack yet.
                        </p>
                    ) : (
                        <>
                            {CATEGORY_ORDER.map(({ category, title }) => (
                                <StackCategorySection
                                    key={category}
                                    title={title}
                                    items={byCategory(stackItems, category)}
                                />
                            ))}
                        </>
                    )}
                </Container>
            </Section>

            <Section id="notes">
                <Container>
                    <SectionHeading number="02" title="Notes" id="notes" />

                    <div className="mt-6 rounded-2xl border border-(--glass-border) bg-(--glass-bg) p-6 shadow-[inset_0_1px_0_var(--glass-highlight)] backdrop-blur-xl backdrop-saturate-160 sm:p-7">
                        <p className="font-display text-[20px] leading-snug text-(--ink)">
                            "It's not much, but it's honest work."
                        </p>

                        <p className="mt-3 max-w-2xl text-[13px] leading-relaxed text-(--graphite)">
                            New tools get adopted slowly and only when they earn
                            their place. That means fewer surprises, easier
                            debugging, and code that the next person (usually
                            me, three weeks later) can still read.
                        </p>
                    </div>
                </Container>
            </Section>

            <Footer />
        </>
    );
}
