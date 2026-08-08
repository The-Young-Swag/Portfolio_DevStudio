import { ExperienceItem } from "./ExperienceItem";

const experiences = [
    {
        period: "2026",
        role: "Software Developer Intern",
        company: "Internship",
        description: [
            "Developed a Library Attendance Monitoring System using PHP, MSSQL, and AJAX.",
            "Replaced manual attendance workflows with a real-time web application.",
        ],
    },
];

export function ExperienceList() {
    return (
        <div className="relative pl-6 space-y-8">
            {/* Timeline line */}
            <div
                className="
                    absolute
                    left-[3px]
                    top-1
                    bottom-1
                    w-px
                    bg-neutral-200
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
                        border-neutral-200
                        bg-white
                    "
                />

                <a
                    href="#"
                    className="
                        font-mono
                        text-[11.5px]
                        text-[#059669]
                        transition-colors
                        duration-150
                        hover:text-[#047857]
                        hover:underline
                    "
                >
                    See the receipts →
                </a>
            </div>
        </div>
    );
}