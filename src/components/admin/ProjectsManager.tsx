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
import { isUnauthorized } from "@/services/api";
import { useAdminToast } from "./toastContext";
import { AdminDrawer } from "./AdminDrawer";
import { Field, FormError, adminFieldInputClassName } from "./AdminFields";
import { PrimaryButton, SecondaryButton } from "./AdminButtons";
import { AddButton, AdminRow, AdminSearchInput, AdminSectionHead } from "./AdminList";
import { SaveBar } from "./SaveBar";
import { ImageUploadField } from "./ImageUploadField";

type ProjectsManagerProps = {
    token: string;
    onUnauthorized: () => void;
    onDirtyChange: (dirty: boolean) => void;
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

const PROJECT_TABS = ["Basics", "Links", "Case study", "Screenshots"] as const;

function ProjectTabs({ tab, onChange }: { tab: number; onChange: (tab: number) => void }) {
    return (
        <div
            role="tablist"
            aria-label="Project sections"
            className="
                inline-flex
                gap-1
                rounded-2xl
                border
                border-(--line)
                bg-(--glass-bg)
                p-1
            "
        >
            {PROJECT_TABS.map((label, index) => (
                <button
                    key={label}
                    type="button"
                    role="tab"
                    aria-selected={tab === index}
                    onClick={() => onChange(index)}
                    className={`
                        rounded-xl
                        px-3.5
                        py-1.5
                        text-[13px]
                        transition-colors
                        duration-150
                        focus-visible:outline-none
                        focus-visible:ring-2
                        focus-visible:ring-(--accent-strong)
                        ${
                            tab === index
                                ? "bg-(--accent-strong) font-semibold text-white"
                                : "text-(--graphite) hover:text-(--ink)"
                        }
                    `}
                >
                    {label}
                </button>
            ))}
        </div>
    );
}

export function ProjectsManager({ token, onUnauthorized, onDirtyChange }: ProjectsManagerProps) {
    const projectsQuery = useQuery({
        queryKey: ["projects"],
        queryFn: getProjects,
        retry: 1,
        refetchOnWindowFocus: false,
    });

    const createMutation = useCreateProject(token);
    const updateMutation = useUpdateProject(token);
    const deleteMutation = useDeleteProject(token);
    const notify = useAdminToast();

    const [drawer, setDrawer] = useState<{
        id: number | "new";
        fields: ProjectFormFields;
        initial: ProjectFormFields;
        screenshots: ScreenshotDraft[];
        initialScreenshots: ScreenshotDraft[];
    } | null>(null);
    const [touched, setTouched] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [tab, setTab] = useState(0);
    const [shotIdCounter, setShotIdCounter] = useState(0);

    function setDirty(next: boolean) {
        setTouched(next);
        onDirtyChange(next);
    }

    function handleMutationError(error: unknown) {
        if (isUnauthorized(error)) {
            onUnauthorized();
            return;
        }

        setFormError(error instanceof Error ? error.message : "Something went wrong.");
    }

    function openDrawer(id: number | "new", project?: Project) {
        const fields = project === undefined ? emptyFields : toFields(project);
        const screenshots =
            project === undefined ? [] : toScreenshots(project, shotIdCounter + 1);
        setShotIdCounter((counter) => counter + screenshots.length);
        setDrawer({ id, fields, initial: fields, screenshots, initialScreenshots: screenshots });
        setFormError(null);
        setTab(0);
        setDirty(false);
    }

    function closeDrawer() {
        if (touched && !window.confirm("Discard unsaved changes?")) {
            return;
        }

        setDrawer(null);
        setFormError(null);
        setDirty(false);
    }

    function discard() {
        if (drawer === null) {
            return;
        }

        setDrawer({ ...drawer, fields: drawer.initial, screenshots: drawer.initialScreenshots });
        setFormError(null);
        setDirty(false);
    }

    function commit() {
        if (drawer === null) {
            return;
        }

        setFormError(null);
        const input = toInput(drawer.fields, drawer.screenshots);

        if (drawer.id === "new") {
            createMutation.mutate(input, {
                onSuccess: () => {
                    setDrawer(null);
                    setDirty(false);
                    notify("Saved and live on your site");
                },
                onError: handleMutationError,
            });
        } else {
            updateMutation.mutate(
                { id: drawer.id, input },
                {
                    onSuccess: () => {
                        setDrawer(null);
                        setDirty(false);
                        notify("Saved and live on your site");
                    },
                    onError: handleMutationError,
                },
            );
        }
    }

    function handleSubmit(event: FormEvent) {
        event.preventDefault();
        commit();
    }

    function handleDelete(project: Project) {
        if (!window.confirm(`Delete "${project.title}"? This goes live immediately.`)) {
            return;
        }

        deleteMutation.mutate(project.id, {
            onSuccess: () => notify("Deleted"),
            onError: (error: unknown) => {
                if (isUnauthorized(error)) {
                    onUnauthorized();
                }
            },
        });
    }

    function setField(name: keyof ProjectFormFields, value: string | boolean) {
        if (drawer === null) {
            return;
        }

        setDrawer((current) =>
            current === null ? current : { ...current, fields: { ...current.fields, [name]: value } },
        );
        setDirty(true);
    }

    function updateScreenshots(updater: (shots: ScreenshotDraft[]) => ScreenshotDraft[]) {
        if (drawer === null) {
            return;
        }

        setDrawer((current) =>
            current === null ? current : { ...current, screenshots: updater(current.screenshots) },
        );
        setDirty(true);
    }

    function updateScreenshot(id: number, patch: Partial<ScreenshotDraft>) {
        updateScreenshots((current) =>
            current.map((shot) => (shot.id === id ? { ...shot, ...patch } : shot)),
        );
    }

    function moveScreenshot(id: number, direction: -1 | 1) {
        updateScreenshots((current) => {
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
        updateScreenshots((current) => current.filter((shot) => shot.id !== id));
    }

    function addScreenshot() {
        setShotIdCounter((counter) => counter + 1);
        const id = shotIdCounter + 1;
        updateScreenshots((current) => [...current, { id, url: "", caption: "" }]);
    }

    const isSaving = createMutation.isPending || updateMutation.isPending;
    const projects = projectsQuery.data ?? [];
    const query = search.trim().toLowerCase();
    const visible =
        query === ""
            ? projects
            : projects.filter((project) =>
                  `${project.title} ${project.category} ${project.year}`
                      .toLowerCase()
                      .includes(query),
              );
    const screenshots = drawer?.screenshots ?? [];

    return (
        <div>
            <AdminSectionHead
                title="Projects"
                description="Case studies shown on the home page."
                action={<AddButton onClick={() => openDrawer("new")}>Add project</AddButton>}
            />

            <div className="mt-5">
                <AdminSearchInput
                    value={search}
                    onChange={setSearch}
                    placeholder="Search projects…"
                />
            </div>

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
                ) : visible.length === 0 ? (
                    <p className="font-mono text-[10.5px] text-(--graphite)">
                        {projects.length === 0 ? "No projects yet." : "No projects match the search."}
                    </p>
                ) : (
                    <ul className="divide-y divide-(--line) rounded-2xl border border-(--glass-border) bg-(--glass-bg) backdrop-blur-xl backdrop-saturate-160">
                        {visible.map((project) => (
                            <AdminRow
                                key={project.id}
                                title={project.title}
                                subtitle={`${project.year} · ${project.category}`}
                                tag={project.has_case_study ? "Case study" : ""}
                                onEdit={() => openDrawer(project.id, project)}
                                onDelete={() => handleDelete(project)}
                                deleting={deleteMutation.isPending}
                            />
                        ))}
                    </ul>
                )}
            </div>

            <AdminDrawer
                open={drawer !== null}
                title={drawer !== null && drawer.id === "new" ? "Add project" : "Edit project"}
                onClose={closeDrawer}
                footer={
                    <>
                        <PrimaryButton
                            type="submit"
                            form="project-editor"
                            disabled={isSaving}
                        >
                            {isSaving ? "Saving…" : "Save & publish"}
                        </PrimaryButton>

                        <SecondaryButton onClick={closeDrawer}>Cancel</SecondaryButton>
                    </>
                }
            >
                {drawer !== null && (
                    <>
                        <ProjectTabs tab={tab} onChange={setTab} />

                        <form
                            id="project-editor"
                            onSubmit={handleSubmit}
                            className="grid gap-3 sm:grid-cols-2"
                        >
                            {tab === 0 && (
                                <>
                                    <Field label="Title" wide>
                            <input
                                value={drawer.fields.title}
                                onChange={(event) => setField("title", event.target.value)}
                                className={adminFieldInputClassName}
                            />
                        </Field>

                        <Field label="Year">
                            <input
                                value={drawer.fields.year}
                                onChange={(event) => setField("year", event.target.value)}
                                inputMode="numeric"
                                placeholder="2026"
                                className={adminFieldInputClassName}
                            />
                        </Field>

                        <Field label="Category">
                            <input
                                value={drawer.fields.category}
                                onChange={(event) => setField("category", event.target.value)}
                                placeholder="Document archival"
                                className={adminFieldInputClassName}
                            />
                        </Field>

                        <Field label="Description" hint="One or two sentences" wide>
                            <textarea
                                value={drawer.fields.description}
                                onChange={(event) => setField("description", event.target.value)}
                                rows={3}
                                className={adminFieldInputClassName}
                            />
                        </Field>

                        <Field label="Stack" hint="Comma-separated" wide>
                            <input
                                value={drawer.fields.stack}
                                onChange={(event) => setField("stack", event.target.value)}
                                placeholder="React, TypeScript, Turso"
                                className={adminFieldInputClassName}
                            />
                        </Field>

                        <ImageUploadField
                            label="Thumbnail"
                            value={drawer.fields.thumbnail}
                            onChange={(url) => setField("thumbnail", url)}
                            token={token}
                            onUnauthorized={onUnauthorized}
                            aspect={16 / 9}
                            maxEdge={1280}
                        />

                        <Field label="Sort order">
                            <input
                                value={drawer.fields.sort_order}
                                onChange={(event) => setField("sort_order", event.target.value)}
                                inputMode="numeric"
                                placeholder="0"
                                className={adminFieldInputClassName}
                            />
                        </Field>

                        <Field label="Highlights" hint="One per line" wide>
                            <textarea
                                value={drawer.fields.highlights}
                                onChange={(event) => setField("highlights", event.target.value)}
                                rows={4}
                                className={adminFieldInputClassName}
                            />
                        </Field>
                    </>
                )}

                {tab === 1 && (
                    <>
                        <Field label="Repository URL" wide>
                            <input
                                value={drawer.fields.repo_url}
                                onChange={(event) => setField("repo_url", event.target.value)}
                                placeholder="https://github.com/…"
                                className={adminFieldInputClassName}
                            />
                        </Field>

                        <Field label="Live URL" wide>
                            <input
                                value={drawer.fields.live_url}
                                onChange={(event) => setField("live_url", event.target.value)}
                                placeholder="https://…"
                                className={adminFieldInputClassName}
                            />
                        </Field>

                        <Field label="Source access">
                            <select
                                value={drawer.fields.source_access}
                                onChange={(event) => setField("source_access", event.target.value)}
                                className={adminFieldInputClassName}
                            >
                                {SOURCE_OPTIONS.map((option) => (
                                    <option key={option.label} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </Field>

                        <Field label="Demo access">
                            <select
                                value={drawer.fields.demo_access}
                                onChange={(event) => setField("demo_access", event.target.value)}
                                className={adminFieldInputClassName}
                            >
                                {DEMO_OPTIONS.map((option) => (
                                    <option key={option.label} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </Field>

                        <Field label="Access note" hint="Shown when links are unavailable" wide>
                            <input
                                value={drawer.fields.access_note}
                                onChange={(event) => setField("access_note", event.target.value)}
                                className={adminFieldInputClassName}
                            />
                        </Field>
                    </>
                )}

                {tab === 2 && (
                    <>
                        <div className="rounded-xl border border-(--line) p-4 sm:col-span-2">
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={drawer.fields.has_case_study}
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
                                <Field label="Problem">
                                    <textarea
                                        value={drawer.fields.case_problem}
                                        onChange={(event) => setField("case_problem", event.target.value)}
                                        rows={2}
                                        className={adminFieldInputClassName}
                                    />
                                </Field>

                                <Field label="My role">
                                    <textarea
                                        value={drawer.fields.case_role}
                                        onChange={(event) => setField("case_role", event.target.value)}
                                        rows={2}
                                        className={adminFieldInputClassName}
                                    />
                                </Field>

                                <Field label="What I built">
                                    <textarea
                                        value={drawer.fields.case_solution}
                                        onChange={(event) => setField("case_solution", event.target.value)}
                                        rows={2}
                                        className={adminFieldInputClassName}
                                    />
                                </Field>

                                <Field label="Result">
                                    <textarea
                                        value={drawer.fields.case_result}
                                        onChange={(event) => setField("case_result", event.target.value)}
                                        rows={2}
                                        className={adminFieldInputClassName}
                                    />
                                </Field>
                            </div>
                        </div>
                    </>
                )}

                {tab === 3 && (
                    <>
                        <div className="sm:col-span-2">
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

                                    <Field label="Caption">
                                        <input
                                            value={shot.caption}
                                            onChange={(event) =>
                                                updateScreenshot(shot.id, { caption: event.target.value })
                                            }
                                            className={adminFieldInputClassName}
                                        />
                                    </Field>

                                    <div className="flex gap-4">
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
                    </>
                )}

                        {formError !== null && (
                            <div className="sm:col-span-2">
                                <FormError message={formError} />
                            </div>
                        )}
                    </form>
                    </>
                )}
            </AdminDrawer>

            <SaveBar
                open={touched && drawer !== null}
                saving={isSaving}
                onSave={commit}
                onDiscard={discard}
            />
        </div>
    );
}
