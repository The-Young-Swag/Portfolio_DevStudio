import { Link } from "react-router";

import { Container, Section } from "@/components/layout";
import { SectionHeading } from "@/components/ui";
import { useStackItems } from "@/hooks/stack/useStackItems";

import { StackItem } from "./StackItem";

export function StackSection() {
    const { stackItems } = useStackItems();
    const teaserItems = stackItems.filter((item) => item.is_core).slice(0, 7);
    return (
        <Section id="stack">
            <Container>
                <SectionHeading number="04" title="Stack" />

                <div
                    className="
                        mt-4
                        rounded-2xl
                        border
                        border-(--glass-border)
                        bg-(--glass-bg)
                        p-5
                        shadow-[inset_0_1px_0_var(--glass-highlight),0_10px_30px_-20px_rgba(31,38,135,0.12)]
                        backdrop-blur-xl
                        backdrop-saturate-160
                    "
                >
                    <p className="max-w-lg font-mono text-[12px] leading-relaxed text-(--graphite)">
                        The usual suspects, kept intentionally boring so the
                        product can be interesting. The full breakdown lives on
                        the Stack page.
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                        {teaserItems.map((item) => (
                            <StackItem
                                key={item.id}
                                name={item.name}
                            />
                        ))}
                    </div>

                    <Link
                        to="/stack"
                        className="
                            mt-5
                            inline-flex
                            items-center
                            gap-1.5
                            font-mono
                            text-[11.5px]
                            text-(--accent-strong)
                            transition-colors
                            duration-150
                            hover:text-(--accent-deep)
                            hover:underline
                        "
                    >
                        View full stack →
                    </Link>
                </div>
            </Container>
        </Section>
    );
}