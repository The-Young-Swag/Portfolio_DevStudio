import { useEffect, useState } from "react";

const sections = [
    {
        id: "overview",
        label: "Overview",
    },
    {
        id: "github",
        label: "Build log",
    },
    {
        id: "projects",
        label: "Projects",
    },
    {
        id: "experience",
        label: "Experience",
    },
    {
        id: "stack",
        label: "Stack",
    },
    {
        id: "certification",
        label: "Certification",
    },
    {
        id: "time",
        label: "Right now",
    },
    {
        id: "contact",
        label: "Contact",
    },
];

function useActiveSection() {
    const [activeSection, setActiveSection] = useState("overview");

    useEffect(() => {
        const elements = sections
            .map(({ id }) => document.getElementById(id))
            .filter((element): element is HTMLElement => element !== null);

        if (elements.length === 0) {
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                const visibleSections = entries
                    .filter((entry) => entry.isIntersecting)
                    .sort(
                        (a, b) =>
                            a.boundingClientRect.top -
                            b.boundingClientRect.top,
                    );

                if (visibleSections.length > 0) {
                    setActiveSection(visibleSections[0].target.id);
                }
            },
            {
                rootMargin: "-20% 0px -65% 0px",
                threshold: 0,
            },
        );

        elements.forEach((element) => observer.observe(element));

        return () => observer.disconnect();
    }, []);

    return activeSection;
}

export function PageRail() {
    const activeSection = useActiveSection();

    return (
        <aside
            className="
                fixed
                right-6
                top-14
                z-40

                hidden
                xl:block

                w-[220px]
            "
        >
            <p
                className="
                    mb-4
                    pl-3

                    font-mono
                    text-[10px]
                    font-medium
                    uppercase
                    tracking-[0.16em]

                    text-neutral-400
                    dark:text-neutral-500
                "
            >
                On this page
            </p>

            <nav
                aria-label="On this page"
                className="
                    border-l
                    border-neutral-300/60

                    dark:border-white/15
                "
            >
                {sections.map((section) => {
                    const isActive =
                        activeSection === section.id;

                    return (
                        <a
                            key={section.id}
                            href={`#${section.id}`}
                            aria-current={
                                isActive
                                    ? "location"
                                    : undefined
                            }
                            className={`
                                relative
                                block

                                border-l
                                border-transparent

                                -ml-px

                                px-4
                                py-1.5

                                font-mono
                                text-[11.5px]

                                transition-colors
                                duration-150

                                ${
                                    isActive
                                        ? `
                                            border-[#059669]
                                            text-[#059669]
                                            dark:text-[#059669]
                                        `
                                        : `
                                            text-neutral-400
                                            hover:border-[#059669]/60
                                            hover:text-[#059669]

                                            dark:text-neutral-500
                                            dark:hover:text-[#059669]
                                        `
                                }
                            `}
                        >
                            {section.label}
                        </a>
                    );
                })}
            </nav>
        </aside>
    );
}