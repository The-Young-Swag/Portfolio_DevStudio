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

type SocialLinksManagerProps = {
    token: string;
    onUnauthorized: () => void;
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
    icon: "",
    sort_order: "",
};

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

export function SocialLinksManager({ token, onUnauthorized }: SocialLinksManagerProps) {
    const socialLinksQuery = useQuery({
        queryKey: ["social-links"],
        queryFn: getSocialLinks,
        retry: 1,
        refetchOnWindowFocus: false,
    });

    const createMutation = useCreateSocialLink(token);
    const updateMutation = useUpdateSocialLink(token);
    const deleteMutation = useDeleteSocialLink(token);

    const [editingId, setEditingId] = useState<number | "new" | null>(null);
    const [fields, setFields] = useState<SocialLinkFormFields>(emptyFields);
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

    function startEdit(link: SocialLink) {
        setEditingId(link.id);
        setFields(toFields(link));
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

    function handleDelete(link: SocialLink) {
        if (!window.confirm(`Delete "${link.label}"?`)) {
            return;
        }

        deleteMutation.mutate(link.id, {
            onSuccess: () => markSaved(),
                onError: (error: unknown) => {
                if (isUnauthorized(error)) {
                    onUnauthorized();
                }
            },
        });
    }

    function setField(name: keyof SocialLinkFormFields, value: string) {
        setFields((current) => ({ ...current, [name]: value }));
    }

    const isSaving = createMutation.isPending || updateMutation.isPending;

    return (
        <section aria-label="Social links">
            <div className="mt-8 flex items-baseline justify-between">
                <h2 className="font-display text-[20px] font-medium text-(--ink)">
                    Social links
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
                    Add link
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
                                Label
                            </span>
                            <input
                                value={fields.label}
                                onChange={(event) => setField("label", event.target.value)}
                                placeholder="GitHub"
                                className="mt-1 w-full rounded-lg border border-(--glass-border) bg-white/40 px-3 py-2 text-[13px] text-(--ink) outline-none focus:border-(--accent-strong) dark:bg-black/20"
                            />
                        </label>

                        <label className="block">
                            <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-(--graphite-soft)">
                                Icon (github, linkedin, email)
                            </span>
                            <input
                                value={fields.icon}
                                onChange={(event) => setField("icon", event.target.value)}
                                placeholder="github"
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
                            URL
                        </span>
                        <input
                            value={fields.href}
                            onChange={(event) => setField("href", event.target.value)}
                            placeholder="https://github.com/…"
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
                ) : socialLinksQuery.data.length === 0 ? (
                    <p className="font-mono text-[10.5px] text-(--graphite)">
                        No social links yet.
                    </p>
                ) : (
                    <ul className="divide-y divide-(--line) rounded-2xl border border-(--glass-border) bg-(--glass-bg) backdrop-blur-xl backdrop-saturate-160">
                        {socialLinksQuery.data.map((link) => (
                            <li
                                key={link.id}
                                className="flex items-center justify-between gap-4 p-4"
                            >
                                <div className="min-w-0">
                                    <p className="truncate font-display text-[16px] text-(--ink)">
                                        {link.label}
                                    </p>
                                    <p className="mt-0.5 truncate font-mono text-[10.5px] text-(--graphite-soft)">
                                        {link.href}
                                    </p>
                                </div>

                                <div className="flex shrink-0 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => startEdit(link)}
                                        className="font-mono text-[11px] text-(--graphite) transition-colors duration-150 hover:text-(--accent-strong)"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleDelete(link)}
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
