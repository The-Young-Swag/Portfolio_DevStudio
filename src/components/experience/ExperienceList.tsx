import { ArrowUpRight } from "lucide-react";

import { profile } from "@/constants/profile";
import { experiences } from "@/constants/experience";
import { ExperienceItem } from "./ExperienceItem";

export function ExperienceList() {
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
                    key={`${experience.company}-${experience.role}`}
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