import { useState } from "react";
import type { FormEvent } from "react";
import { useQuery } from "@tanstack/react-query";

import {
    useCreateStackGroup,
    useDeleteStackGroup,
    useUpdateStackGroup,
} from "@/hooks/stack/useStack";
import { ApiError } from "@/services/api";
import {
    getStack,
    type StackGroup,
    type StackGroupInput,
} from "@/services/stack/stack";

type StackManagerProps = {
    token: string;
    onUnauthorized: () => void;
};

type StackFormFields = {
    group: string;
    items: string;
    sort_order: string;
};

const emptyFields: StackFormFields = {
    group: "",
    items: "",
    sort_order: "",
};

function toFields(group: StackGroup): StackFormFields {
    return {
        group: group.group,
        items: group.items.join("\n"),
        sort_order: String(group.sort_order),
    };
}

function toInput(fields: StackFormFields): StackGroupInput {
    return {
        group: fields.group.trim(),
        items: fields.items
            .split("\n")
            .map((item) => item.trim())
            .filter((item) => item.length > 0),
        sort_order: fields.sort_order.trim() === "" ? 0 : Number(fields.sort_order),
    };
}

function isUnauthorized(error: unknown): boolean {
    return error instanceof ApiError && error.status === 401;
}

export function StackManager({ token, onUnauthorized }: StackManagerProps) {
    const stackQuery = useQuery({
        queryKey: ["stack"],
        queryFn: getStack,
        retry: 1,
        refetchOnWindowFocus: false,
    });

    const createMutation = useCreateStackGroup(token);
    const updateMutation = useUpdateStackGroup(token);
    const deleteMutation = useDeleteStackGroup(token);

    const [editingId, setEditingId] = useState<number | "new" | null>(null);
    const [fields, setFields] = useState<StackFormFields>(emptyFields);
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

    function startEdit(group: StackGroup) {
        setEditingId(group.id);
        setFields(toFields(group));
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

    function handleDelete(group: StackGroup) {
        if (!window.confirm(`Delete "${group.group}"?`)) {
            return;
        }

        deleteMutation.mutate(group.id, {
            onError: (error: unknown) => {
                if (isUnauthorized(error)) {
                    onUnauthorized();
                }
            },
        });
    }

    function setField(name: keyof StackFormFields, value: string) {
        setFields((current) => ({ ...current, [name]: value }));
    }

    const isSaving = createMutation.isPending || updateMutation.isPending;

    return (
        <section aria-label="Stack">
            <div className="mt-8 flex items-baseline justify-between">
                <h2 className="font-display text-[20px] font-medium text-(--ink)">
                    Stack
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
                    Add group
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
                                Group
                            </span>
                            <input
                                value={fields.group}
                                onChange={(event) => setField("group", event.target.value)}
                                placeholder="Languages"
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
                            Items (one per line)
                        </span>
                        <textarea
                            value={fields.items}
                            onChange={(event) => setField("items", event.target.value)}
                            rows={5}
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
                {stackQuery.isPending ? (
                    <p className="font-mono text-[10.5px] text-(--graphite)">
                        Loading stack...
                    </p>
                ) : stackQuery.isError ? (
                    <div className="flex items-center gap-3">
                        <p className="font-mono text-[10.5px] text-(--graphite)">
                            Unable to load stack.
                        </p>
                        <button
                            type="button"
                            onClick={() => stackQuery.refetch()}
                            className="font-mono text-[11px] text-(--accent-strong) hover:underline"
                        >
                            Retry
                        </button>
                    </div>
                ) : stackQuery.data.length === 0 ? (
                    <p className="font-mono text-[10.5px] text-(--graphite)">
                        No stack groups yet.
                    </p>
                ) : (
                    <ul className="divide-y divide-(--line) rounded-2xl border border-(--glass-border) bg-(--glass-bg) backdrop-blur-xl backdrop-saturate-160">
                        {stackQuery.data.map((group) => (
                            <li
                                key={group.id}
                                className="flex items-center justify-between gap-4 p-4"
                            >
                                <div className="min-w-0">
                                    <p className="truncate font-display text-[16px] text-(--ink)">
                                        {group.group}
                                    </p>
                                    <p className="mt-0.5 truncate font-mono text-[10.5px] text-(--graphite-soft)">
                                        {group.items.join(", ")}
                                    </p>
                                </div>

                                <div className="flex shrink-0 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => startEdit(group)}
                                        className="font-mono text-[11px] text-(--graphite) transition-colors duration-150 hover:text-(--accent-strong)"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleDelete(group)}
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
