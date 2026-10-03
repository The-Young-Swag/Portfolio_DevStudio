import { useState } from "react";
import type { FormEvent } from "react";
import { useQuery } from "@tanstack/react-query";

import {
    useCreateCertification,
    useDeleteCertification,
    useUpdateCertification,
} from "@/hooks/certifications/useCertifications";
import {
    getCertifications,
    type Certification,
    type CertificationInput,
} from "@/services/certifications/certifications";
import { ApiError } from "@/services/api";
import { ImageUploadField } from "./ImageUploadField";
import { PdfUploadField } from "./PdfUploadField";

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
    image: string;
    link: string;
    parent_id: string;
    pdf: string;
    badge_image: string;
    badge_link: string;
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
    image: "",
    link: "",
    parent_id: "",
    pdf: "",
    badge_image: "",
    badge_link: "",
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
        image: certification.image,
        link: certification.link,
        parent_id: certification.parent_id === null ? "" : String(certification.parent_id),
        pdf: certification.pdf,
        badge_image: certification.badge_image,
        badge_link: certification.badge_link,
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
        image: fields.image.trim(),
        link: fields.link.trim(),
        parent_id: fields.parent_id === "" ? null : Number(fields.parent_id),
        pdf: fields.pdf.trim(),
        badge_image: fields.badge_image.trim(),
        badge_link: fields.badge_link.trim(),
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
        const childCount = (certificationsQuery.data ?? []).filter(
            (item) => item.parent_id === certification.id,
        ).length;

        const message =
            childCount > 0
                ? `Delete "${certification.name}" and its ${childCount} ${childCount === 1 ? "course" : "courses"}?`
                : `Delete "${certification.name}"?`;

        if (!window.confirm(message)) {
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

    const allCertifications = certificationsQuery.data ?? [];
    const editingHasChildren =
        typeof editingId === "number" &&
        allCertifications.some((item) => item.parent_id === editingId);
    const parentOptions = allCertifications.filter(
        (item) =>
            item.parent_id === null &&
            (typeof editingId !== "number" || item.id !== editingId),
    );

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

                        <label className="block">
                            <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-(--graphite-soft)">
                                Parent program
                            </span>
                            <select
                                value={fields.parent_id}
                                onChange={(event) => setField("parent_id", event.target.value)}
                                disabled={editingHasChildren}
                                className="mt-1 w-full rounded-lg border border-(--glass-border) bg-white/40 px-3 py-2 text-[13px] text-(--ink) outline-none focus:border-(--accent-strong) disabled:opacity-60 dark:bg-black/20"
                            >
                                <option value="">Top level</option>
                                {parentOptions.map((option) => (
                                    <option key={option.id} value={option.id}>
                                        {option.name}
                                    </option>
                                ))}
                            </select>
                        </label>
                    </div>

                    <div>
                        <ImageUploadField
                            label="Image"
                            value={fields.image}
                            onChange={(url) => setField("image", url)}
                            token={token}
                            onUnauthorized={onUnauthorized}
                            aspect={21 / 9}
                            maxEdge={1280}
                        />
                    </div>

                    <label className="block">
                        <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-(--graphite-soft)">
                            Verify link URL
                        </span>
                        <input
                            value={fields.link}
                            onChange={(event) => setField("link", event.target.value)}
                            placeholder="https://…"
                            className="mt-1 w-full rounded-lg border border-(--glass-border) bg-white/40 px-3 py-2 text-[13px] text-(--ink) outline-none focus:border-(--accent-strong) dark:bg-black/20"
                        />
                    </label>

                    <div>
                        <PdfUploadField
                            label="Certificate PDF"
                            value={fields.pdf}
                            onChange={(url) => setField("pdf", url)}
                            token={token}
                            onUnauthorized={onUnauthorized}
                            defaultFilename="certificate.pdf"
                        />
                    </div>

                    <div>
                        <ImageUploadField
                            label="Badge image"
                            value={fields.badge_image}
                            onChange={(url) => setField("badge_image", url)}
                            token={token}
                            onUnauthorized={onUnauthorized}
                            aspect={1}
                            maxEdge={512}
                        />
                    </div>

                    <label className="block">
                        <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-(--graphite-soft)">
                            Badge link URL
                        </span>
                        <input
                            value={fields.badge_link}
                            onChange={(event) => setField("badge_link", event.target.value)}
                            placeholder="https://…"
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
                        {(certificationsQuery.data ?? [])
                            .filter(
                                (certification) =>
                                    certification.parent_id === null ||
                                    !(certificationsQuery.data ?? []).some(
                                        (parent) => parent.id === certification.parent_id,
                                    ),
                            )
                            .map((certification) => {
                                const children = (certificationsQuery.data ?? []).filter(
                                    (item) => item.parent_id === certification.id,
                                );

                                return (
                                    <li key={certification.id}>
                                        <div className="flex items-center justify-between gap-4 p-4">
                                            <div className="min-w-0">
                                                <p className="truncate font-display text-[16px] text-(--ink)">
                                                    {certification.name}
                                                </p>
                                                <p className="mt-0.5 font-mono text-[10.5px] text-(--graphite-soft)">
                                                    {certification.issuer} · {certification.year}
                                                    {children.length > 0 &&
                                                        ` · ${children.length} ${children.length === 1 ? "course" : "courses"}`}
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
                                        </div>

                                        {children.map((child) => (
                                            <div
                                                key={child.id}
                                                className="ml-4 flex items-center justify-between gap-4 border-l border-(--line) p-4 pl-4"
                                            >
                                                <div className="min-w-0">
                                                    <p className="truncate text-[13px] text-(--ink)">
                                                        {child.name}
                                                    </p>
                                                    <p className="mt-0.5 font-mono text-[10.5px] text-(--graphite-soft)">
                                                        {child.issuer} · {child.year}
                                                    </p>
                                                </div>

                                                <div className="flex shrink-0 gap-3">
                                                    <button
                                                        type="button"
                                                        onClick={() => startEdit(child)}
                                                        className="font-mono text-[11px] text-(--graphite) transition-colors duration-150 hover:text-(--accent-strong)"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDelete(child)}
                                                        disabled={deleteMutation.isPending}
                                                        className="font-mono text-[11px] text-(--graphite) transition-colors duration-150 hover:text-red-500 disabled:opacity-60"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </li>
                                );
                            })}
                    </ul>
                )}
            </div>
        </section>
    );
}
