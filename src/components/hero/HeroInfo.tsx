import { Heading, Text } from "@/components/typography";
import { profile } from "@/constants/profile";

export function HeroInfo() {
    return (
        <div className="min-w-0 pt-1">
            {/* Availability */}
            <p
                className="
                    mb-4
                    flex
                    items-center
                    gap-1.5
                    font-mono
                    text-[11px]
                    text-(--graphite)
                "
            >
                <span
                    className="
                        h-1.5
                        w-1.5
                        rounded-full
                        bg-(--accent-strong)
                    "
                />

                {profile.location} — {profile.availability}
            </p>

            {/* Name */}
            <Heading
                level={1}
                className="
                    text-balance
                    font-semibold
                    leading-[0.98]
                    tracking-tight
                    sm:whitespace-nowrap
                "
            >
                {profile.name}
            </Heading>

            {/* Description */}
            <div
                className="
                    mt-7
                    max-w-130
                    space-y-4
                    font-sans
                    text-[14.5px]
                    leading-relaxed
                    text-(--graphite)
                "
            >
                <Text className="text-[14.5px] leading-relaxed text-(--graphite)">
                    {profile.description}
                </Text>
            </div>

            {/* External links */}
            <div
                className="
                    mt-7
                    flex
                    flex-wrap
                    gap-x-5
                    gap-y-2
                    font-mono
                    text-[12px]
                "
            >
                <a
                    href={profile.github}
                    target="_blank"
                    rel="noreferrer"
                    className="
                        inline-flex
                        items-center
                        gap-1
                        text-(--graphite)
                        transition-colors
                        duration-150
                        hover:text-(--accent-strong)
                    "
                >
                    github ↗
                </a>

                <a
                    href={profile.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="
                        inline-flex
                        items-center
                        gap-1
                        text-(--graphite)
                        transition-colors
                        duration-150
                        hover:text-(--accent-strong)
                    "
                >
                    linkedin ↗
                </a>

                <a
                    href={profile.resume}
                    target="_blank"
                    rel="noreferrer"
                    className="
                        inline-flex
                        items-center
                        gap-1
                        text-(--graphite)
                        transition-colors
                        duration-150
                        hover:text-(--accent-strong)
                    "
                >
                    résumé ↗
                </a>

                <a
                    href={`mailto:${profile.email}`}
                    className="
                        text-(--graphite)
                        transition-colors
                        duration-150
                        hover:text-(--accent-strong)
                    "
                >
                    email
                </a>
            </div>
        </div>
    );
}