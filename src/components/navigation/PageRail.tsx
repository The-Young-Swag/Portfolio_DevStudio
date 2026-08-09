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

export function PageRail() {
    return (
        <aside
            className="
            hidden
            xl:block
            sticky
            top-10
            self-start
            w-[220px]
            shrink-0
            pt-10
            pr-6
        "
        >
            <p
                className="
                    mb-4
                    font-mono
                    text-[10.5px]
                    uppercase
                    tracking-[0.16em]
                    text-neutral-400
                "
            >
                On this page
            </p>

            <nav
                className="
                    border-l
                    border-neutral-200
                "
            >
                {sections.map((section) => (
                    <a
                        key={section.id}
                        href={`#${section.id}`}
                        className="
                            block
                            border-l
                            border-transparent
                            -ml-px
                            px-4
                            py-1.5
                            font-mono
                            text-[11.5px]
                            text-neutral-400
                            transition-colors
                            duration-150
                            hover:border-[#059669]
                            hover:text-[#059669]
                        "
                    >
                        {section.label}
                    </a>
                ))}
            </nav>
        </aside>
    );
}