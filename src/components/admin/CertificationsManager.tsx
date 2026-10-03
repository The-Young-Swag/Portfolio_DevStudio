import { useState } from "react";
import type { FormEvent } from "react";
import { useQuery } from "@tanstack/react-query";

import {
    useCreateCertification,
    useDeleteCertification,
    useUpdateCertification,
} from "@/hooks/certifications/useCertifications";
import {
    ApiError,
    getCertifications,
    type Certification,
    type CertificationInput,
} from "@/services/certifications/certifications";

type CertificationsManagerProps = {
    token: string;
    onUnauthorized: () => void;
};

type CertificationFormFields = {
    name: string;
    issuer: string;
    year: string;
    credential: string;
    badge: string;
    code: string;
    accent: string;
    sort_order: string;
};

const emptyFields: CertificationFormFields = {
    name: "",
    issuer: "",
    year: "",
    credential: "",
    badge: "",
    code: "",
    accent: "blue",
    sort_order: "",
};

const accents = ["blue", "purple", "viridian"] as const;

function isAccent(value: string): value is CertificationInput["accent"] {
    return (accents as readonly string[]).includes(value);
}

function toFields(certification: Certification): CertificationFormFields {
    return {
        name: certification.name,
        issuer: certification.issuer,
        year: certification.year,
        credential: certification.credential,
        badge: certification.badge,
        code: certification.code,
        accent: certification.accent,
        sort_order: String(certification.sort_order),
    };
}

function toInput(fields: CertificationFormFields): CertificationInput {
    return {
        name: fields.name.trim(),
        issuer: fields.issuer.trim(),
        year: fields.year.trim(),
        credential: fields.credential.trim(),
        badge: fields.badge.trim(),
        code: fields.code.trim(),
        accent: isAccent(fields.accent) ? fields.accent : "blue",
        sort_order: fields.sort_order.trim() === "" ? 0 : Number(fields.sort_order),
    };
}

function isUnauthorized(error: unknown): boolean {
    return error instanceof ApiError && error.status === 401;
}

