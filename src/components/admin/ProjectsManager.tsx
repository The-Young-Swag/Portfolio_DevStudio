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
    sort_order: string;
};

const emptyFields: ProjectFormFields = {
    title: "",
    description: "",
    stack: "",
    year: "",
    category: "",
    thumbnail: "",
    highlights: "",
    sort_order: "",
};

function toFields(project: Project): ProjectFormFields {
    return {
        title: project.title,
        description: project.description,
        stack: project.stack.join(", "),
        year: String(project.year),
        category: project.category,
        thumbnail: project.thumbnail,
        highlights: project.highlights.join("\n"),
        sort_order: String(project.sort_order),
    };
}

function toInput(fields: ProjectFormFields): ProjectInput {
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
    const [formError, setFormError] = useState<string | null>(null);

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
        setFormError(null);
    }

    function startEdit(project: Project) {
        setEditingId(project.id);
        setFields(toFields(project));
        setFormError(null);
    }

    function cancelForm() {
        setEditingId(null);
        setFormError(null);
    }

    function handleSubmit(event: FormEvent) {
        event.preventDefault();
        setFormError(null);

        const input = toInput(fields);

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

    function setField(name: keyof ProjectFormFields, value: string) {
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

                        <label className="block">
                            <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-(--graphite-soft)">
                                Thumbnail (key or URL)
                            </span>
                            <input
                                value={fields.thumbnail}
                                onChange={(event) => setField("thumbnail", event.target.value)}
                                placeholder="arc-hive"
                                className="mt-1 w-full rounded-lg border border-(--glass-border) bg-white/40 px-3 py-2 text-[13px] text-(--ink) outline-none focus:border-(--accent-strong) dark:bg-black/20"
                            />
                        </label>

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
                    </div>

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
