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
                    text-[var(--graphite)]
                "
            >
                <span
                    className="
                        h-1.5
                        w-1.5
                        rounded-full
                        bg-[#059669]
                    "
                />

                {profile.location} — {profile.availability}
            </p>

            {/* Name */}
            <Heading
                level={1}
                className="
                    whitespace-nowrap
                    text-[42px]
                    font-semibold
                    leading-[0.98]
                    tracking-tight
                    sm:text-[48px]
                "
            >
                {profile.name}
            </Heading>

            {/* Description */}
            <div
                className="
                    mt-7
                    max-w-[520px]
                    space-y-4
                    font-sans
                    text-[14.5px]
                    leading-relaxed
                    text-[var(--graphite)]
                "
            >
                <Text className="text-[14.5px] leading-relaxed text-[var(--graphite)]">
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
                        text-[var(--graphite)]
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
                        inline-flex
                        items-center
                        gap-1
                        text-[var(--graphite)]
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
                        inline-flex
                        items-center
                        gap-1
                        text-[var(--graphite)]
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
                        text-[var(--graphite)]
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