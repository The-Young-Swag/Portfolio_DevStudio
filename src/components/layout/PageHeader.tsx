import type { PropsWithChildren } from "react";
import { Breadcrumb } from "@/components/navigation";
import { Heading, Text } from "@/components/typography";
import { Container } from "./Container";
import { Section } from "./Section";

type PageHeaderProps = PropsWithChildren<{
    index: string;
    title: string;
    eyebrow: string;
    description: string;
    compact?: boolean;
}>;

export function PageHeader({
    index,
    title,
    eyebrow,
    description,
    compact = false,
    children,
}: PageHeaderProps) {
    return (
        <Section id="overview" className="pt-8 md:pt-10">
            <Container>
                <Breadcrumb current={title} />

                <div className={compact ? "mt-6 max-w-3xl" : "mt-14 max-w-3xl"}>
                    <p className="font-mono text-[12px] uppercase tracking-[0.14em] text-(--accent-strong)">
                        // {index} — {eyebrow}
                    </p>

                    <Heading
                        level={1}
                        className={
                            compact
                                ? "mt-3 text-3xl font-semibold tracking-tight sm:text-4xl"
                                : "mt-5 text-4xl font-semibold tracking-tight sm:text-5xl"
                        }
                    >
                        {title}
                    </Heading>

                    <Text
                        className={
                            compact
                                ? "mt-3 max-w-2xl text-[14px] leading-6 text-(--graphite)"
                                : "mt-5 max-w-2xl text-[15px] leading-7 text-(--graphite)"
                        }
                    >
                        {description}
                    </Text>

                    {children}
                </div>
            </Container>
        </Section>
    );
}