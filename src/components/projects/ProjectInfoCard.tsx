import { ExternalLink, Mail } from "lucide-react";

import type { Project } from "@/services/projects/projects";
import { useProfile } from "@/hooks/profile/useProfile";
import {
    demoAction,
    getProjectStatus,
    PROJECT_STATUS_LABELS,
    sourceAction,
    type LinkAction,
} from "./projectStatus";

function ActionButton({
    action,
    primary,
    children,
}: {
    action: LinkAction;
    primary?: boolean;
    children: React.ReactNode;
}) {
    if (action.kind === "none") {
        return null;
    }

    if (action.kind === "text") {
        return (
            <span
                className="
                    inline-flex
                    w-full
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    border
                    border-dashed
                    border-(--line)
                    px-4
                    py-2.5
                    text-[13px]
                    text-(--graphite-soft)
                "
            >
                {action.text}
            </span>
        );
    }

    return (
        <a
            href={action.href}
            target="_blank"
            rel="noreferrer"
            className={
                primary
                    ? `
                        inline-flex
                        w-full
                        items-center
                        justify-center
                        gap-2
                        rounded-xl
                        border
                        border-(--accent-strong)
                        bg-(--accent-strong)
                        px-4
                        py-2.5
                        text-[13px]
                        font-medium
                        text-white
                        transition-colors
                        duration-150
                        hover:border-(--accent-deep)
                        hover:bg-(--accent-deep)
                    `
                    : `
                        inline-flex
                        w-full
                        items-center
                        justify-center
                        gap-2
                        rounded-xl
                        border
                        border-(--glass-border)
                        bg-(--glass-bg)
                        px-4
                        py-2.5
                        text-[13px]
                        font-medium
                        text-(--ink)
                        transition-colors
                        duration-150
                        hover:border-(--accent-strong)
                        hover:text-(--accent-strong)
                    `
            }
        >
            {children}
        </a>
    );
}

export function ProjectInfoCard({ project }: { project: Project }) {
    const { profile } = useProfile();
    const source = sourceAction(project);
    const demo = demoAction(project);
    const hasLiveDemo = demo.kind === "link";

    const rows = [
        { label: "Role", value: project.case_role },
        { label: "Type", value: project.category },
        { label: "Status", value: PROJECT_STATUS_LABELS[getProjectStatus(project)] },
    ].filter((row) => row.value !== "");

    return (
        <div className="space-y-5 xl:sticky xl:top-8 xl:self-start">
            <div
                className="
                    rounded-2xl
                    border
                    border-(--glass-border)
                    bg-(--glass-bg)
                    p-6
                    shadow-[inset_0_1px_0_var(--glass-highlight)]
                    backdrop-blur-xl
                    backdrop-saturate-160
                "
            >
                <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-(--graphite-soft)">
                    Project info
                </p>

                {rows.length > 0 && (
                    <dl className="mt-4">
                        {rows.map((row) => (
                            <div key={row.label} className="mb-3.5 last:mb-0">
                                <dt className="font-mono text-[11px] text-(--graphite-soft)">
                                    {row.label}
                                </dt>
                                <dd className="mt-0.5 text-[14px] text-(--ink)">
                                    {row.value}
                                </dd>
                            </div>
                        ))}
                    </dl>
                )}

                {project.stack.length > 0 && (
                    <div className="mt-5">
                        <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-(--graphite-soft)">
                            Stack
                        </p>

                        <div className="mt-2.5 flex flex-wrap gap-1.5">
                            {project.stack.map((technology) => (
                                <span
                                    key={technology}
                                    className="rounded-full border border-(--accent-strong)/40 px-2.5 py-1 font-mono text-[9.5px] text-(--graphite)"
                                >
                                    {technology}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {(source.kind !== "none" || demo.kind !== "none") && (
                    <div className="mt-5 space-y-2.5">
                        {demo.kind !== "none" && (
                            <ActionButton action={demo} primary>
                                <ExternalLink size={15} strokeWidth={2} />
                                Open live demo
                            </ActionButton>
                        )}

                        {source.kind !== "none" && (
                            <ActionButton action={source}>
                                <ExternalLink size={15} strokeWidth={2} />
                                View source code
                            </ActionButton>
                        )}
                    </div>
                )}
            </div>

            {!hasLiveDemo && (
                <div className="rounded-2xl border border-(--line) bg-(--glass-bg) p-5">
                    <p className="text-[13.5px] font-medium text-(--ink)">
                        Why can&apos;t I open it?
                    </p>

                    {project.access_note !== "" && (
                        <p className="mt-2 text-[13px] leading-relaxed text-(--graphite)">
                            {project.access_note}
                        </p>
                    )}

                    {profile.email !== "" && (
                        <a
                            href={`mailto:${profile.email}`}
                            className="
                                mt-3
                                inline-flex
                                items-center
                                justify-center
                                gap-2
                                rounded-xl
                                border
                                border-(--glass-border)
                                bg-(--glass-bg)
                                px-4
                                py-2
                                text-[13px]
                                font-medium
                                text-(--ink)
                                transition-colors
                                duration-150
                                hover:border-(--accent-strong)
                                hover:text-(--accent-strong)
                            "
                        >
                            <Mail size={15} strokeWidth={2} />
                            Request a walkthrough
                        </a>
                    )}
                </div>
            )}
        </div>
    );
}
