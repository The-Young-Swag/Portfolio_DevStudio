import { Heading, Text } from "@/components/typography";
import { profile } from "@/constants/profile";

export function HeroInfo() {
    return (
        <div>
            <p className="font-mono text-[11px] text-neutral-500">
                <span className="mr-2 inline-block h-2 w-2 rounded-full bg-[#059669]" />
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

            <div
                className="
                    mt-8
                    flex
                    flex-wrap
                    gap-x-6
                    gap-y-3
                    font-mono
                    text-[12px]
                "
            >
                <a
                    href={profile.github}
                    target="_blank"
                    rel="noreferrer"
                    className="
                        text-neutral-600
                        transition-colors
                        duration-150
                        hover:text-[#059669]
                    "
                >
                    github ↗
                </a>

                <a
                    href={profile.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="
                        text-neutral-600
                        transition-colors
                        duration-150
                        hover:text-[#059669]
                    "
                >
                    linkedin ↗
                </a>

                <a
                    href={profile.resume}
                    target="_blank"
                    rel="noreferrer"
                    className="
                        text-neutral-600
                        transition-colors
                        duration-150
                        hover:text-[#059669]
                    "
                >
                    résumé ↗
                </a>

                <a
                    href={`mailto:${profile.email}`}
                    className="
                        text-neutral-600
                        transition-colors
                        duration-150
                        hover:text-[#059669]
                    "
                >
                    email
                </a>
            </div>
        </div>
    );
}