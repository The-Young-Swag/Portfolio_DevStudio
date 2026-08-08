import { ExperienceItem } from "./ExperienceItem";

const experiences = [
    {
        role: "Software Developer Intern",
        company: "Internship",
        period: "2026",
        description:
            "Developed a Library Attendance Monitoring System using PHP, MSSQL, and AJAX to replace manual attendance workflows with a real-time web application.",
    },
];

export function ExperienceList() {
    return (
        <div>
            {experiences.map((experience) => (
                <ExperienceItem
                    key={`${experience.company}-${experience.role}`}
                    {...experience}
                />
            ))}
        </div>
    );
}