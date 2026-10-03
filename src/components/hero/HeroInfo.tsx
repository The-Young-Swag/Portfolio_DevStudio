import { Heading, Text } from "@/components/typography";
import { useProfile } from "@/hooks/profile/useProfile";
import { profile as staticProfile } from "@/constants/profile";

function HeroLink({
    href,
    label,
    external,
}: {
    href: string;
    label: string;
    external: boolean;
}) {
    return (
        <a
            href={href}
            target={external ? "_blank" : undefined}
            rel={external ? "noreferrer" : undefined}
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
            {label}
            <span aria-hidden="true">↗</span>
        </a>
    );
}

export function HeroInfo() {
    const { profile } = useProfile();
    const resume = profile.resume ?? staticProfile.resume;

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
                <HeroLink href={profile.github} label="github" external />

                <HeroLink href={profile.linkedin} label="linkedin" external />

                {resume !== "" && (
                    <HeroLink href={resume} label="résumé" external />
                )}

                <HeroLink href={`mailto:${profile.email}`} label="email" external={false} />
            </div>
        </div>
    );
}