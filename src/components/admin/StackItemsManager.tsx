import { useState } from "react";
import type { FormEvent } from "react";
import { useQuery } from "@tanstack/react-query";

import {
    useCreateStackItem,
    useDeleteStackItem,
    useUpdateStackItem,
} from "@/hooks/stack/useStackItems";
import { isUnauthorized } from "@/services/api";
import {
    getStackItems,
    type StackItem,
    type StackItemCategory,
    type StackItemInput,
    type StackItemLevel,
} from "@/services/stack/stackItems";

type StackItemsManagerProps = {
    token: string;
    onUnauthorized: () => void;
};

type StackItemFormFields = {
    name: string;
    category: string;
    level: string;
    since_year: string;
    is_core: boolean;
    sort_order: string;
};

const emptyFields: StackItemFormFields = {
    name: "",
    category: "tool",
    level: "comfortable",
    since_year: "",
    is_core: false,
    sort_order: "",
};

const categories: StackItemCategory[] = [
    "language",
    "framework",
    "library",
    "database",
    "tool",
];

const levels: StackItemLevel[] = ["learning", "comfortable", "confident"];

function isCategory(value: string): value is StackItemCategory {
    return (categories as readonly string[]).includes(value);
}

function isLevel(value: string): value is StackItemLevel {
    return (levels as readonly string[]).includes(value);
}

function toFields(item: StackItem): StackItemFormFields {
    return {
        name: item.name,
        category: item.category,
        level: item.level,
        since_year: item.since_year === null ? "" : String(item.since_year),
        is_core: item.is_core,
        sort_order: String(item.sort_order),
    };
}

function toInput(fields: StackItemFormFields): StackItemInput {
    return {
        name: fields.name.trim(),
        category: isCategory(fields.category) ? fields.category : "tool",
        level: isLevel(fields.level) ? fields.level : "comfortable",
        since_year: fields.since_year.trim() === "" ? null : Number(fields.since_year),
        is_core: fields.is_core,
        sort_order: fields.sort_order.trim() === "" ? 0 : Number(fields.sort_order),
    };
}

export function StackItemsManager({ token, onUnauthorized }: StackItemsManagerProps) {
    const stackQuery = useQuery({
        queryKey: ["stack-items"],
        queryFn: getStackItems,
        retry: 1,
        refetchOnWindowFocus: false,
    });

    const createMutation = useCreateStackItem(token);
    const updateMutation = useUpdateStackItem(token);
    const deleteMutation = useDeleteStackItem(token);

    const [editingId, setEditingId] = useState<number | "new" | null>(null);
    const [fields, setFields] = useState<StackItemFormFields>(emptyFields);
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

    function startEdit(item: StackItem) {
        setEditingId(item.id);
        setFields(toFields(item));
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

    function handleDelete(item: StackItem) {
        if (!window.confirm(`Delete "${item.name}"?`)) {
            return;
        }

        deleteMutation.mutate(item.id, {
            onError: (error: unknown) => {
                if (isUnauthorized(error)) {
                    onUnauthorized();
                }
            },
        });
    }

    function setField(name: keyof StackItemFormFields, value: string | boolean) {
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
                    Add item
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
                                Name
                            </span>
                            <input
                                value={fields.name}
                                onChange={(event) => setField("name", event.target.value)}
                                className="mt-1 w-full rounded-lg border border-(--glass-border) bg-white/40 px-3 py-2 text-[13px] text-(--ink) outline-none focus:border-(--accent-strong) dark:bg-black/20"
                            />
                        </label>

                        <label className="block">
                            <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-(--graphite-soft)">
                                Category
                            </span>
                            <select
                                value={fields.category}
                                onChange={(event) => setField("category", event.target.value)}
                                className="mt-1 w-full rounded-lg border border-(--glass-border) bg-white/40 px-3 py-2 text-[13px] text-(--ink) outline-none focus:border-(--accent-strong) dark:bg-black/20"
                            >
                                {categories.map((category) => (
                                    <option key={category} value={category}>
                                        {category}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label className="block">
                            <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-(--graphite-soft)">
                                Level
                            </span>
                            <select
                                value={fields.level}
                                onChange={(event) => setField("level", event.target.value)}
                                className="mt-1 w-full rounded-lg border border-(--glass-border) bg-white/40 px-3 py-2 text-[13px] text-(--ink) outline-none focus:border-(--accent-strong) dark:bg-black/20"
                            >
                                {levels.map((level) => (
                                    <option key={level} value={level}>
                                        {level}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label className="block">
                            <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-(--graphite-soft)">
                                Since year
                            </span>
                            <input
                                value={fields.since_year}
                                onChange={(event) => setField("since_year", event.target.value)}
                                inputMode="numeric"
                                placeholder="—"
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

                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={fields.is_core}
                                onChange={(event) => setField("is_core", event.target.checked)}
                                className="h-4 w-4 accent-(--accent-strong)"
                            />
                            <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-(--graphite-soft)">
                                Core stack
                            </span>
                        </label>
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
                        No stack items yet.
                    </p>
                ) : (
                    <ul className="divide-y divide-(--line) rounded-2xl border border-(--glass-border) bg-(--glass-bg) backdrop-blur-xl backdrop-saturate-160">
                        {stackQuery.data.map((item) => (
                            <li
                                key={item.id}
                                className="flex items-center justify-between gap-4 p-4"
                            >
                                <div className="min-w-0">
                                    <p className="truncate font-display text-[16px] text-(--ink)">
                                        {item.name}
                                        {item.is_core && (
                                            <span className="ml-2 font-mono text-[10px] text-(--accent-strong)">
                                                core
                                            </span>
                                        )}
                                    </p>
                                    <p className="mt-0.5 font-mono text-[10.5px] text-(--graphite-soft)">
                                        {item.category} · {item.level}
                                        {item.since_year !== null && ` · since ${item.since_year}`}
                                    </p>
                                </div>

                                <div className="flex shrink-0 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => startEdit(item)}
                                        className="font-mono text-[11px] text-(--graphite) transition-colors duration-150 hover:text-(--accent-strong)"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleDelete(item)}
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
