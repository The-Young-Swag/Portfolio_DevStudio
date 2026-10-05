import { useState } from "react";
import type { FormEvent } from "react";
import { useQuery } from "@tanstack/react-query";

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
import { AdminDrawer } from "./AdminDrawer";
import { Field, FormError, adminFieldInputClassName } from "./AdminFields";
import { PrimaryButton, SecondaryButton } from "./AdminButtons";
import { AddButton, AdminRow, AdminSearchInput, AdminSectionHead } from "./AdminList";
import { SaveBar } from "./SaveBar";

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

    const [drawer, setDrawer] = useState<{
        id: number | "new";
        fields: SocialLinkFormFields;
        initial: SocialLinkFormFields;
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

    function openDrawer(id: number | "new", fields: SocialLinkFormFields) {
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

    function handleDelete(link: SocialLink) {
        if (!window.confirm(`Delete "${link.label}"? This goes live immediately.`)) {
            return;
        }

        deleteMutation.mutate(link.id, {
            onSuccess: () => notify("Deleted"),
            onError: (error: unknown) => {
                if (isUnauthorized(error)) {
                    onUnauthorized();
                }
            },
        });
    }

    function setField(name: keyof SocialLinkFormFields, value: string) {
        if (drawer === null) {
            return;
        }

        setDrawer((current) =>
            current === null ? current : { ...current, fields: { ...current.fields, [name]: value } },
        );
        setDirty(true);
    }

    const iconChoices =
        drawer !== null && !iconOptions.includes(drawer.fields.icon)
            ? [...iconOptions, drawer.fields.icon]
            : iconOptions;

    const isSaving = createMutation.isPending || updateMutation.isPending;
    const links = socialLinksQuery.data ?? [];
    const query = search.trim().toLowerCase();
    const visible =
        query === ""
            ? links
            : links.filter((link) =>
                  `${link.label} ${link.href} ${link.icon}`.toLowerCase().includes(query),
              );

    return (
        <div>
            <AdminSectionHead
                title="Social links"
                description="Icons shown in the sidebar “Connect” group."
                action={<AddButton onClick={() => openDrawer("new", emptyFields)}>Add link</AddButton>}
            />

            <div className="mt-5">
                <AdminSearchInput
                    value={search}
                    onChange={setSearch}
                    placeholder="Search links…"
                />
            </div>

            <div className="mt-4">
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
                ) : visible.length === 0 ? (
                    <p className="font-mono text-[10.5px] text-(--graphite)">
                        {links.length === 0 ? "No links yet." : "No links match the search."}
                    </p>
                ) : (
                    <ul className="divide-y divide-(--line) rounded-2xl border border-(--glass-border) bg-(--glass-bg) backdrop-blur-xl backdrop-saturate-160">
                        {visible.map((link) => (
                            <AdminRow
                                key={link.id}
                                title={link.label}
                                subtitle={link.href}
                                tag={link.icon}
                                onEdit={() => openDrawer(link.id, toFields(link))}
                                onDelete={() => handleDelete(link)}
                                deleting={deleteMutation.isPending}
                            />
                        ))}
                    </ul>
                )}
            </div>

            <AdminDrawer
                open={drawer !== null}
                title={drawer !== null && drawer.id === "new" ? "Add link" : "Edit link"}
                onClose={closeDrawer}
                footer={
                    <>
                        <PrimaryButton
                            type="submit"
                            form="social-link-editor"
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
                        id="social-link-editor"
                        onSubmit={handleSubmit}
                        className="grid gap-3 sm:grid-cols-2"
                    >
                        <Field label="Label">
                            <input
                                value={drawer.fields.label}
                                onChange={(event) => setField("label", event.target.value)}
                                placeholder="GitHub"
                                className={adminFieldInputClassName}
                            />
                        </Field>

                        <Field label="Icon">
                            <select
                                value={drawer.fields.icon}
                                onChange={(event) => setField("icon", event.target.value)}
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
                                value={drawer.fields.href}
                                onChange={(event) => setField("href", event.target.value)}
                                placeholder="https://github.com/…"
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
