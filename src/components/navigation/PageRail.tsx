import { useEffect, useState } from "react";

const sections = [
    {
        id: "overview",
        label: "Overview",
    },
    {
        id: "build-log",
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

function getActiveSection(): string {
    const elements = sections
        .map(({ id }) => document.getElementById(id))
        .filter(
            (element): element is HTMLElement =>
                element !== null,
        );

    if (elements.length === 0) {
        return "overview";
    }

    /*
     * Contact is the final section.
     *
     * When the user reaches the bottom of the document,
     * explicitly activate Contact. This prevents the last
     * section from being skipped by viewport-based detection.
     */
    const scrollPosition =
        window.scrollY + window.innerHeight;

    const documentHeight =
        document.documentElement.scrollHeight;

    if (scrollPosition >= documentHeight - 8) {
        return "contact";
    }

    /*
     * Use a position inside the viewport as the scroll-spy
     * reference line. The last section whose top has crossed
     * that line is the active section.
     */
    const activationLine =
        window.innerHeight * 0.2;

    let activeSection = elements[0].id;

    for (const element of elements) {
        if (
            element.getBoundingClientRect().top <=
            activationLine
        ) {
            activeSection = element.id;
        } else {
            break;
        }
    }

    return activeSection;
}

function useActiveSection() {
    const [activeSection, setActiveSection] =
        useState("overview");

    useEffect(() => {
        let frameId: number | null = null;

        const updateActiveSection = () => {
            frameId = null;

            const nextSection = getActiveSection();

            setActiveSection((currentSection) =>
                currentSection === nextSection
                    ? currentSection
                    : nextSection,
            );
        };

        const handleScroll = () => {
            if (frameId !== null) {
                return;
            }

            frameId = window.requestAnimationFrame(
                updateActiveSection,
            );
        };

        /*
         * Determine the correct section immediately on mount.
         */
        updateActiveSection();

        window.addEventListener(
            "scroll",
            handleScroll,
            { passive: true },
        );

        window.addEventListener(
            "resize",
            handleScroll,
        );

        return () => {
            window.removeEventListener(
                "scroll",
                handleScroll,
            );

            window.removeEventListener(
                "resize",
                handleScroll,
            );

            if (frameId !== null) {
                window.cancelAnimationFrame(frameId);
            }
        };
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

                w-55
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

                    text-(--graphite)
                "
            >
                On this page
            </p>

            <nav
                aria-label="On this page"
                className="
                    border-l
                    border-(--graphite)/20
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
                                            border-(--accent-strong)
                                            text-(--accent-strong)
                                        `
                                        : `
                                            text-(--graphite)
                                            hover:border-(--accent-strong)/60
                                            hover:text-(--accent-strong)
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