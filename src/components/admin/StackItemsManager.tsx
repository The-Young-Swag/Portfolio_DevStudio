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
import { useAdminToast } from "./toastContext";
import { AdminDrawer } from "./AdminDrawer";
import { Field, FormError, adminFieldInputClassName } from "./AdminFields";
import { PrimaryButton, SecondaryButton } from "./AdminButtons";
import { AddButton, AdminRow, AdminSearchInput, AdminSectionHead } from "./AdminList";
import { SaveBar } from "./SaveBar";

type StackItemsManagerProps = {
    token: string;
    onUnauthorized: () => void;
    onDirtyChange: (dirty: boolean) => void;
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

export function StackItemsManager({ token, onUnauthorized, onDirtyChange }: StackItemsManagerProps) {
    const stackQuery = useQuery({
        queryKey: ["stack-items"],
        queryFn: getStackItems,
        retry: 1,
        refetchOnWindowFocus: false,
    });

    const createMutation = useCreateStackItem(token);
    const updateMutation = useUpdateStackItem(token);
    const deleteMutation = useDeleteStackItem(token);
    const notify = useAdminToast();

    const [drawer, setDrawer] = useState<{
        id: number | "new";
        fields: StackItemFormFields;
        initial: StackItemFormFields;
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

    function openDrawer(id: number | "new", fields: StackItemFormFields) {
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

    function handleDelete(item: StackItem) {
        if (!window.confirm(`Delete "${item.name}"? This goes live immediately.`)) {
            return;
        }

        deleteMutation.mutate(item.id, {
            onSuccess: () => notify("Deleted"),
            onError: (error: unknown) => {
                if (isUnauthorized(error)) {
                    onUnauthorized();
                }
            },
        });
    }

    function setField(name: keyof StackItemFormFields, value: string | boolean) {
        if (drawer === null) {
            return;
        }

        setDrawer((current) =>
            current === null ? current : { ...current, fields: { ...current.fields, [name]: value } },
        );
        setDirty(true);
    }

    const isSaving = createMutation.isPending || updateMutation.isPending;
    const items = stackQuery.data ?? [];
    const query = search.trim().toLowerCase();
    const visible =
        query === ""
            ? items
            : items.filter((item) =>
                  `${item.name} ${item.category} ${item.level}`.toLowerCase().includes(query),
              );

    return (
        <div>
            <AdminSectionHead
                title="Stack"
                description="Skills grouped by category. “Core” items are highlighted on the site."
                action={<AddButton onClick={() => openDrawer("new", emptyFields)}>Add skill</AddButton>}
            />

            <div className="mt-5">
                <AdminSearchInput
                    value={search}
                    onChange={setSearch}
                    placeholder="Search skills…"
                />
            </div>

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
                ) : visible.length === 0 ? (
                    <p className="font-mono text-[10.5px] text-(--graphite)">
                        {items.length === 0 ? "No skills yet." : "No skills match the search."}
                    </p>
                ) : (
                    <ul className="divide-y divide-(--line) rounded-2xl border border-(--glass-border) bg-(--glass-bg) backdrop-blur-xl backdrop-saturate-160">
                        {visible.map((item) => (
                            <AdminRow
                                key={item.id}
                                title={item.name}
                                subtitle={`${item.category} · ${item.level}`}
                                tag={item.is_core ? "core" : ""}
                                onEdit={() => openDrawer(item.id, toFields(item))}
                                onDelete={() => handleDelete(item)}
                                deleting={deleteMutation.isPending}
                            />
                        ))}
                    </ul>
                )}
            </div>

            <AdminDrawer
                open={drawer !== null}
                title={drawer !== null && drawer.id === "new" ? "Add skill" : "Edit skill"}
                onClose={closeDrawer}
                footer={
                    <>
                        <PrimaryButton
                            type="submit"
                            form="stack-item-editor"
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
                        id="stack-item-editor"
                        onSubmit={handleSubmit}
                        className="grid gap-3 sm:grid-cols-2"
                    >
                        <Field label="Name" wide>
                            <input
                                value={drawer.fields.name}
                                onChange={(event) => setField("name", event.target.value)}
                                className={adminFieldInputClassName}
                            />
                        </Field>

                        <Field label="Category">
                            <select
                                value={drawer.fields.category}
                                onChange={(event) => setField("category", event.target.value)}
                                className={adminFieldInputClassName}
                            >
                                {categories.map((category) => (
                                    <option key={category} value={category}>
                                        {category}
                                    </option>
                                ))}
                            </select>
                        </Field>

                        <Field label="Proficiency">
                            <select
                                value={drawer.fields.level}
                                onChange={(event) => setField("level", event.target.value)}
                                className={adminFieldInputClassName}
                            >
                                {levels.map((level) => (
                                    <option key={level} value={level}>
                                        {level}
                                    </option>
                                ))}
                            </select>
                        </Field>

                        <Field label="Since year">
                            <input
                                value={drawer.fields.since_year}
                                onChange={(event) => setField("since_year", event.target.value)}
                                inputMode="numeric"
                                placeholder="2024"
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

                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={drawer.fields.is_core}
                                onChange={(event) => setField("is_core", event.target.checked)}
                                className="h-4 w-4 accent-(--accent-strong)"
                            />
                            <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-(--graphite-soft)">
                                Core stack
                            </span>
                        </label>

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
