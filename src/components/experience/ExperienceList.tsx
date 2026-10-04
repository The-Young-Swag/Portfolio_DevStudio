import type { ExperienceEntry } from "@/services/experience/experience";
import { ExperienceItem } from "./ExperienceItem";

type ExperienceListProps = {
    experiences: ExperienceEntry[];
};

export function ExperienceList({ experiences }: ExperienceListProps) {
    return (
        <div className="relative space-y-8 pl-6 sm:space-y-10">
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
        </div>
    );
}