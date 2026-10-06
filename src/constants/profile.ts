export const profile = {

    name: "Ivan Harvey Rivera",

    headline: "Junior Software Engineer",

    location: "Tarlac, Philippines",

    availability: "Open to Work",

    description:
    "Passionate about building modern web applications, learning software engineering best practices, and creating thoughtful user experiences.",

    github: "https://github.com/the-young-swag",

    linkedin: "https://www.linkedin.com/in/ivan-harvey-rivera/",

    email: "your.email@example.com",

    resume: "/resume.pdf",

    portrait: {} as Record<string, { image: string; alt: string }>,

    hero_stats: [
        {
            label: "Contributions / Year",
            value: "",
            suffix: "",
            icon: "gitcommit",
            live: "contributions" as const,
        },
        {
            label: "Coffees Consumed",
            value: "YES.",
            suffix: "",
            icon: "coffee",
            live: null,
        },
    ],

    also_true: [
        { text: "AI tabs opened: Classified", icon: "bot" },
        { text: "Commit messages: surprisingly descriptive", icon: "gitcommit" },
        { text: "Sleep: pending PR review", icon: "coffee" },
    ],

    contact_heading: "Contact",

    contact_title: "Let's build something.",

    contact_intro:
        "Open to full-time roles and select freelance work. Usually replies within a day — sooner if it's an interesting problem, or there's free food involved.",

    contact_email_label: "Email Ivan",

    footer_note: "probably still debugging something.",
};