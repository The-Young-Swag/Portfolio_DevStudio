import { Footer, PageHeader, Section } from "@/components/layout";
import { Container } from "@/components/layout";
import { StackGrid } from "@/components/stack";
import { SectionHeading } from "@/components/ui";

export function StackPage() {
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
                    <SectionHeading number="01" title="Tools" />

                    <p className="mt-3 max-w-lg font-mono text-[12px] leading-relaxed text-(--graphite)">
                        Grouped the way I think about them: what I write, what I
                        build on, where it lives, and how I keep it honest.
                    </p>

                    <StackGrid />
                </Container>
            </Section>

            <Section id="notes">
                <Container>
                    <SectionHeading number="02" title="Notes" />

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