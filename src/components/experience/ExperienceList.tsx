import { ArrowUpRight } from "lucide-react";

import { useProfile } from "@/hooks/profile/useProfile";
import type { ExperienceEntry } from "@/services/experience/experience";
import { ExperienceItem } from "./ExperienceItem";

type ExperienceListProps = {
    experiences: ExperienceEntry[];
};

export function ExperienceList({ experiences }: ExperienceListProps) {
    const { profile } = useProfile();

    return (
        <div className="relative space-y-10 pl-6">
            {/* Timeline line */}
            <div
                className="
                    absolute
                    left-[3px]
                    top-1
                    bottom-1
                    w-px
                    bg-(--line)
                "
            />

            {experiences.map((experience) => (
                <ExperienceItem
                    key={experience.id}
                    {...experience}
                />
            ))}

            {/* Receipts */}
            <div className="relative">
                <span
                    className="
                        absolute
                        -left-6
                        top-1.5
                        h-2.5
                        w-2.5
                        rounded-full
                        border-2
                        border-(--line)
                        bg-(--paper)
                    "
                />

                <a
                    href={profile.resume}
                    target="_blank"
                    rel="noreferrer"
                    className="
                        inline-flex
                        items-center
                        gap-1
                        font-mono
                        text-[11.5px]
                        text-(--accent-strong)
                        transition-colors
                        duration-150
                        hover:text-(--accent-deep)
                        hover:underline
                    "
                >
                    See the receipts
                    <ArrowUpRight size={13} strokeWidth={1.75} />
                </a>
            </div>
        </div>
    );
}