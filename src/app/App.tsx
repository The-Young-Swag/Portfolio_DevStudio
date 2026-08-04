import { Container, Section } from "@/components/layout";
import { Heading, Text } from "@/components/typography";
import { profile } from "@/constants/profile"

export function App() {
    return (
        <Section>
            <Container>
                <Heading level={1}>
                   {profile.name}
                </Heading>

                <Text>
                   {profile.headline}
                </Text>
            </Container>
        </Section>
    );
}