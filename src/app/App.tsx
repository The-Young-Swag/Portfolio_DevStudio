import { Container, Section } from "@/components/layout";
import { Heading, Text } from "@/components/typography";

export function App() {
    return (
        <Section>
            <Container>
                <Heading level={1}>
                    Ivan Harvey Danao Rivera
                </Heading>

                <Text>
                    Junior Fullstack Developer
                </Text>
            </Container>
        </Section>
    );
}