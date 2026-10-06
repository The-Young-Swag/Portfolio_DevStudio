import { useState } from "react";
import type { FormEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowDown, ArrowUp } from "lucide-react";

import {
    useCreateExperienceEntry,
    useDeleteExperienceEntry,
    useUpdateExperienceEntry,
} from "@/hooks/experience/useExperience";
import { isUnauthorized } from "@/services/api";
import {
    getExperience,
    type ExperienceEntry,
    type ExperienceInput,
} from "@/services/experience/experience";
import { useAdminToast } from "./toastContext";
import { Field, FormError, adminFieldInputClassName } from "./AdminFields";
import { ConfirmDeleteButton, IconButton, PrimaryButton } from "./AdminButtons";
import { AccordionItem, AddRowButton, AdminSectionHead } from "./AdminList";
import { reorderSwap } from "./reorder";

type ExperienceManagerProps = {
    token: string;
    onUnauthorized: () => void;
    onDirtyChange: (dirty: boolean) => void;
};

type ExperienceFormFields = {
    period: string;
    role: string;
    company: string;
    description: string;
    sort_order: string;
};

const emptyFields: ExperienceFormFields = {
    period: "",
    role: "",
    company: "",
    description: "",
    sort_order: "",
};

function toFields(entry: ExperienceEntry): ExperienceFormFields {
    return {
        period: entry.period,
        role: entry.role,
        company: entry.company,
        description: entry.description.join("\n"),
        sort_order: String(entry.sort_order),
    };
}

function toInput(fields: ExperienceFormFields): ExperienceInput {
    return {
        period: fields.period.trim(),
        role: fields.role.trim(),
        company: fields.company.trim(),
        description: fields.description
            .split("\n")
            .map((item) => item.trim())
            .filter((item) => item.length > 0),
        sort_order: fields.sort_order.trim() === "" ? 0 : Number(fields.sort_order),
    };
}

function toInputForItem(entry: ExperienceEntry, sortOrder: number): ExperienceInput {
    return toInput({ ...toFields(entry), sort_order: String(sortOrder) });
}

function subtitleFor(fields: Pick<ExperienceFormFields, "company" | "period">): string {
    return (
        [fields.company, fields.period].filter((part) => part !== "").join(" · ") ||
        "Not saved yet"
    );
}

function ExperienceForm({
    fields,
    formError,
    onField,
}: {
    fields: ExperienceFormFields;
    formError: string | null;
    onField: (name: keyof ExperienceFormFields, value: string) => void;
}) {
    return (
        <>
            <Field label="Role" wide>
                <input
                    value={fields.role}
                    onChange={(event) => onField("role", event.target.value)}
                    className={adminFieldInputClassName}
                />
            </Field>

            <Field label="Company">
                <input
                    value={fields.company}
                    onChange={(event) => onField("company", event.target.value)}
                    className={adminFieldInputClassName}
                />
            </Field>

            <Field label="Period">
                <input
                    value={fields.period}
                    onChange={(event) => onField("period", event.target.value)}
                    placeholder="2026 — present"
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

            <Field label="What you did" hint="One bullet per line" wide>
                <textarea
                    value={fields.description}
                    onChange={(event) => onField("description", event.target.value)}
                    rows={4}
                    className={adminFieldInputClassName}
                />
            </Field>

            {formError !== null && (
                <div className="sm:col-span-2">
                    <FormError message={formError} />
                </div>
            )}
        </>
    );
}

