import { useState } from "react";
import type { FormEvent } from "react";
import { useQuery } from "@tanstack/react-query";

import {
    useCreateProject,
    useDeleteProject,
    useUpdateProject,
} from "@/hooks/projects/useProjects";
import {
    getProjects,
    type Project,
    type ProjectInput,
} from "@/services/projects/projects";
import { ApiError } from "@/services/api";
import { ImageUploadField } from "./ImageUploadField";

type ProjectsManagerProps = {
    token: string;
    onUnauthorized: () => void;
};

type ProjectFormFields = {
    title: string;
    description: string;
    stack: string;
    year: string;
    category: string;
    thumbnail: string;
    highlights: string;
    repo_url: string;
    live_url: string;
    source_access: string;
    demo_access: string;
    access_note: string;
    has_case_study: boolean;
    case_problem: string;
    case_role: string;
    case_solution: string;
    case_result: string;
    sort_order: string;
};

type ScreenshotDraft = {
    id: number;
    url: string;
    caption: string;
};

const emptyFields: ProjectFormFields = {
    title: "",
    description: "",
    stack: "",
    year: "",
    category: "",
    thumbnail: "",
    highlights: "",
    repo_url: "",
    live_url: "",
    source_access: "",
    demo_access: "",
    access_note: "",
    has_case_study: false,
    case_problem: "",
    case_role: "",
    case_solution: "",
    case_result: "",
    sort_order: "",
};

const SOURCE_OPTIONS = [
    { value: "", label: "Auto (from URLs)" },
    { value: "public", label: "Public" },
    { value: "private", label: "Private" },
];

const DEMO_OPTIONS = [
    { value: "", label: "Auto (from URLs)" },
    { value: "public", label: "Public" },
    { value: "internal", label: "Internal network only" },
    { value: "offline", label: "Offline" },
    { value: "none", label: "No demo" },
];

function toFields(project: Project): ProjectFormFields {
    return {
        title: project.title,
        description: project.description,
        stack: project.stack.join(", "),
        year: String(project.year),
        category: project.category,
        thumbnail: project.thumbnail,
        highlights: project.highlights.join("\n"),
        repo_url: project.repo_url,
        live_url: project.live_url,
        source_access: project.source_access ?? "",
        demo_access: project.demo_access ?? "",
        access_note: project.access_note,
        has_case_study: project.has_case_study,
        case_problem: project.case_problem,
        case_role: project.case_role,
        case_solution: project.case_solution,
        case_result: project.case_result,
        sort_order: String(project.sort_order),
    };
}

function toScreenshots(project: Project, firstId: number): ScreenshotDraft[] {
    return project.case_screenshots.map((shot, index) => ({
        id: firstId + index,
        url: shot.url,
        caption: shot.caption,
    }));
}

function toInput(
    fields: ProjectFormFields,
    screenshots: ScreenshotDraft[],
): ProjectInput {
    return {
        title: fields.title.trim(),
        description: fields.description.trim(),
        stack: fields.stack
            .split(",")
            .map((item) => item.trim())
            .filter((item) => item.length > 0),
        year: Number(fields.year),
        category: fields.category.trim(),
        thumbnail: fields.thumbnail.trim(),
        highlights: fields.highlights
            .split("\n")
            .map((item) => item.trim())
            .filter((item) => item.length > 0),
        repo_url: fields.repo_url.trim(),
        live_url: fields.live_url.trim(),
        source_access: fields.source_access === "" ? null : (fields.source_access as "public" | "private"),
        demo_access:
            fields.demo_access === ""
                ? null
                : (fields.demo_access as "public" | "internal" | "offline" | "none"),
        access_note: fields.access_note.trim(),
        has_case_study: fields.has_case_study,
        case_problem: fields.case_problem.trim(),
        case_role: fields.case_role.trim(),
        case_solution: fields.case_solution.trim(),
        case_result: fields.case_result.trim(),
        case_screenshots: screenshots
            .map((shot) => ({ url: shot.url.trim(), caption: shot.caption.trim() }))
            .filter((shot) => shot.url !== ""),
        sort_order: fields.sort_order.trim() === "" ? 0 : Number(fields.sort_order),
    };
}

function isUnauthorized(error: unknown): boolean {
    return error instanceof ApiError && error.status === 401;
}

