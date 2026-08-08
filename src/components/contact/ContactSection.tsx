import { Container, Section } from "@/components/layout";
import { SectionHeading } from "@/components/ui";
import { profile } from "@/constants/profile";

export function ContactSection() {
    return (
        <Section id="contact">
            <Container>
                <SectionHeading
                    number="07"
                    title="Contact"
                />

                <div className="max-w-2xl">
                    <p className="text-lg leading-8 text-neutral-600">
                        Interested in working together or discussing a project?
                        Feel free to get in touch.
                    </p>

                    <a
                        href={`mailto:${profile.email}`}
                        className="mt-6 inline-flex rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium transition-colors hover:bg-neutral-100"
                    >
                        Get in touch
                    </a>
                </div>
            </Container>
        </Section>
    );
}