import { Container, Section } from "@/components/layout";
import { SectionHeading } from "@/components/ui";

export function TimeSection() {
    return (
        <Section id="time">
            <Container>
                <SectionHeading
                    number="06"
                    title="Right Now"
                />

                <div className="rounded-xl border border-neutral-200 p-8">
                    <p className="text-sm text-neutral-500">
                        Current time
                    </p>

                    <p className="mt-2 text-4xl font-semibold">
                        --:--
                    </p>

                    <p className="mt-2 text-sm text-neutral-500">
                        Loading time...
                    </p>
                </div>
            </Container>
        </Section>
    );
}