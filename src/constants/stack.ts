export type StackItemCategory =
    | "language"
    | "framework"
    | "library"
    | "database"
    | "tool";
export type StackItemLevel = "learning" | "comfortable" | "confident";

export type StaticStackItem = {
    name: string;
    category: StackItemCategory;
    level: StackItemLevel;
    since_year: number | null;
    is_core: boolean;
};

export const stackItems: StaticStackItem[] = [
    { name: "PHP", category: "language", level: "confident", since_year: null, is_core: false },
    { name: "JavaScript", category: "language", level: "confident", since_year: null, is_core: false },
    { name: "TypeScript", category: "language", level: "confident", since_year: null, is_core: true },
    { name: "SQL", category: "language", level: "comfortable", since_year: null, is_core: false },
    { name: "HTML", category: "language", level: "confident", since_year: null, is_core: false },
    { name: "CSS", category: "language", level: "comfortable", since_year: null, is_core: false },
    { name: "Laravel", category: "framework", level: "confident", since_year: null, is_core: true },
    { name: "React", category: "library", level: "confident", since_year: null, is_core: true },
    { name: "Node.js", category: "framework", level: "comfortable", since_year: null, is_core: true },
    { name: "jQuery", category: "library", level: "comfortable", since_year: null, is_core: false },
    { name: "Tailwind CSS", category: "framework", level: "confident", since_year: null, is_core: true },
    { name: "FastAPI", category: "framework", level: "comfortable", since_year: null, is_core: false },
    { name: "MySQL", category: "database", level: "confident", since_year: null, is_core: true },
    { name: "PostgreSQL", category: "database", level: "comfortable", since_year: null, is_core: false },
    { name: "MSSQL", category: "database", level: "comfortable", since_year: null, is_core: false },
    { name: "SQLite", category: "database", level: "comfortable", since_year: null, is_core: false },
    { name: "Git", category: "tool", level: "confident", since_year: null, is_core: true },
    { name: "GitHub", category: "tool", level: "confident", since_year: null, is_core: false },
    { name: "Tesseract OCR", category: "tool", level: "comfortable", since_year: null, is_core: false },
    { name: "REST APIs", category: "tool", level: "comfortable", since_year: null, is_core: false },
    { name: "Vite", category: "tool", level: "confident", since_year: null, is_core: false },
];

/*
 * Legacy grouped shape. Superseded by stackItems above; kept only until
 * the Stack page and seed move over, then removed.
 */
export const stack = [
    {
        group: "Languages",
        items: ["PHP", "JavaScript", "TypeScript", "SQL", "HTML", "CSS"],
    },
    {
        group: "Frameworks & Libraries",
        items: ["Laravel", "React", "Node.js", "jQuery", "Tailwind CSS", "FastAPI"],
    },
    {
        group: "Databases",
        items: ["MySQL", "PostgreSQL", "MSSQL", "SQLite"],
    },
    {
        group: "Tools & Practices",
        items: ["Git", "GitHub", "Tesseract OCR", "REST APIs", "Vite"],
    },
] as const;

export const stackGroups = stack;
