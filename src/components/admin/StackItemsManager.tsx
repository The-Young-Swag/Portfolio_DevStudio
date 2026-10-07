import { useState } from "react";
import type { FormEvent } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, Plus, Trash2 } from "lucide-react";

import {
    useCreateStackItem,
    useDeleteStackItem,
    useUpdateStackItem,
} from "@/hooks/stack/useStackItems";
import { CoreLegend, SkillPill } from "@/components/ui";
import { isUnauthorized } from "@/services/api";
import {
    getStackItems,
    updateStackItem,
    type StackItem,
    type StackItemCategory,
    type StackItemInput,
    type StackItemLevel,
} from "@/services/stack/stackItems";
import { useAdminToast } from "./toastContext";
import { AdminDrawer } from "./AdminDrawer";
import { Field, FormError, adminFieldInputClassName, adminFieldLabelClassName } from "./AdminFields";
import { IconButton, PrimaryButton, SecondaryButton } from "./AdminButtons";
import { AdminSectionHead } from "./AdminList";
import { reorderSwap } from "./reorder";
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
};

const categories: { value: StackItemCategory; title: string }[] = [
    { value: "language", title: "Languages" },
    { value: "framework", title: "Frameworks" },
    { value: "library", title: "Libraries" },
    { value: "database", title: "Databases" },
    { value: "tool", title: "Tools" },
];

function isCategory(value: string): value is StackItemCategory {
    return categories.some((category) => category.value === value);
}

function isLevel(value: string): value is StackItemLevel {
    return value === "learning" || value === "comfortable" || value === "confident";
}

function toFields(item: StackItem): StackItemFormFields {
    return {
        name: item.name,
        category: item.category,
        level: item.level,
        since_year: item.since_year === null ? "" : String(item.since_year),
        is_core: item.is_core,
    };
}

function toInput(fields: StackItemFormFields, sortOrder: number): StackItemInput {
    return {
        name: fields.name.trim(),
        category: isCategory(fields.category) ? fields.category : "tool",
        level: isLevel(fields.level) ? fields.level : "comfortable",
        since_year: fields.since_year.trim() === "" ? null : Number(fields.since_year),
        is_core: fields.is_core,
        sort_order: sortOrder,
    };
}

function toInputForItem(item: StackItem): StackItemInput {
    return {
        name: item.name,
        category: item.category,
        level: item.level,
        since_year: item.since_year,
        is_core: item.is_core,
        sort_order: item.sort_order,
    };
}

function bySortOrder(a: StackItem, b: StackItem): number {
    return a.sort_order - b.sort_order || a.id - b.id;
}

