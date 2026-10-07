import { useState } from "react";
import type { FormEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowDown, ArrowUp } from "lucide-react";

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
import { Field, FormError, adminFieldInputClassName } from "./AdminFields";
import { ConfirmDeleteButton, IconButton, PrimaryButton } from "./AdminButtons";
import { AccordionItem, AddRowButton, AdminSectionHead } from "./AdminList";
import { ImageUploadField } from "./ImageUploadField";
import { reorderSwap } from "./reorder";

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

function toInputForItem(project: Project, sortOrder: number): ProjectInput {
    return toInput(
        { ...toFields(project), sort_order: String(sortOrder) },
        project.case_screenshots.map((shot) => ({ id: -1, url: shot.url, caption: shot.caption })),
    );
}

function subtitleFor(fields: Pick<ProjectFormFields, "year" | "category">): string {
    return (
        [fields.year, fields.category].filter((part) => part !== "").join(" · ") ||
        "Not saved yet"
    );
}

function ProjectForm({
    fields,
    screenshots,
    formError,
    token,
    onUnauthorized,
    onField,
    onScreenshot,
    onMoveScreenshot,
    onRemoveScreenshot,
    onAddScreenshot,
}: {
    fields: ProjectFormFields;
    screenshots: ScreenshotDraft[];
    formError: string | null;
    token: string;
    onUnauthorized: () => void;
    onField: (name: keyof ProjectFormFields, value: string | boolean) => void;
    onScreenshot: (id: number, patch: Partial<ScreenshotDraft>) => void;
    onMoveScreenshot: (id: number, direction: -1 | 1) => void;
    onRemoveScreenshot: (id: number) => void;
    onAddScreenshot: () => void;
}) {
    return (
        <>
            <Field label="Title" wide>
                <input
                    value={fields.title}
                    onChange={(event) => onField("title", event.target.value)}
                    className={adminFieldInputClassName}
                />
            </Field>

            <Field label="Year">
                <input
                    value={fields.year}
                    onChange={(event) => onField("year", event.target.value)}
                    inputMode="numeric"
                    placeholder="e.g. 2026"
                    className={adminFieldInputClassName}
                />
            </Field>

            <Field label="Category">
                <input
                    value={fields.category}
                    onChange={(event) => onField("category", event.target.value)}
                    placeholder="e.g. Document archival"
                    className={adminFieldInputClassName}
                />
            </Field>

            <Field label="Description" hint="One or two sentences" wide>
                <textarea
                    value={fields.description}
                    onChange={(event) => onField("description", event.target.value)}
                    rows={3}
                    className={adminFieldInputClassName}
                />
            </Field>

            <Field label="Stack" hint="Comma-separated" wide>
                <input
                    value={fields.stack}
                    onChange={(event) => onField("stack", event.target.value)}
                    placeholder="e.g. React, TypeScript, Turso"
                    className={adminFieldInputClassName}
                />
            </Field>

            <Field label="Repository URL" wide>
                <input
                    value={fields.repo_url}
                    onChange={(event) => onField("repo_url", event.target.value)}
                    placeholder="https://github.com/…"
                    className={adminFieldInputClassName}
                />
            </Field>

            <Field label="Live URL" wide>
                <input
                    value={fields.live_url}
                    onChange={(event) => onField("live_url", event.target.value)}
                    placeholder="https://…"
                    className={adminFieldInputClassName}
                />
            </Field>

            <ImageUploadField
                label="Thumbnail"
                value={fields.thumbnail}
                onChange={(url) => onField("thumbnail", url)}
                token={token}
                onUnauthorized={onUnauthorized}
                aspect={16 / 9}
                maxEdge={1280}
            />

            <Field label="Source access">
                <select
                    value={fields.source_access}
                    onChange={(event) => onField("source_access", event.target.value)}
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
                    value={fields.demo_access}
                    onChange={(event) => onField("demo_access", event.target.value)}
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
                    value={fields.access_note}
                    onChange={(event) => onField("access_note", event.target.value)}
                    className={adminFieldInputClassName}
                />
            </Field>

            <Field label="Sort order">
                <input
                    value={fields.sort_order}
                    onChange={(event) => onField("sort_order", event.target.value)}
                    inputMode="numeric"
                    placeholder="0"
                    className={adminFieldInputClassName}
                />
            </Field>

            <Field label="Highlights" hint="One per line" wide>
                <textarea
                    value={fields.highlights}
                    onChange={(event) => onField("highlights", event.target.value)}
                    rows={4}
                    className={adminFieldInputClassName}
                />
            </Field>

            <div className="rounded-xl border border-(--line) p-4 sm:col-span-2">
                <label className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        checked={fields.has_case_study}
                        onChange={(event) => onField("has_case_study", event.target.checked)}
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
                            value={fields.case_problem}
                            onChange={(event) => onField("case_problem", event.target.value)}
                            rows={2}
                            className={adminFieldInputClassName}
                        />
                    </Field>

                    <Field label="My role">
                        <textarea
                            value={fields.case_role}
                            onChange={(event) => onField("case_role", event.target.value)}
                            rows={2}
                            className={adminFieldInputClassName}
                        />
                    </Field>

                    <Field label="What I built">
                        <textarea
                            value={fields.case_solution}
                            onChange={(event) => onField("case_solution", event.target.value)}
                            rows={2}
                            className={adminFieldInputClassName}
                        />
                    </Field>

                    <Field label="Result">
                        <textarea
                            value={fields.case_result}
                            onChange={(event) => onField("case_result", event.target.value)}
                            rows={2}
                            className={adminFieldInputClassName}
                        />
                    </Field>
                </div>
            </div>

            <div className="sm:col-span-2">
                <div className="flex items-baseline justify-between">
                    <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-(--graphite-soft)">
                        Screenshots
                    </span>

                    <button
                        type="button"
                        onClick={onAddScreenshot}
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
                            onChange={(url) => onScreenshot(shot.id, { url })}
                            token={token}
                            onUnauthorized={onUnauthorized}
                            aspect={16 / 9}
                            maxEdge={1280}
                        />

                        <Field label="Caption">
                            <input
                                value={shot.caption}
                                onChange={(event) =>
                                    onScreenshot(shot.id, { caption: event.target.value })
                                }
                                className={adminFieldInputClassName}
                            />
                        </Field>

                        <div className="flex gap-4">
                            <button
                                type="button"
                                onClick={() => onMoveScreenshot(shot.id, -1)}
                                disabled={index === 0}
                                className="font-mono text-[11px] text-(--graphite) transition-colors duration-150 hover:text-(--accent-strong) disabled:opacity-40"
                            >
                                ↑ Up
                            </button>
                            <button
                                type="button"
                                onClick={() => onMoveScreenshot(shot.id, 1)}
                                disabled={index === screenshots.length - 1}
                                className="font-mono text-[11px] text-(--graphite) transition-colors duration-150 hover:text-(--accent-strong) disabled:opacity-40"
                            >
                                ↓ Down
                            </button>
                            <button
                                type="button"
                                onClick={() => onRemoveScreenshot(shot.id)}
                                className="font-mono text-[11px] text-(--graphite) transition-colors duration-150 hover:text-red-500"
                            >
                                Remove
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {formError !== null && (
                <div className="sm:col-span-2">
                    <FormError message={formError} />
                </div>
            )}
        </>
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

    const [editor, setEditor] = useState<{
        id: number | "new";
        fields: ProjectFormFields;
        initial: ProjectFormFields;
        screenshots: ScreenshotDraft[];
        initialScreenshots: ScreenshotDraft[];
    } | null>(null);
    const [touched, setTouched] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [moving, setMoving] = useState(false);
    const [shotIdCounter, setShotIdCounter] = useState(0);

    const projects = projectsQuery.data ?? [];

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

    function openEditor(id: number | "new", project?: Project) {
        if (editor !== null && editor.id !== id && touched) {
            if (!window.confirm("Discard unsaved changes?")) {
                return;
            }
        }

        const fields = project === undefined ? emptyFields : toFields(project);
        const screenshots =
            project === undefined ? [] : toScreenshots(project, shotIdCounter + 1);
        setShotIdCounter((counter) => counter + screenshots.length);
        setEditor({ id, fields, initial: fields, screenshots, initialScreenshots: screenshots });
        setFormError(null);
        setDirty(false);
    }

    function toggleEditor(id: number | "new", project?: Project) {
        if (editor !== null && editor.id === id) {
            if (touched && !window.confirm("Discard unsaved changes?")) {
                return;
            }

            setEditor(null);
            setFormError(null);
            setDirty(false);
            return;
        }

        openEditor(id, project);
    }

    function closeEditor() {
        setEditor(null);
        setFormError(null);
        setDirty(false);
    }

    function commit() {
        if (editor === null) {
            return;
        }

        setFormError(null);
        const input = toInput(editor.fields, editor.screenshots);

        if (editor.id === "new") {
            createMutation.mutate(input, {
                onSuccess: () => {
                    closeEditor();
                    notify("Saved and live on your site");
                },
                onError: handleMutationError,
            });
        } else {
            updateMutation.mutate(
                { id: editor.id, input },
                {
                    onSuccess: () => {
                        closeEditor();
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

    function handleDelete(id: number) {
        deleteMutation.mutate(id, {
            onSuccess: () => {
                closeEditor();
                notify("Deleted");
            },
            onError: (error: unknown) => {
                if (isUnauthorized(error)) {
                    onUnauthorized();
                }
            },
        });
    }

    async function move(id: number, direction: -1 | 1) {
        const swap = reorderSwap(projects, id, direction);

        if (swap === null || moving) {
            return;
        }

        setMoving(true);

        try {
            await updateMutation.mutateAsync({
                id: swap.item.id,
                input: toInputForItem(swap.item, swap.itemOrder),
            });
            await updateMutation.mutateAsync({
                id: swap.neighbor.id,
                input: toInputForItem(swap.neighbor, swap.neighborOrder),
            });
            notify("Order saved");
        } catch (error) {
            if (isUnauthorized(error)) {
                onUnauthorized();
                return;
            }

            setFormError(error instanceof Error ? error.message : "Something went wrong.");
        } finally {
            setMoving(false);
        }
    }

    function setField(name: keyof ProjectFormFields, value: string | boolean) {
        if (editor === null) {
            return;
        }

        setEditor((current) =>
            current === null ? current : { ...current, fields: { ...current.fields, [name]: value } },
        );
        setDirty(true);
    }

    function updateScreenshots(updater: (shots: ScreenshotDraft[]) => ScreenshotDraft[]) {
        if (editor === null) {
            return;
        }

        setEditor((current) =>
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
    const openId = editor?.id ?? null;

    function editorFooter(id: number | "new") {
        return (
            <div className="mt-5 flex items-center gap-2.5 border-t border-(--line) pt-4">
                <PrimaryButton type="submit" form="project-editor" disabled={isSaving}>
                    {isSaving ? "Saving…" : "Save & publish"}
                </PrimaryButton>

                <span className="flex-1" />

                {id !== "new" && (
                    <>
                        <IconButton
                            label="Move project up"
                            onClick={() => move(id, -1)}
                            disabled={moving || reorderSwap(projects, id, -1) === null}
                        >
                            <ArrowUp size={16} strokeWidth={2} aria-hidden="true" />
                        </IconButton>

                        <IconButton
                            label="Move project down"
                            onClick={() => move(id, 1)}
                            disabled={moving || reorderSwap(projects, id, 1) === null}
                        >
                            <ArrowDown size={16} strokeWidth={2} aria-hidden="true" />
                        </IconButton>

                        <ConfirmDeleteButton
                            onConfirm={() => handleDelete(id)}
                            disabled={deleteMutation.isPending}
                        />
                    </>
                )}

                {id === "new" && (
                    <ConfirmDeleteButton
                        onConfirm={closeEditor}
                        confirmLabel="Click again to discard"
                    />
                )}
            </div>
        );
    }

    return (
        <div>
            <AdminSectionHead
                title="Projects"
                description="Case studies on the home page."
            />

            <div className="mt-6">
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
                ) : (
                    <div className="rounded-2xl border border-(--glass-border) bg-(--glass-bg) backdrop-blur-xl backdrop-saturate-160">
                        <div className="divide-y divide-(--line)">
                            {openId === "new" && editor !== null && (
                                <AccordionItem
                                    open
                                    title={editor.fields.title || "New project"}
                                    subtitle={subtitleFor(editor.fields)}
                                    tag={editor.fields.has_case_study ? "Case study" : ""}
                                    onToggle={() => toggleEditor("new")}
                                >
                                    <form
                                        id="project-editor"
                                        onSubmit={handleSubmit}
                                        className="grid gap-x-4 gap-y-3.5 sm:grid-cols-2"
                                    >
                                        <ProjectForm
                                            fields={editor.fields}
                                            screenshots={editor.screenshots}
                                            formError={formError}
                                            token={token}
                                            onUnauthorized={onUnauthorized}
                                            onField={setField}
                                            onScreenshot={updateScreenshot}
                                            onMoveScreenshot={moveScreenshot}
                                            onRemoveScreenshot={removeScreenshot}
                                            onAddScreenshot={addScreenshot}
                                        />
                                    </form>

                                    {editorFooter("new")}
                                </AccordionItem>
                            )}

                            {projects.length === 0 && openId !== "new" && (
                                <p className="px-5 py-4 font-mono text-[10.5px] text-(--graphite)">
                                    No projects yet.
                                </p>
                            )}

                            {projects.map((project) => {
                                const open = openId === project.id;

                                return (
                                    <AccordionItem
                                        key={project.id}
                                        open={open}
                                        title={
                                            open
                                                ? editor?.fields.title || project.title
                                                : project.title
                                        }
                                        subtitle={
                                            open && editor
                                                ? subtitleFor(editor.fields)
                                                : subtitleFor(toFields(project))
                                        }
                                        tag={project.has_case_study ? "Case study" : ""}
                                        onToggle={() => toggleEditor(project.id, project)}
                                    >
                                        {open && editor !== null && (
                                            <>
                                                <form
                                                    id="project-editor"
                                                    onSubmit={handleSubmit}
                                                    className="grid gap-x-4 gap-y-3.5 sm:grid-cols-2"
                                                >
                                                    <ProjectForm
                                                        fields={editor.fields}
                                                        screenshots={editor.screenshots}
                                                        formError={formError}
                                                        token={token}
                                                        onUnauthorized={onUnauthorized}
                                                        onField={setField}
                                                        onScreenshot={updateScreenshot}
                                                        onMoveScreenshot={moveScreenshot}
                                                        onRemoveScreenshot={removeScreenshot}
                                                        onAddScreenshot={addScreenshot}
                                                    />
                                                </form>

                                                {editorFooter(project.id)}
                                            </>
                                        )}
                                    </AccordionItem>
                                );
                            })}
                        </div>

                        <AddRowButton onClick={() => openEditor("new")}>
                            Add project
                        </AddRowButton>
                    </div>
                )}
            </div>
        </div>
    );
}
