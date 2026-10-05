import type { Project } from "@/services/projects/projects";

export function CaseStudy({ project }: { project: Project }) {
    const columns = [
        { label: "Problem", text: project.case_problem },
        { label: "What I built", text: project.case_solution },
        { label: "Result", text: project.case_result },
    ].filter((block) => block.text !== "");

    // Screenshots live in the gallery above and the title, year, role, and
    // access note each render once elsewhere on the page, so this section
    // keeps only the case columns and collapses otherwise.
    if (columns.length === 0) {
        return null;
    }

    return (
        <div className="mt-6 rounded-xl border border-(--line) p-4 sm:p-5">
            <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-(--accent-strong)">
                Case study
            </p>

            <div className="mt-4 grid gap-4 sm:grid-cols-3">
                {columns.map((block) => (
                    <div key={block.label} className="min-w-0">
                        <p className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-(--graphite-soft)">
                            {block.label}
                        </p>
                        <p className="mt-1 break-words text-[13px] leading-relaxed text-(--graphite)">
                            {block.text}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}