export function StackItemsManager({ token, onUnauthorized, onDirtyChange }: StackItemsManagerProps) {
    const stackQuery = useQuery({
        queryKey: ["stack-items"],
        queryFn: getStackItems,
        retry: 1,
        refetchOnWindowFocus: false,
    });

    const queryClient = useQueryClient();
    const createMutation = useCreateStackItem(token);
    const updateMutation = useUpdateStackItem(token);
    const deleteMutation = useDeleteStackItem(token);
    const notify = useAdminToast();

    const [quickName, setQuickName] = useState("");
    const [quickCategory, setQuickCategory] = useState<StackItemCategory>("language");
    const [quickError, setQuickError] = useState<string | null>(null);

    const [drawer, setDrawer] = useState<{
        id: number;
        item: StackItem | null;
        fields: StackItemFormFields;
        initial: StackItemFormFields;
    } | null>(null);
    const [touched, setTouched] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [moving, setMoving] = useState(false);

    const items = stackQuery.data ?? [];

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

    function openDrawer(item: StackItem) {
        const fields = toFields(item);
        setDrawer({ id: item.id, item, fields, initial: fields });
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
        if (drawer === null || drawer.item === null) {
            return;
        }

        setFormError(null);
        const input = toInput(drawer.fields, drawer.item.sort_order);

        updateMutation.mutate(
            { id: drawer.item.id, input },
            {
                onSuccess: (updated) => {
                    setDrawer({ ...drawer, item: updated, initial: drawer.fields });
                    setDirty(false);
                    notify("Saved and live on your site");
                },
                onError: handleMutationError,
            },
        );
    }

    function handleSubmit(event: FormEvent) {
        event.preventDefault();
        commit();
    }

    function handleQuickAdd(event: FormEvent) {
        event.preventDefault();

        if (quickName.trim() === "") {
            setQuickError("Give the skill a name first.");
            return;
        }

        setQuickError(null);
        const nextSortOrder =
            items.length === 0 ? 0 : Math.max(...items.map((item) => item.sort_order)) + 1;

        createMutation.mutate(
            {
                name: quickName.trim(),
                category: quickCategory,
                level: "comfortable",
                since_year: null,
                is_core: false,
                sort_order: nextSortOrder,
            },
            {
                onSuccess: () => {
                    setQuickName("");
                    notify("Saved and live on your site");
                },
                onError: (error: unknown) => {
                    if (isUnauthorized(error)) {
                        onUnauthorized();
                        return;
                    }

                    setQuickError(
                        error instanceof Error ? error.message : "Something went wrong.",
                    );
                },
            },
        );
    }

    function handleDelete(item: StackItem) {
        if (!window.confirm(`Delete "${item.name}"? This goes live immediately.`)) {
            return;
        }

        deleteMutation.mutate(item.id, {
            onSuccess: () => {
                if (drawer?.id === item.id) {
                    setDrawer(null);
                    setFormError(null);
                    setDirty(false);
                }

                notify("Deleted");
            },
            onError: (error: unknown) => {
                if (isUnauthorized(error)) {
                    onUnauthorized();
                }
            },
        });
    }

    async function move(item: StackItem, direction: -1 | 1) {
        const group = items.filter((candidate) => candidate.category === item.category);
        const swap = reorderSwap(group, item.id, direction);

        if (swap === null || moving) {
            return;
        }

        setMoving(true);

        try {
            const first: StackItemInput = {
                ...toInputForItem(swap.item),
                sort_order: swap.itemOrder,
            };
            const second: StackItemInput = {
                ...toInputForItem(swap.neighbor),
                sort_order: swap.neighborOrder,
            };

            await updateStackItem(swap.item.id, first, token);
            await updateStackItem(swap.neighbor.id, second, token);
            await queryClient.invalidateQueries({ queryKey: ["stack-items"] });

            if (drawer?.id === item.id && drawer.item !== null) {
                const fields = { ...drawer.fields };
                setDrawer({
                    ...drawer,
                    item: { ...drawer.item, sort_order: swap.itemOrder },
                    fields,
                });
            }

            notify("Saved and live on your site");
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

    function setField(name: keyof StackItemFormFields, value: string | boolean) {
        if (drawer === null) {
            return;
        }

        setDrawer((current) =>
            current === null ? current : { ...current, fields: { ...current.fields, [name]: value } },
        );
        setDirty(true);
    }

    const isSaving = updateMutation.isPending;
    const drawerItem = drawer?.item ?? null;
    const drawerGroup = drawerItem
        ? items
              .filter((candidate) => candidate.category === drawerItem.category)
              .sort(bySortOrder)
        : [];
    const drawerIndex = drawerItem
        ? drawerGroup.findIndex((candidate) => candidate.id === drawerItem.id)
        : -1;

    return (
        <div>
            <AdminSectionHead
                title="Stack"
                description="Skills grouped by category. “Core” items are highlighted on the site. Click a skill to edit it."
            />

            <form
                onSubmit={handleQuickAdd}
                className="
                    mt-5
                    flex
                    flex-wrap
                    gap-2.5
                    rounded-2xl
                    border
                    border-(--glass-border)
                    bg-(--glass-bg)
                    p-3.5
                    backdrop-blur-xl
                    backdrop-saturate-160
                "
            >
                <input
                    value={quickName}
                    onChange={(event) => setQuickName(event.target.value)}
                    placeholder="Add a skill, e.g. Next.js"
                    aria-label="New skill name"
                    className={`${adminFieldInputClassName} min-w-36 flex-[2]`}
                />

                <select
                    value={quickCategory}
                    onChange={(event) =>
                        isCategory(event.target.value) && setQuickCategory(event.target.value)
                    }
                    aria-label="New skill category"
                    className={`${adminFieldInputClassName} min-w-28 flex-1`}
                >
                    {categories.map((category) => (
                        <option key={category.value} value={category.value}>
                            {category.value}
                        </option>
                    ))}
                </select>

                <button
                    type="submit"
                    disabled={createMutation.isPending}
                    className="
                        inline-flex
                        items-center
                        justify-center
                        gap-2
                        rounded-xl
                        border
                        border-(--accent-strong)
                        bg-(--accent-strong)
                        px-4
                        py-2
                        text-[13px]
                        font-medium
                        text-white
                        transition-colors
                        duration-150
                        hover:border-(--accent-deep)
                        hover:bg-(--accent-deep)
                        focus-visible:outline-none
                        focus-visible:ring-2
                        focus-visible:ring-(--accent-strong)
                        disabled:opacity-60
                    "
                >
                    <Plus size={15} strokeWidth={2} aria-hidden="true" />
                    {createMutation.isPending ? "Adding…" : "Add"}
                </button>

                {quickError !== null && (
                    <p className="w-full font-mono text-[11px] text-red-500">{quickError}</p>
                )}
            </form>

            <div className="mt-2">
                {!stackQuery.isPending && items.length > 0 && (
                    <CoreLegend className="mb-1" />
                )}
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
                ) : items.length === 0 ? (
                    <p className="font-mono text-[10.5px] text-(--graphite)">
                        No skills yet. Add the first one above.
                    </p>
                ) : (
                    categories.map(({ value, title }) => {
                        const group = items
                            .filter((item) => item.category === value)
                            .sort(bySortOrder);

                        if (group.length === 0) {
                            return null;
                        }

                        return (
                            <section key={value} aria-label={title} className="mt-5">
                                <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-(--graphite-soft)">
                                    {title}{" "}
                                    <span className="opacity-70">{group.length}</span>
                                </p>

                                <div className="mt-2.5 flex flex-wrap gap-2">
                                    {group.map((item) => (
                                        <SkillPill
                                            key={item.id}
                                            name={item.name}
                                            isCore={item.is_core}
                                            onClick={() => openDrawer(item)}
                                        />
                                    ))}
                                </div>
                            </section>
                        );
                    })
                )}
            </div>

            <AdminDrawer
                open={drawer !== null}
                title={drawerItem ? `Edit ${drawerItem.name}` : "Edit skill"}
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

                        {drawerItem !== null && (
                            <span className="ml-auto">
                                <IconButton
                                    label={`Delete ${drawerItem.name}`}
                                    tone="danger"
                                    onClick={() => handleDelete(drawerItem)}
                                    disabled={deleteMutation.isPending}
                                >
                                    <Trash2 size={15} strokeWidth={2} aria-hidden="true" />
                                </IconButton>
                            </span>
                        )}
                    </>
                }
            >
                {drawer !== null && drawerItem !== null && (
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
                                    <option key={category.value} value={category.value}>
                                        {category.value}
                                    </option>
                                ))}
                            </select>
                        </Field>

                        <Field label="Since year" hint="Optional">
                            <input
                                value={drawer.fields.since_year}
                                onChange={(event) => setField("since_year", event.target.value)}
                                inputMode="numeric"
                                placeholder="e.g. 2024"
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

                        <div className="sm:col-span-2">
                            <span className={adminFieldLabelClassName}>
                                {`Order in ${drawerItem.category}`}
                            </span>

                            <div className="mt-1 flex gap-2">
                                <SecondaryButton
                                    type="button"
                                    onClick={() => move(drawerItem, -1)}
                                    disabled={moving || drawerIndex <= 0}
                                >
                                    <ArrowLeft size={15} strokeWidth={2} aria-hidden="true" />
                                    Earlier
                                </SecondaryButton>

                                <SecondaryButton
                                    type="button"
                                    onClick={() => move(drawerItem, 1)}
                                    disabled={
                                        moving ||
                                        drawerIndex === -1 ||
                                        drawerIndex >= drawerGroup.length - 1
                                    }
                                >
                                    Later
                                    <ArrowRight size={15} strokeWidth={2} aria-hidden="true" />
                                </SecondaryButton>
                            </div>

                            {drawerIndex !== -1 && (
                                <span className="mt-1 block text-[12px] leading-relaxed text-(--graphite-soft)">
                                    {drawerIndex + 1} of {drawerGroup.length}
                                </span>
                            )}
                        </div>

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
