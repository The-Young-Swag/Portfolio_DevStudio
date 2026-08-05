import { Container, Section } from "@/components/layout";
import { HeroInfo } from "./HeroInfo";
import { HeroPortrait } from "./HeroPortrait";
import { HeroStats } from "./HeroStats"

export function Hero() {
    return (
<Section id="overview">
    <Container>
        <div className="grid gap-8 md:grid-cols-[300px_1fr] md:gap-12 items-start">
            <HeroPortrait />

            <div>
                <HeroInfo />
                <HeroStats />
            </div>
        </div>
    </Container>
</Section>
    );
}