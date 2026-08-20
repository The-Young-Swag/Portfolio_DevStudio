import { ArrowUpRight } from "lucide-react";

import { Footer, PageHeader, Section } from "@/components/layout";
import { Container } from "@/components/layout";
import {
    CertificationGrid,
} from "@/components/certifications";
import { SectionHeading } from "@/components/ui";

const issuers = [
    {
        name: "IBM",
        description: "Full Stack Developer and Full-Stack JavaScript tracks.",
        href: "https://www.ibm.com/training/",
    },
    {
        name: "Coursera",
        description: "Where the IBM courses are hosted and issued.",
        href: "https://www.coursera.org/",
    },
    {
        name: "HackerRank",
        description: "Skills-based assessments for SQL and more.",
        href: "https://www.hackerrank.com/",
    },
];

export function CertificationsPage() {
    return (
        <>
            <PageHeader
                index="05"
                title="Certifications"
                eyebrow="proof of work"
                description="Credentials earned along the way — structured programs and skill assessments that pushed me past the tutorial stage and into building."
            />

            <Section id="credentials">
                <Container>
                    <SectionHeading number="01" title="Credentials" />

                    <CertificationGrid />
                </Container>
            </Section>

            <Section id="verify">
                <Container>
                    <SectionHeading number="02" title="Verify" />

                    <p className="mt-3 max-w-lg font-mono text-[12px] leading-relaxed text-(--graphite)">
                        Each credential was issued through one of these
                        platforms.
                    </p>

                    <div className="mt-6 grid gap-4 sm:grid-cols-3">
                        {issuers.map((issuer) => (
                            <a
                                key={issuer.name}
                                href={issuer.href}
                                target="_blank"
                                rel="noreferrer"
                                className="
                                    group
                                    rounded-2xl
                                    border
                                    border-(--glass-border)
                                    bg-(--glass-bg)
                                    p-5
                                    shadow-[inset_0_1px_0_var(--glass-highlight),0_10px_30px_-20px_rgba(31,38,135,0.12)]
                                    backdrop-blur-xl
                                    backdrop-saturate-160
                                    transition-colors
                                    duration-150
                                    hover:border-(--accent-strong)
                                "
                            >
                                <p className="font-display text-[18px] font-medium leading-tight text-(--ink)">
                                    {issuer.name}
                                </p>

                                <p className="mt-2 text-[12.5px] leading-relaxed text-(--graphite)">
                                    {issuer.description}
                                </p>

                                <p className="mt-4 inline-flex items-center gap-1 font-mono text-[11px] text-(--accent-strong)">
                                    Visit issuer
                                    <ArrowUpRight
                                        size={12}
                                        strokeWidth={1.75}
                                        className="transition-transform duration-150 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                                    />
                                </p>
                            </a>
                        ))}
                    </div>
                </Container>
            </Section>

            <Footer />
        </>
    );
}