export function CertificationsManager({
    token,
    onUnauthorized,
}: CertificationsManagerProps) {
    const certificationsQuery = useQuery({
        queryKey: ["certifications"],
        queryFn: getCertifications,
        retry: 1,
        refetchOnWindowFocus: false,
    });

    const createMutation = useCreateCertification(token);
    const updateMutation = useUpdateCertification(token);
    const deleteMutation = useDeleteCertification(token);

    const [editingId, setEditingId] = useState<number | "new" | null>(null);
    const [fields, setFields] = useState<CertificationFormFields>(emptyFields);
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

    function startEdit(certification: Certification) {
        setEditingId(certification.id);
        setFields(toFields(certification));
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

    function handleDelete(certification: Certification) {
        if (!window.confirm(`Delete "${certification.name}"?`)) {
            return;
        }

        deleteMutation.mutate(certification.id, {
            onError: (error: unknown) => {
                if (isUnauthorized(error)) {
                    onUnauthorized();
                }
            },
        });
    }

    function setField(name: keyof CertificationFormFields, value: string) {
        setFields((current) => ({ ...current, [name]: value }));
    }

    const isSaving = createMutation.isPending || updateMutation.isPending;

    return (
        <section aria-label="Certifications">
            <div className="mt-8 flex items-baseline justify-between">
                <h2 className="font-display text-[20px] font-medium text-(--ink)">
                    Certifications
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
                    Add certification
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
                                Issuer
                            </span>
                            <input
                                value={fields.issuer}
                                onChange={(event) => setField("issuer", event.target.value)}
                                className="mt-1 w-full rounded-lg border border-(--glass-border) bg-white/40 px-3 py-2 text-[13px] text-(--ink) outline-none focus:border-(--accent-strong) dark:bg-black/20"
                            />
                        </label>

                        <label className="block">
                            <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-(--graphite-soft)">
                                Year
                            </span>
                            <input
                                value={fields.year}
                                onChange={(event) => setField("year", event.target.value)}
                                placeholder="2026"
                                className="mt-1 w-full rounded-lg border border-(--glass-border) bg-white/40 px-3 py-2 text-[13px] text-(--ink) outline-none focus:border-(--accent-strong) dark:bg-black/20"
                            />
                        </label>

                        <label className="block">
                            <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-(--graphite-soft)">
                                Credential
                            </span>
                            <input
                                value={fields.credential}
                                onChange={(event) => setField("credential", event.target.value)}
                                className="mt-1 w-full rounded-lg border border-(--glass-border) bg-white/40 px-3 py-2 text-[13px] text-(--ink) outline-none focus:border-(--accent-strong) dark:bg-black/20"
                            />
                        </label>

                        <label className="block">
                            <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-(--graphite-soft)">
                                Badge
                            </span>
                            <input
                                value={fields.badge}
                                onChange={(event) => setField("badge", event.target.value)}
                                className="mt-1 w-full rounded-lg border border-(--glass-border) bg-white/40 px-3 py-2 text-[13px] text-(--ink) outline-none focus:border-(--accent-strong) dark:bg-black/20"
                            />
                        </label>

                        <label className="block">
                            <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-(--graphite-soft)">
                                Code
                            </span>
                            <input
                                value={fields.code}
                                onChange={(event) => setField("code", event.target.value)}
                                className="mt-1 w-full rounded-lg border border-(--glass-border) bg-white/40 px-3 py-2 text-[13px] text-(--ink) outline-none focus:border-(--accent-strong) dark:bg-black/20"
                            />
                        </label>

                        <label className="block">
                            <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-(--graphite-soft)">
                                Accent
                            </span>
                            <select
                                value={fields.accent}
                                onChange={(event) => setField("accent", event.target.value)}
                                className="mt-1 w-full rounded-lg border border-(--glass-border) bg-white/40 px-3 py-2 text-[13px] text-(--ink) outline-none focus:border-(--accent-strong) dark:bg-black/20"
                            >
                                {accents.map((accent) => (
                                    <option key={accent} value={accent}>
                                        {accent}
                                    </option>
                                ))}
                            </select>
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
                {certificationsQuery.isPending ? (
                    <p className="font-mono text-[10.5px] text-(--graphite)">
                        Loading certifications...
                    </p>
                ) : certificationsQuery.isError ? (
                    <div className="flex items-center gap-3">
                        <p className="font-mono text-[10.5px] text-(--graphite)">
                            Unable to load certifications.
                        </p>
                        <button
                            type="button"
                            onClick={() => certificationsQuery.refetch()}
                            className="font-mono text-[11px] text-(--accent-strong) hover:underline"
                        >
                            Retry
                        </button>
                    </div>
                ) : certificationsQuery.data.length === 0 ? (
                    <p className="font-mono text-[10.5px] text-(--graphite)">
                        No certifications yet.
                    </p>
                ) : (
                    <ul className="divide-y divide-(--line) rounded-2xl border border-(--glass-border) bg-(--glass-bg) backdrop-blur-xl backdrop-saturate-160">
                        {certificationsQuery.data.map((certification) => (
                            <li
                                key={certification.id}
                                className="flex items-center justify-between gap-4 p-4"
                            >
                                <div className="min-w-0">
                                    <p className="truncate font-display text-[16px] text-(--ink)">
                                        {certification.name}
                                    </p>
                                    <p className="mt-0.5 font-mono text-[10.5px] text-(--graphite-soft)">
                                        {certification.issuer} · {certification.year}
                                    </p>
                                </div>

                                <div className="flex shrink-0 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => startEdit(certification)}
                                        className="font-mono text-[11px] text-(--graphite) transition-colors duration-150 hover:text-(--accent-strong)"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleDelete(certification)}
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
