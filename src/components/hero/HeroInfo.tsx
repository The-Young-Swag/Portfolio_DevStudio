import { Heading, Text } from "@/components/typography";
import { profile } from "@/constants/profile";

export function HeroInfo() {
    return (
        <div>
            <p className="mb-3 flex items-center gap-2 text-sm text-neutral-500">
                <span className="h-2 w-2 rounded-full bg-red-600" />

                {profile.location} — {profile.availability}
            </p>

            <Text className="mt-6 text-lg">
                {profile.greeting}
            </Text>

            <Heading level={1}>
                {profile.name}
            </Heading>

            <Text className="mt-2 text-xl">
                {profile.headline}
            </Text>

            <div className="mt-6 max-w-xl">
                <Text>
                    {profile.description}
                </Text>
            </div>
        </div>
    );
}