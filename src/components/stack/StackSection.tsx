import { Link } from "react-router";

import { Container, Section } from "@/components/layout";
import { SectionHeading } from "@/components/ui";

import { StackItem } from "./StackItem";

const TEASER_ITEMS = [
    "TypeScript",
    "React",
    "Laravel",
    "Node.js",
    "MySQL",
    "Tailwind CSS",
    "Git",
] as const;

export function StackSection() {
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
                        {TEASER_ITEMS.map((technology) => (
                            <StackItem
                                key={technology}
                                name={technology}
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