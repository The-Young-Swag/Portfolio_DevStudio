import { useState } from "react";
import type { FormEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowDown, ArrowUp } from "lucide-react";

import {
    useCreateSocialLink,
    useDeleteSocialLink,
    useUpdateSocialLink,
} from "@/hooks/social-links/useSocialLinks";
import { isUnauthorized } from "@/services/api";
import {
    getSocialLinks,
    type SocialLink,
    type SocialLinkInput,
} from "@/services/social-links/socialLinks";
import { useAdminToast } from "./toastContext";
import { Field, FormError, adminFieldInputClassName } from "./AdminFields";
import { ConfirmDeleteButton, IconButton, PrimaryButton } from "./AdminButtons";
import { AccordionItem, AddRowButton, AdminSectionHead } from "./AdminList";
import { reorderSwap } from "./reorder";

type SocialLinksManagerProps = {
    token: string;
    onUnauthorized: () => void;
    onDirtyChange: (dirty: boolean) => void;
};

type SocialLinkFormFields = {
    label: string;
    href: string;
    icon: string;
    sort_order: string;
};

const emptyFields: SocialLinkFormFields = {
    label: "",
    href: "",
    icon: "github",
    sort_order: "",
};

const iconOptions = ["github", "linkedin", "email"];

function toFields(link: SocialLink): SocialLinkFormFields {
    return {
        label: link.label,
        href: link.href,
        icon: link.icon,
        sort_order: String(link.sort_order),
    };
}

function toInput(fields: SocialLinkFormFields): SocialLinkInput {
    return {
        label: fields.label.trim(),
        href: fields.href.trim(),
        icon: fields.icon.trim(),
        sort_order: fields.sort_order.trim() === "" ? 0 : Number(fields.sort_order),
    };
}

function toInputForItem(link: SocialLink, sortOrder: number): SocialLinkInput {
    return toInput({ ...toFields(link), sort_order: String(sortOrder) });
}

function SocialLinkForm({
    fields,
    iconChoices,
    formError,
    onField,
}: {
    fields: SocialLinkFormFields;
    iconChoices: string[];
    formError: string | null;
    onField: (name: keyof SocialLinkFormFields, value: string) => void;
}) {
    return (
        <>
            <Field label="Label">
                <input
                    value={fields.label}
                    onChange={(event) => onField("label", event.target.value)}
                    placeholder="e.g. GitHub"
                    className={adminFieldInputClassName}
                />
            </Field>

            <Field label="Icon">
                <select
                    value={fields.icon}
                    onChange={(event) => onField("icon", event.target.value)}
                    className={adminFieldInputClassName}
                >
                    {iconChoices.map((icon) => (
                        <option key={icon} value={icon}>
                            {icon}
                        </option>
                    ))}
                </select>
            </Field>

            <Field label="URL" wide>
                <input
                    value={fields.href}
                    onChange={(event) => onField("href", event.target.value)}
                    placeholder="https://github.com/…"
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

            {formError !== null && (
                <div className="sm:col-span-2">
                    <FormError message={formError} />
                </div>
            )}
        </>
    );
}

