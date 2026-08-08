import { Heading, Text } from "@/components/typography";
import { profile } from "@/constants/profile";

export function HeroInfo() {
    return (
        <div>
            <p className="mb-3 flex items-center gap-2 text-sm text-neutral-500">
            <span className="h-2 w-2 rounded-full bg-[#50C878]" />
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
                    gap-6
                    font-mono
                    text-[11px]
                "
            >
                <a
                    href={profile.github}
                    target="_blank"
                    rel="noreferrer"
                    className="text-neutral-600 transition-colors hover:text-neutral-950"
                >
                    github ↗
                </a>

                <a
                    href={profile.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="text-neutral-600 transition-colors hover:text-neutral-950"
                >
                    linkedin ↗
                </a>

                <a
                    href={profile.resume}
                    target="_blank"
                    rel="noreferrer"
                    className="text-neutral-600 transition-colors hover:text-neutral-950"
                >
                    résumé ↗
                </a>

                <a
                    href={`mailto:${profile.email}`}
                    className="text-neutral-600 transition-colors hover:text-neutral-950"
                >
                    email
                </a>
            </div>
        </div>
    );
}