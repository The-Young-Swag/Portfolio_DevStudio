import { useState } from "react";
import type { FormEvent } from "react";
import { useQuery } from "@tanstack/react-query";

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
import { AdminDrawer } from "./AdminDrawer";
import { Field, FormError, adminFieldInputClassName } from "./AdminFields";
import { PrimaryButton, SecondaryButton } from "./AdminButtons";
import { AddButton, AdminRow, AdminSearchInput, AdminSectionHead } from "./AdminList";
import { SaveBar } from "./SaveBar";

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

    const [drawer, setDrawer] = useState<{
        id: number | "new";
        fields: ExperienceFormFields;
        initial: ExperienceFormFields;
    } | null>(null);
    const [touched, setTouched] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [search, setSearch] = useState("");

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

    function openDrawer(id: number | "new", fields: ExperienceFormFields) {
        setDrawer({ id, fields, initial: fields });
        setFormError(null);
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

        setDrawer({ ...drawer, fields: drawer.initial });
        setFormError(null);
        setDirty(false);
    }

    function commit() {
        if (drawer === null) {
            return;
        }

        setFormError(null);
        const input = toInput(drawer.fields);

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

    function handleDelete(entry: ExperienceEntry) {
        if (!window.confirm(`Delete "${entry.role}"? This goes live immediately.`)) {
            return;
        }

        deleteMutation.mutate(entry.id, {
            onSuccess: () => notify("Deleted"),
            onError: (error: unknown) => {
                if (isUnauthorized(error)) {
                    onUnauthorized();
                }
            },
        });
    }

    function setField(name: keyof ExperienceFormFields, value: string) {
        if (drawer === null) {
            return;
        }

        setDrawer((current) =>
            current === null ? current : { ...current, fields: { ...current.fields, [name]: value } },
        );
        setDirty(true);
    }

    const isSaving = createMutation.isPending || updateMutation.isPending;
    const entries = experienceQuery.data ?? [];
    const query = search.trim().toLowerCase();
    const visible =
        query === ""
            ? entries
            : entries.filter((entry) =>
                  `${entry.role} ${entry.company} ${entry.period}`.toLowerCase().includes(query),
              );

    return (
        <div>
            <AdminSectionHead
                title="Experience"
                description="Roles shown on the timeline, newest first."
                action={<AddButton onClick={() => openDrawer("new", emptyFields)}>Add role</AddButton>}
            />

            <div className="mt-5">
                <AdminSearchInput
                    value={search}
                    onChange={setSearch}
                    placeholder="Search roles…"
                />
            </div>

            <div className="mt-4">
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
                ) : visible.length === 0 ? (
                    <p className="font-mono text-[10.5px] text-(--graphite)">
                        {entries.length === 0 ? "No experience yet." : "No roles match the search."}
                    </p>
                ) : (
                    <ul className="divide-y divide-(--line) rounded-2xl border border-(--glass-border) bg-(--glass-bg) backdrop-blur-xl backdrop-saturate-160">
                        {visible.map((entry) => (
                            <AdminRow
                                key={entry.id}
                                title={entry.role}
                                subtitle={`${entry.company} · ${entry.period}`}
                                onEdit={() => openDrawer(entry.id, toFields(entry))}
                                onDelete={() => handleDelete(entry)}
                                deleting={deleteMutation.isPending}
                            />
                        ))}
                    </ul>
                )}
            </div>

            <AdminDrawer
                open={drawer !== null}
                title={drawer !== null && drawer.id === "new" ? "Add role" : "Edit role"}
                onClose={closeDrawer}
                footer={
                    <>
                        <PrimaryButton
                            type="submit"
                            form="experience-editor"
                            disabled={isSaving}
                        >
                            {isSaving ? "Saving…" : "Save & publish"}
                        </PrimaryButton>

                        <SecondaryButton onClick={closeDrawer}>Cancel</SecondaryButton>
                    </>
                }
            >
                {drawer !== null && (
                    <form
                        id="experience-editor"
                        onSubmit={handleSubmit}
                        className="grid gap-3 sm:grid-cols-2"
                    >
                        <Field label="Role">
                            <input
                                value={drawer.fields.role}
                                onChange={(event) => setField("role", event.target.value)}
                                className={adminFieldInputClassName}
                            />
                        </Field>

                        <Field label="Period">
                            <input
                                value={drawer.fields.period}
                                onChange={(event) => setField("period", event.target.value)}
                                placeholder="2026 — present"
                                className={adminFieldInputClassName}
                            />
                        </Field>

                        <Field label="Company">
                            <input
                                value={drawer.fields.company}
                                onChange={(event) => setField("company", event.target.value)}
                                className={adminFieldInputClassName}
                            />
                        </Field>

                        <Field label="Sort order">
                            <input
                                value={drawer.fields.sort_order}
                                onChange={(event) => setField("sort_order", event.target.value)}
                                inputMode="numeric"
                                placeholder="0"
                                className={adminFieldInputClassName}
                            />
                        </Field>

                        <Field label="Description" hint="One bullet per line" wide>
                            <textarea
                                value={drawer.fields.description}
                                onChange={(event) => setField("description", event.target.value)}
                                rows={4}
                                className={adminFieldInputClassName}
                            />
                        </Field>

                        {formError !== null && (
                            <div className="sm:col-span-2">
                                <FormError message={formError} />
                            </div>
                        )}
                    </form>
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
