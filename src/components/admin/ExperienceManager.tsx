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

type ExperienceManagerProps = {
    token: string;
    onUnauthorized: () => void;
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

export function ExperienceManager({ token, onUnauthorized }: ExperienceManagerProps) {
    const experienceQuery = useQuery({
        queryKey: ["experience"],
        queryFn: getExperience,
        retry: 1,
        refetchOnWindowFocus: false,
    });

    const createMutation = useCreateExperienceEntry(token);
    const updateMutation = useUpdateExperienceEntry(token);
    const deleteMutation = useDeleteExperienceEntry(token);

    const [editingId, setEditingId] = useState<number | "new" | null>(null);
    const [fields, setFields] = useState<ExperienceFormFields>(emptyFields);
    const [formError, setFormError] = useState<string | null>(null);
    const [savedAt, setSavedAt] = useState<string | null>(null);

    function markSaved() {
        setSavedAt(new Date().toLocaleTimeString());
    }

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

    function startEdit(entry: ExperienceEntry) {
        setEditingId(entry.id);
        setFields(toFields(entry));
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
                onSuccess: () => {
                    markSaved();
                    cancelForm();
                },
                onError: handleMutationError,
            });
        } else if (typeof editingId === "number") {
            updateMutation.mutate(
                { id: editingId, input },
                {
                    onSuccess: () => {
                    markSaved();
                    cancelForm();
                },
                    onError: handleMutationError,
                },
            );
        }
    }

    function handleDelete(entry: ExperienceEntry) {
        if (!window.confirm(`Delete "${entry.role}"?`)) {
            return;
        }

        deleteMutation.mutate(entry.id, {
            onSuccess: () => markSaved(),
                onError: (error: unknown) => {
                if (isUnauthorized(error)) {
                    onUnauthorized();
                }
            },
        });
    }

    function setField(name: keyof ExperienceFormFields, value: string) {
        setFields((current) => ({ ...current, [name]: value }));
    }

    const isSaving = createMutation.isPending || updateMutation.isPending;

    return (
        <section aria-label="Experience">
            <div className="mt-8 flex items-baseline justify-between">
                <h2 className="font-display text-[20px] font-medium text-(--ink)">
                    Experience
                </h2>

                <div className="flex items-center gap-3">
                    {savedAt !== null && (
                        <span aria-live="polite" className="font-mono text-[11px] text-(--accent-strong)">
                            Saved {savedAt}
                        </span>
                    )}

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
                    Add entry
                </button>
                </div>
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
                                Role
                            </span>
                            <input
                                value={fields.role}
                                onChange={(event) => setField("role", event.target.value)}
                                className="mt-1 w-full rounded-lg border border-(--glass-border) bg-white/40 px-3 py-2 text-[13px] text-(--ink) outline-none focus:border-(--accent-strong) dark:bg-black/20"
                            />
                        </label>

                        <label className="block">
                            <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-(--graphite-soft)">
                                Period
                            </span>
                            <input
                                value={fields.period}
                                onChange={(event) => setField("period", event.target.value)}
                                placeholder="2026 — present"
                                className="mt-1 w-full rounded-lg border border-(--glass-border) bg-white/40 px-3 py-2 text-[13px] text-(--ink) outline-none focus:border-(--accent-strong) dark:bg-black/20"
                            />
                        </label>

                        <label className="block">
                            <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-(--graphite-soft)">
                                Company
                            </span>
                            <input
                                value={fields.company}
                                onChange={(event) => setField("company", event.target.value)}
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
                            Description (one per line)
                        </span>
                        <textarea
                            value={fields.description}
                            onChange={(event) => setField("description", event.target.value)}
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
                ) : experienceQuery.data.length === 0 ? (
                    <p className="font-mono text-[10.5px] text-(--graphite)">
                        No experience yet.
                    </p>
                ) : (
                    <ul className="divide-y divide-(--line) rounded-2xl border border-(--glass-border) bg-(--glass-bg) backdrop-blur-xl backdrop-saturate-160">
                        {experienceQuery.data.map((entry) => (
                            <li
                                key={entry.id}
                                className="flex items-center justify-between gap-4 p-4"
                            >
                                <div className="min-w-0">
                                    <p className="truncate font-display text-[16px] text-(--ink)">
                                        {entry.role}
                                    </p>
                                    <p className="mt-0.5 font-mono text-[10.5px] text-(--graphite-soft)">
                                        {entry.company} · {entry.period}
                                    </p>
                                </div>

                                <div className="flex shrink-0 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => startEdit(entry)}
                                        className="font-mono text-[11px] text-(--graphite) transition-colors duration-150 hover:text-(--accent-strong)"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleDelete(entry)}
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