export function ExperienceManager({ token, onUnauthorized, onDirtyChange }: ExperienceManagerProps) {
    const experienceQuery = useQuery({
        queryKey: ["experience"],
        queryFn: getExperience,
        retry: 1,
        refetchOnWindowFocus: false,
    });

    const createMutation = useCreateExperienceEntry(token);
    const updateMutation = useUpdateExperienceEntry(token);
    const deleteMutation = useDeleteExperienceEntry(token);
    const notify = useAdminToast();

    const [editor, setEditor] = useState<{
        id: number | "new";
        fields: ExperienceFormFields;
        initial: ExperienceFormFields;
    } | null>(null);
    const [touched, setTouched] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [moving, setMoving] = useState(false);

    const entries = experienceQuery.data ?? [];

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

    function openEditor(id: number | "new", fields: ExperienceFormFields) {
        if (editor !== null && editor.id !== id && touched) {
            if (!window.confirm("Discard unsaved changes?")) {
                return;
            }
        }

        setEditor({ id, fields, initial: fields });
        setFormError(null);
        setDirty(false);
    }

    function toggleEditor(id: number | "new", fields: ExperienceFormFields) {
        if (editor !== null && editor.id === id) {
            if (touched && !window.confirm("Discard unsaved changes?")) {
                return;
            }

            setEditor(null);
            setFormError(null);
            setDirty(false);
            return;
        }

        openEditor(id, fields);
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
        const input = toInput(editor.fields);

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
        const swap = reorderSwap(entries, id, direction);

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

    function setField(name: keyof ExperienceFormFields, value: string) {
        if (editor === null) {
            return;
        }

        setEditor((current) =>
            current === null ? current : { ...current, fields: { ...current.fields, [name]: value } },
        );
        setDirty(true);
    }

    const isSaving = createMutation.isPending || updateMutation.isPending;
    const openId = editor?.id ?? null;

    function editorFooter(id: number | "new") {
        return (
            <div className="mt-5 flex items-center gap-2.5 border-t border-(--line) pt-4">
                <PrimaryButton type="submit" form="experience-editor" disabled={isSaving}>
                    {isSaving ? "Saving…" : "Save & publish"}
                </PrimaryButton>

                <span className="flex-1" />

                {id !== "new" && (
                    <>
                        <IconButton
                            label="Move role up"
                            onClick={() => move(id, -1)}
                            disabled={moving || reorderSwap(entries, id, -1) === null}
                        >
                            <ArrowUp size={16} strokeWidth={2} aria-hidden="true" />
                        </IconButton>

                        <IconButton
                            label="Move role down"
                            onClick={() => move(id, 1)}
                            disabled={moving || reorderSwap(entries, id, 1) === null}
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
                title="Experience"
                description="Your timeline, newest first."
            />

            <div className="mt-6">
                {experienceQuery.isPending ? (
                    <p className="font-mono text-[10.5px] text-(--graphite)">
                        Loading experience...
                    </p>
                ) : experienceQuery.isError ? (
                    <div className="flex items-center gap-3">
                        <p className="font-mono text-[10.5px] text-(--graphite)">
                            Unable to load experience.
                        </p>
                        <button
                            type="button"
                            onClick={() => experienceQuery.refetch()}
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
                                    title={editor.fields.role || "New role"}
                                    subtitle={subtitleFor(editor.fields)}
                                    onToggle={() => toggleEditor("new", emptyFields)}
                                >
                                    <form
                                        id="experience-editor"
                                        onSubmit={handleSubmit}
                                        className="grid gap-x-4 gap-y-3.5 sm:grid-cols-2"
                                    >
                                        <ExperienceForm
                                            fields={editor.fields}
                                            formError={formError}
                                            onField={setField}
                                        />
                                    </form>

                                    {editorFooter("new")}
                                </AccordionItem>
                            )}

                            {entries.length === 0 && openId !== "new" && (
                                <p className="px-5 py-4 font-mono text-[10.5px] text-(--graphite)">
                                    No experience yet.
                                </p>
                            )}

                            {entries.map((entry) => {
                                const open = openId === entry.id;

                                return (
                                    <AccordionItem
                                        key={entry.id}
                                        open={open}
                                        title={open ? editor?.fields.role || entry.role : entry.role}
                                        subtitle={
                                            open && editor
                                                ? subtitleFor(editor.fields)
                                                : subtitleFor(entry)
                                        }
                                        onToggle={() => toggleEditor(entry.id, toFields(entry))}
                                    >
                                        {open && editor !== null && (
                                            <>
                                                <form
                                                    id="experience-editor"
                                                    onSubmit={handleSubmit}
                                                    className="grid gap-x-4 gap-y-3.5 sm:grid-cols-2"
                                                >
                                                    <ExperienceForm
                                                        fields={editor.fields}
                                                        formError={formError}
                                                        onField={setField}
                                                    />
                                                </form>

                                                {editorFooter(entry.id)}
                                            </>
                                        )}
                                    </AccordionItem>
                                );
                            })}
                        </div>

                        <AddRowButton onClick={() => openEditor("new", emptyFields)}>
                            Add role
                        </AddRowButton>
                    </div>
                )}
            </div>
        </div>
    );
}