export function SocialLinksManager({ token, onUnauthorized, onDirtyChange }: SocialLinksManagerProps) {
    const socialLinksQuery = useQuery({
        queryKey: ["social-links"],
        queryFn: getSocialLinks,
        retry: 1,
        refetchOnWindowFocus: false,
    });

    const createMutation = useCreateSocialLink(token);
    const updateMutation = useUpdateSocialLink(token);
    const deleteMutation = useDeleteSocialLink(token);
    const notify = useAdminToast();

    const [editor, setEditor] = useState<{
        id: number | "new";
        fields: SocialLinkFormFields;
        initial: SocialLinkFormFields;
    } | null>(null);
    const [touched, setTouched] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [moving, setMoving] = useState(false);

    const links = socialLinksQuery.data ?? [];

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

    function openEditor(id: number | "new", fields: SocialLinkFormFields) {
        if (editor !== null && editor.id !== id && touched) {
            if (!window.confirm("Discard unsaved changes?")) {
                return;
            }
        }

        setEditor({ id, fields, initial: fields });
        setFormError(null);
        setDirty(false);
    }

    function toggleEditor(id: number | "new", fields: SocialLinkFormFields) {
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
        const swap = reorderSwap(links, id, direction);

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

    function setField(name: keyof SocialLinkFormFields, value: string) {
        if (editor === null) {
            return;
        }

        setEditor((current) =>
            current === null ? current : { ...current, fields: { ...current.fields, [name]: value } },
        );
        setDirty(true);
    }

    const iconChoices =
        editor !== null && !iconOptions.includes(editor.fields.icon)
            ? [...iconOptions, editor.fields.icon]
            : iconOptions;

    const isSaving = createMutation.isPending || updateMutation.isPending;
    const openId = editor?.id ?? null;

    function editorFooter(id: number | "new") {
        return (
            <div className="mt-5 flex items-center gap-2.5 border-t border-(--line) pt-4">
                <PrimaryButton type="submit" form="social-link-editor" disabled={isSaving}>
                    {isSaving ? "Saving…" : "Save & publish"}
                </PrimaryButton>

                <span className="flex-1" />

                {id !== "new" && (
                    <>
                        <IconButton
                            label="Move link up"
                            onClick={() => move(id, -1)}
                            disabled={moving || reorderSwap(links, id, -1) === null}
                        >
                            <ArrowUp size={16} strokeWidth={2} aria-hidden="true" />
                        </IconButton>

                        <IconButton
                            label="Move link down"
                            onClick={() => move(id, 1)}
                            disabled={moving || reorderSwap(links, id, 1) === null}
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
                title="Social links"
                description="Shown in the site's Connect group."
            />

            <div className="mt-6">
                {socialLinksQuery.isPending ? (
                    <p className="font-mono text-[10.5px] text-(--graphite)">
                        Loading social links...
                    </p>
                ) : socialLinksQuery.isError ? (
                    <div className="flex items-center gap-3">
                        <p className="font-mono text-[10.5px] text-(--graphite)">
                            Unable to load social links.
                        </p>
                        <button
                            type="button"
                            onClick={() => socialLinksQuery.refetch()}
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
                                    title={editor.fields.label || "New link"}
                                    subtitle={editor.fields.href || "Not saved yet"}
                                    onToggle={() => toggleEditor("new", emptyFields)}
                                >
                                    <form
                                        id="social-link-editor"
                                        onSubmit={handleSubmit}
                                        className="grid gap-x-4 gap-y-3.5 sm:grid-cols-2"
                                    >
                                        <SocialLinkForm
                                            fields={editor.fields}
                                            iconChoices={iconChoices}
                                            formError={formError}
                                            onField={setField}
                                        />
                                    </form>

                                    {editorFooter("new")}
                                </AccordionItem>
                            )}

                            {links.length === 0 && openId !== "new" && (
                                <p className="px-5 py-4 font-mono text-[10.5px] text-(--graphite)">
                                    No links yet.
                                </p>
                            )}

                            {links.map((link) => {
                                const open = openId === link.id;

                                return (
                                    <AccordionItem
                                        key={link.id}
                                        open={open}
                                        title={open ? editor?.fields.label || link.label : link.label}
                                        subtitle={open && editor ? editor.fields.href || "Not saved yet" : link.href}
                                        onToggle={() => toggleEditor(link.id, toFields(link))}
                                    >
                                        {open && editor !== null && (
                                            <>
                                                <form
                                                    id="social-link-editor"
                                                    onSubmit={handleSubmit}
                                                    className="grid gap-x-4 gap-y-3.5 sm:grid-cols-2"
                                                >
                                                    <SocialLinkForm
                                                        fields={editor.fields}
                                                        iconChoices={iconChoices}
                                                        formError={formError}
                                                        onField={setField}
                                                    />
                                                </form>

                                                {editorFooter(link.id)}
                                            </>
                                        )}
                                    </AccordionItem>
                                );
                            })}
                        </div>

                        <AddRowButton onClick={() => openEditor("new", emptyFields)}>
                            Add link
                        </AddRowButton>
                    </div>
                )}
            </div>
        </div>
    );
}
