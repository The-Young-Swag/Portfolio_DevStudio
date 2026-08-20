import arcHiveThumbnail from "@/assets/images/projects/arc-hive.webp";
import libraryAttendanceThumbnail from "@/assets/images/projects/library-attendance.webp";
import luminoesisThumbnail from "@/assets/images/projects/luminoesis.webp";
import portfolioThumbnail from "@/assets/images/projects/portfolio.webp";

export const projects = [
    {
        title: "Arc-Hive",
        description:
            "Document archival system designed to digitize and organize physical document records.",
        stack: ["PHP", "MySQL", "Tesseract OCR"],
        year: 2026,
        category: "DOCUMENT ARCHIVAL",
        thumbnail: arcHiveThumbnail,
        highlights: [
            "Scans and OCRs physical records into a searchable digital index.",
            "Role-based access keeps sensitive archives restricted to staff.",
            "Reports track retrieval history for accountability.",
        ],
    },
    {
        title: "Library Attendance Monitoring System",
        description:
            "Real-time library attendance monitoring system developed during internship.",
        stack: ["PHP", "MSSQL", "jQuery AJAX"],
        year: 2026,
        category: "REAL-TIME SYSTEM",
        thumbnail: libraryAttendanceThumbnail,
        highlights: [
            "Replaced paper sign-in sheets with live terminal-based logging.",
            "AJAX updates keep multiple stations in sync without full reloads.",
            "Generated weekly summary reports for library management.",
        ],
    },
    {
        title: "LumiNoesis AI",
        description:
            "AI-powered educational platform designed to help students learn through contextual tutoring, quizzes, and flashcards.",
        stack: ["React", "PHP", "FastAPI"],
        year: 2026,
        category: "AI / EDUCATION",
        thumbnail: luminoesisThumbnail,
        highlights: [
            "Contextual tutoring engine adapts questions to the learner.",
            "Flashcards and quizzes persist progress per student.",
            "Separate FastAPI service keeps the AI layer decoupled.",
        ],
    },
    {
        title: "This Portfolio",
        description:
            "The site you are looking at — a fast, glassmorphic single-page experience.",
        stack: ["React", "TypeScript", "Vite", "Tailwind CSS"],
        year: 2026,
        category: "PORTFOLIO",
        thumbnail: portfolioThumbnail,
        highlights: [
            "React Router pages with route-level code splitting.",
            "Live GitHub contribution graph fed by a serverless API route.",
            "Light and dark glass themes with a shared design-token system.",
        ],
    },
];