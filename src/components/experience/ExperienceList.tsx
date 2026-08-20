import { ArrowUpRight } from "lucide-react";

import { profile } from "@/constants/profile";
import { ExperienceItem } from "./ExperienceItem";

const experiences = [
    {
        period: "2026 — present",
        role: "Software Developer Intern",
        company: "Library Attendance Monitoring System",
        description: [
            "Developed a real-time attendance monitoring web app with PHP, MSSQL, and jQuery AJAX.",
            "Replaced a manual paper-based workflow used by library staff across multiple terminals.",
            "Designed the data model and built the reporting view used for weekly summary reports.",
        ],
    },
    {
        period: "2025 — 2026",
        role: "Freelance Web Developer",
        company: "Independent",
        description: [
            "Built and maintained small business sites and internal tools for local clients.",
            "Turned loose requirements into clean, responsive interfaces with vanilla JS and PHP.",
        ],
    },
    {
        period: "2024 — 2025",
        role: "Independent Learner",
        company: "Computer Science, B.S.",
        description: [
            "Deepened fundamentals in data structures, algorithms, and software engineering practice.",
            "Earned the IBM Full Stack Developer and Full-Stack JavaScript Developer certifications.",
        ],
    },
];

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