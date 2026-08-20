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
}>;

export function PageHeader({
    index,
    title,
    eyebrow,
    description,
    children,
}: PageHeaderProps) {
    return (
        <Section id="overview" className="pt-8 md:pt-10">
            <Container>
                <Breadcrumb current={title} />

                <div className="mt-14 max-w-3xl">
                    <p className="font-mono text-[12px] uppercase tracking-[0.14em] text-(--accent-strong)">
                        // {index} — {eyebrow}
                    </p>

                    <Heading
                        level={1}
                        className="mt-5 text-4xl font-semibold tracking-tight sm:text-5xl"
                    >
                        {title}
                    </Heading>

                    <Text className="mt-5 max-w-2xl text-[15px] leading-7 text-(--graphite)">
                        {description}
                    </Text>

                    {children}
                </div>
            </Container>
        </Section>
    );
}