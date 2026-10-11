import type { Project } from "@/services/projects/projects";
import { getProjectStatus, PROJECT_STATUS_LABELS } from "./projectStatus";

/**
 * Borderless status marker: dot plus label, no chip outline. The rail
 * and detail headers carry structure through type, not boxes.
 */
export function StatusBadge({ project }: { project: Project }) {
    const status = getProjectStatus(project);
    const open = status === "live";
    const unavailable = status === "undeployed";

    return (
        <span
            className="
                inline-flex
                items-center
                gap-1.5
                whitespace-nowrap
                font-mono
                text-[10.5px]
                text-(--graphite)
            "
        >
            <span
                aria-hidden="true"
                className={`
                    h-2
                    w-2
                    shrink-0
                    rounded-full
                    ${
                        open
                            ? "bg-(--accent-strong)"
                            : unavailable
                              ? "border border-dashed border-(--graphite)"
                              : "border border-(--accent-strong)"
                    }
                `}
            />
            {PROJECT_STATUS_LABELS[status]}
        </span>
    );
}
