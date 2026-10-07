import { Container, Section } from "@/components/layout";
import { HeroInfo } from "./HeroInfo";
import { HeroPortrait } from "./HeroPortrait";
import { HeroStats } from "./HeroStats";
import { Breadcrumb } from "@/components/navigation";

export function Hero() {
    return (
        <Section id="overview" className="pt-8 md:pt-10">
            <Container>
                <Breadcrumb current="Profile" />

                <div
                    className="
                        mt-8
                        grid
                        items-start
                        gap-8
                        xl:mt-16
                        xl:grid-cols-[300px_minmax(0,1fr)]
                        xl:gap-12
                    "
                >
                    <HeroPortrait />

                    <HeroInfo />
                </div>

                <HeroStats />
            </Container>
        </Section>
    );
}