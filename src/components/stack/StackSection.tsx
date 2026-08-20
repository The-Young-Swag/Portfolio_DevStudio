import { Container, Section } from "@/components/layout";
import { SectionHeading } from "@/components/ui";

import { StackGrid } from "./StackGrid";

export function StackSection() {
    return (
        <Section id="stack">
            <Container>
                <SectionHeading number="04" title="Stack" />

                <p className="mt-3 max-w-lg font-mono text-[12px] leading-relaxed text-(--graphite)">
                    The usual suspects. I try to keep the toolchain boring
                    so the product can be interesting.
                </p>

                <StackGrid />

                <p className="mt-5 font-mono text-[11px] italic text-(--graphite-soft)">
                    "It's not much, but it's honest work."
                </p>
            </Container>
        </Section>
    );
}