export function ProjectsManager({ token, onUnauthorized }: ProjectsManagerProps) {
    const projectsQuery = useQuery({
        queryKey: ["projects"],
        queryFn: getProjects,
        retry: 1,
        refetchOnWindowFocus: false,
    });

    const createMutation = useCreateProject(token);
    const updateMutation = useUpdateProject(token);
    const deleteMutation = useDeleteProject(token);

    const [editingId, setEditingId] = useState<number | "new" | null>(null);
    const [fields, setFields] = useState<ProjectFormFields>(emptyFields);
    const [screenshots, setScreenshots] = useState<ScreenshotDraft[]>([]);
    const [formError, setFormError] = useState<string | null>(null);
    const [shotIdCounter, setShotIdCounter] = useState(0);

    function handleMutationError(error: unknown) {
        if (isUnauthorized(error)) {
            onUnauthorized();
            return;
        }

        setFormError(error instanceof Error ? error.message : "Something went wrong.");
    }

    function startAdd() {
        setEditingId("new");
        setFields(emptyFields);
        setScreenshots([]);
        setFormError(null);
    }

    function startEdit(project: Project) {
        setEditingId(project.id);
        setFields(toFields(project));
        setScreenshots(toScreenshots(project, shotIdCounter + 1));
        setShotIdCounter(shotIdCounter + project.case_screenshots.length);
        setFormError(null);
    }

    function cancelForm() {
        setEditingId(null);
        setFormError(null);
    }

    function updateScreenshot(id: number, patch: Partial<ScreenshotDraft>) {
        setScreenshots((current) =>
            current.map((shot) => (shot.id === id ? { ...shot, ...patch } : shot)),
        );
    }

    function moveScreenshot(id: number, direction: -1 | 1) {
        setScreenshots((current) => {
            const index = current.findIndex((shot) => shot.id === id);
            const target = index + direction;

            if (index < 0 || target < 0 || target >= current.length) {
                return current;
            }

            const next = [...current];
            next[index] = current[target];
            next[target] = current[index];
            return next;
        });
    }

    function removeScreenshot(id: number) {
        setScreenshots((current) => current.filter((shot) => shot.id !== id));
    }

    function addScreenshot() {
        setShotIdCounter((counter) => counter + 1);
        setScreenshots((current) => [
            ...current,
            { id: shotIdCounter + 1, url: "", caption: "" },
        ]);
    }

    function handleSubmit(event: FormEvent) {
        event.preventDefault();
        setFormError(null);

        const input = toInput(fields, screenshots);

        if (editingId === "new") {
            createMutation.mutate(input, {
                onSuccess: cancelForm,
                onError: handleMutationError,
            });
        } else if (typeof editingId === "number") {
            updateMutation.mutate(
                { id: editingId, input },
                {
                    onSuccess: cancelForm,
                    onError: handleMutationError,
                },
            );
        }
    }

    function handleDelete(project: Project) {
        if (!window.confirm(`Delete "${project.title}"?`)) {
            return;
        }

        deleteMutation.mutate(project.id, {
            onError: (error: unknown) => {
                if (isUnauthorized(error)) {
                    onUnauthorized();
                }
            },
        });
    }

    function setField(name: keyof ProjectFormFields, value: string | boolean) {
        setFields((current) => ({ ...current, [name]: value }));
    }

    const isSaving = createMutation.isPending || updateMutation.isPending;

    return (
        <section aria-label="Projects">
            <div className="mt-8 flex items-baseline justify-between">
                <h2 className="font-display text-[20px] font-medium text-(--ink)">
                    Projects
                </h2>

                <button
                    type="button"
                    onClick={startAdd}
                    className="
                        font-mono
                        text-[11px]
                        text-(--accent-strong)
                        hover:underline
                    "
                >
                    Add project
                </button>
            </div>

            {editingId !== null && (
                <form
                    onSubmit={handleSubmit}
                    className="
                        mt-4
                        space-y-3
                        rounded-2xl
                        border
                        border-(--glass-border)
                        bg-(--glass-bg)
                        p-5
                        backdrop-blur-xl
                        backdrop-saturate-160
                    "
                >
                    <div className="grid gap-3 sm:grid-cols-2">
                        <label className="block">
                            <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-(--graphite-soft)">
                                Title
                            </span>
                            <input
                                value={fields.title}
                                onChange={(event) => setField("title", event.target.value)}
                                className="mt-1 w-full rounded-lg border border-(--glass-border) bg-white/40 px-3 py-2 text-[13px] text-(--ink) outline-none focus:border-(--accent-strong) dark:bg-black/20"
                            />
                        </label>

                        <label className="block">
                            <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-(--graphite-soft)">
                                Year
                            </span>
                            <input
                                value={fields.year}
                                onChange={(event) => setField("year", event.target.value)}
                                inputMode="numeric"
                                placeholder="2026"
                                className="mt-1 w-full rounded-lg border border-(--glass-border) bg-white/40 px-3 py-2 text-[13px] text-(--ink) outline-none focus:border-(--accent-strong) dark:bg-black/20"
                            />
                        </label>

                        <label className="block">
                            <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-(--graphite-soft)">
                                Category
                            </span>
                            <input
                                value={fields.category}
                                onChange={(event) => setField("category", event.target.value)}
                                className="mt-1 w-full rounded-lg border border-(--glass-border) bg-white/40 px-3 py-2 text-[13px] text-(--ink) outline-none focus:border-(--accent-strong) dark:bg-black/20"
                            />
                        </label>

                        <div>
                            <ImageUploadField
                                label="Thumbnail"
                                value={fields.thumbnail}
                                onChange={(url) => setField("thumbnail", url)}
                                token={token}
                                onUnauthorized={onUnauthorized}
                                aspect={16 / 9}
                                maxEdge={1280}
                            />
                        </div>

                        <label className="block">
                            <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-(--graphite-soft)">
                                Stack (comma-separated)
                            </span>
                            <input
                                value={fields.stack}
                                onChange={(event) => setField("stack", event.target.value)}
                                placeholder="React, TypeScript, Vite"
                                className="mt-1 w-full rounded-lg border border-(--glass-border) bg-white/40 px-3 py-2 text-[13px] text-(--ink) outline-none focus:border-(--accent-strong) dark:bg-black/20"
                            />
                        </label>

                        <label className="block">
                            <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-(--graphite-soft)">
                                Repo URL
                            </span>
                            <input
                                value={fields.repo_url}
                                onChange={(event) => setField("repo_url", event.target.value)}
                                placeholder="https://github.com/…"
                                className="mt-1 w-full rounded-lg border border-(--glass-border) bg-white/40 px-3 py-2 text-[13px] text-(--ink) outline-none focus:border-(--accent-strong) dark:bg-black/20"
                            />
                        </label>

                        <label className="block">
                            <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-(--graphite-soft)">
                                Live URL
                            </span>
                            <input
                                value={fields.live_url}
                                onChange={(event) => setField("live_url", event.target.value)}
                                placeholder="https://…"
                                className="mt-1 w-full rounded-lg border border-(--glass-border) bg-white/40 px-3 py-2 text-[13px] text-(--ink) outline-none focus:border-(--accent-strong) dark:bg-black/20"
                            />
                        </label>

                        <label className="block">
                            <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-(--graphite-soft)">
                                Sort order
                            </span>
                            <input
                                value={fields.sort_order}
                                onChange={(event) => setField("sort_order", event.target.value)}
                                inputMode="numeric"
                                placeholder="0"
                                className="mt-1 w-full rounded-lg border border-(--glass-border) bg-white/40 px-3 py-2 text-[13px] text-(--ink) outline-none focus:border-(--accent-strong) dark:bg-black/20"
                            />
                        </label>

                        <label className="block">
                            <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-(--graphite-soft)">
                                Source access
                            </span>
                            <select
                                value={fields.source_access}
                                onChange={(event) => setField("source_access", event.target.value)}
                                className="mt-1 w-full rounded-lg border border-(--glass-border) bg-white/40 px-3 py-2 text-[13px] text-(--ink) outline-none focus:border-(--accent-strong) dark:bg-black/20"
                            >
                                {SOURCE_OPTIONS.map((option) => (
                                    <option key={option.label} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label className="block">
                            <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-(--graphite-soft)">
                                Demo access
                            </span>
                            <select
                                value={fields.demo_access}
                                onChange={(event) => setField("demo_access", event.target.value)}
                                className="mt-1 w-full rounded-lg border border-(--glass-border) bg-white/40 px-3 py-2 text-[13px] text-(--ink) outline-none focus:border-(--accent-strong) dark:bg-black/20"
                            >
                                {DEMO_OPTIONS.map((option) => (
                                    <option key={option.label} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </label>
                    </div>

                    <label className="block">
                        <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-(--graphite-soft)">
                            Access note
                        </span>
                        <input
                            value={fields.access_note}
                            onChange={(event) => setField("access_note", event.target.value)}
                            placeholder="Available on request, VPN only, …"
                            className="mt-1 w-full rounded-lg border border-(--glass-border) bg-white/40 px-3 py-2 text-[13px] text-(--ink) outline-none focus:border-(--accent-strong) dark:bg-black/20"
                        />
                    </label>

                    <label className="block">
                        <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-(--graphite-soft)">
                            Description
                        </span>
                        <textarea
                            value={fields.description}
                            onChange={(event) => setField("description", event.target.value)}
                            rows={3}
                            className="mt-1 w-full rounded-lg border border-(--glass-border) bg-white/40 px-3 py-2 text-[13px] text-(--ink) outline-none focus:border-(--accent-strong) dark:bg-black/20"
                        />
                    </label>

                    <label className="block">
                        <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-(--graphite-soft)">
                            Highlights (one per line)
                        </span>
                        <textarea
                            value={fields.highlights}
                            onChange={(event) => setField("highlights", event.target.value)}
                            rows={4}
                            className="mt-1 w-full rounded-lg border border-(--glass-border) bg-white/40 px-3 py-2 text-[13px] text-(--ink) outline-none focus:border-(--accent-strong) dark:bg-black/20"
                        />
                    </label>

                    <div className="rounded-xl border border-(--line) p-4">
                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={fields.has_case_study}
                                onChange={(event) => setField("has_case_study", event.target.checked)}
                                className="h-4 w-4 accent-(--accent-strong)"
                            />
                            <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-(--graphite-soft)">
                                Has case study
                            </span>
                        </label>

                        <p className="mt-3 font-mono text-[10.5px] leading-relaxed text-(--graphite)">
                            Never show a dead link. Redact personal data in
                            screenshots. Describe your own role precisely.
                            Prefer a short screen recording link, redacted
                            screenshots, or your own architecture diagram as
                            proof.
                        </p>

                        <div className="mt-3 space-y-3">
                            <label className="block">
                                <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-(--graphite-soft)">
                                    Problem
                                </span>
                                <textarea
                                    value={fields.case_problem}
                                    onChange={(event) => setField("case_problem", event.target.value)}
                                    rows={2}
                                    className="mt-1 w-full rounded-lg border border-(--glass-border) bg-white/40 px-3 py-2 text-[13px] text-(--ink) outline-none focus:border-(--accent-strong) dark:bg-black/20"
                                />
                            </label>

                            <label className="block">
                                <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-(--graphite-soft)">
                                    My role
                                </span>
                                <textarea
                                    value={fields.case_role}
                                    onChange={(event) => setField("case_role", event.target.value)}
                                    rows={2}
                                    className="mt-1 w-full rounded-lg border border-(--glass-border) bg-white/40 px-3 py-2 text-[13px] text-(--ink) outline-none focus:border-(--accent-strong) dark:bg-black/20"
                                />
                            </label>

                            <label className="block">
                                <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-(--graphite-soft)">
                                    What I built
                                </span>
                                <textarea
                                    value={fields.case_solution}
                                    onChange={(event) => setField("case_solution", event.target.value)}
                                    rows={2}
                                    className="mt-1 w-full rounded-lg border border-(--glass-border) bg-white/40 px-3 py-2 text-[13px] text-(--ink) outline-none focus:border-(--accent-strong) dark:bg-black/20"
                                />
                            </label>

                            <label className="block">
                                <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-(--graphite-soft)">
                                    Result
                                </span>
                                <textarea
                                    value={fields.case_result}
                                    onChange={(event) => setField("case_result", event.target.value)}
                                    rows={2}
                                    className="mt-1 w-full rounded-lg border border-(--glass-border) bg-white/40 px-3 py-2 text-[13px] text-(--ink) outline-none focus:border-(--accent-strong) dark:bg-black/20"
                                />
                            </label>
                        </div>

                        <div className="mt-4">
                            <div className="flex items-baseline justify-between">
                                <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-(--graphite-soft)">
                                    Screenshots
                                </span>

                                <button
                                    type="button"
                                    onClick={addScreenshot}
                                    className="font-mono text-[11px] text-(--accent-strong) hover:underline"
                                >
                                    Add screenshot
                                </button>
                            </div>

                            {screenshots.map((shot, index) => (
                                <div
                                    key={shot.id}
                                    className="mt-3 space-y-2 rounded-xl border border-(--line) p-3"
                                >
                                    <ImageUploadField
                                        label={`Screenshot ${index + 1}`}
                                        value={shot.url}
                                        onChange={(url) => updateScreenshot(shot.id, { url })}
                                        token={token}
                                        onUnauthorized={onUnauthorized}
                                        aspect={16 / 9}
                                        maxEdge={1280}
                                    />

                                    <label className="block">
                                        <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-(--graphite-soft)">
                                            Caption
                                        </span>
                                        <input
                                            value={shot.caption}
                                            onChange={(event) =>
                                                updateScreenshot(shot.id, { caption: event.target.value })
                                            }
                                            className="mt-1 w-full rounded-lg border border-(--glass-border) bg-white/40 px-3 py-2 text-[13px] text-(--ink) outline-none focus:border-(--accent-strong) dark:bg-black/20"
                                        />
                                    </label>

                                    <div className="flex gap-3">
                                        <button
                                            type="button"
                                            onClick={() => moveScreenshot(shot.id, -1)}
                                            disabled={index === 0}
                                            className="font-mono text-[11px] text-(--graphite) transition-colors duration-150 hover:text-(--accent-strong) disabled:opacity-40"
                                        >
                                            ↑ Up
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => moveScreenshot(shot.id, 1)}
                                            disabled={index === screenshots.length - 1}
                                            className="font-mono text-[11px] text-(--graphite) transition-colors duration-150 hover:text-(--accent-strong) disabled:opacity-40"
                                        >
                                            ↓ Down
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => removeScreenshot(shot.id)}
                                            className="font-mono text-[11px] text-(--graphite) transition-colors duration-150 hover:text-red-500"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {formError !== null && (
                        <p className="font-mono text-[11px] text-red-500">{formError}</p>
                    )}

                    <div className="flex gap-3">
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="
                                rounded-lg
                                border
                                border-(--accent-strong)
                                bg-(--accent-strong)
                                px-4
                                py-2
                                text-[12.5px]
                                font-medium
                                text-white
                                transition-colors
                                duration-150
                                hover:border-(--accent-deep)
                                hover:bg-(--accent-deep)
                                disabled:opacity-60
                            "
                        >
                            {isSaving ? "Saving..." : "Save"}
                        </button>

                        <button
                            type="button"
                            onClick={cancelForm}
                            className="
                                rounded-lg
                                border
                                border-(--glass-border)
                                bg-(--glass-bg)
                                px-4
                                py-2
                                text-[12.5px]
                                font-medium
                                text-(--ink)
                                transition-colors
                                duration-150
                                hover:border-(--accent-strong)
                                hover:text-(--accent-strong)
                            "
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            )}

            <div className="mt-4">
                {projectsQuery.isPending ? (
                    <p className="font-mono text-[10.5px] text-(--graphite)">
                        Loading projects...
                    </p>
                ) : projectsQuery.isError ? (
                    <div className="flex items-center gap-3">
                        <p className="font-mono text-[10.5px] text-(--graphite)">
                            Unable to load projects.
                        </p>
                        <button
                            type="button"
                            onClick={() => projectsQuery.refetch()}
                            className="font-mono text-[11px] text-(--accent-strong) hover:underline"
                        >
                            Retry
                        </button>
                    </div>
                ) : projectsQuery.data.length === 0 ? (
                    <p className="font-mono text-[10.5px] text-(--graphite)">
                        No projects yet.
                    </p>
                ) : (
                    <ul className="divide-y divide-(--line) rounded-2xl border border-(--glass-border) bg-(--glass-bg) backdrop-blur-xl backdrop-saturate-160">
                        {projectsQuery.data.map((project) => (
                            <li
                                key={project.id}
                                className="flex items-center justify-between gap-4 p-4"
                            >
                                <div className="min-w-0">
                                    <p className="truncate font-display text-[16px] text-(--ink)">
                                        {project.title}
                                    </p>
                                    <p className="mt-0.5 font-mono text-[10.5px] text-(--graphite-soft)">
                                        {project.year} · {project.category}
                                    </p>
                                </div>

                                <div className="flex shrink-0 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => startEdit(project)}
                                        className="font-mono text-[11px] text-(--graphite) transition-colors duration-150 hover:text-(--accent-strong)"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleDelete(project)}
                                        disabled={deleteMutation.isPending}
                                        className="font-mono text-[11px] text-(--graphite) transition-colors duration-150 hover:text-red-500 disabled:opacity-60"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </section>
    );
}
