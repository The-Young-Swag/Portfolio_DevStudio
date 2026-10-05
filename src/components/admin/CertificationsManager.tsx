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
import { isUnauthorized } from "@/services/api";
import { useAdminToast } from "./toastContext";
import { AdminDrawer } from "./AdminDrawer";
import { Field, FormError, adminFieldInputClassName } from "./AdminFields";
import { PrimaryButton, SecondaryButton } from "./AdminButtons";
import { AddButton, AdminRow, AdminSearchInput, AdminSectionHead } from "./AdminList";
import { SaveBar } from "./SaveBar";
import { ImageUploadField } from "./ImageUploadField";
import { PdfUploadField } from "./PdfUploadField";

type CertificationsManagerProps = {
    token: string;
    onUnauthorized: () => void;
    onDirtyChange: (dirty: boolean) => void;
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

export function CertificationsManager({
    token,
    onUnauthorized,
    onDirtyChange,
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
    const notify = useAdminToast();

    const [drawer, setDrawer] = useState<{
        id: number | "new";
        fields: CertificationFormFields;
        initial: CertificationFormFields;
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

    function openDrawer(id: number | "new", fields: CertificationFormFields) {
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

    function handleDelete(certification: Certification) {
        const childCount = (certificationsQuery.data ?? []).filter(
            (item) => item.parent_id === certification.id,
        ).length;

        const message =
            childCount > 0
                ? `Delete "${certification.name}" and its ${childCount} ${childCount === 1 ? "course" : "courses"}? This goes live immediately.`
                : `Delete "${certification.name}"? This goes live immediately.`;

        if (!window.confirm(message)) {
            return;
        }

        deleteMutation.mutate(certification.id, {
            onSuccess: () => notify("Deleted"),
            onError: (error: unknown) => {
                if (isUnauthorized(error)) {
                    onUnauthorized();
                }
            },
        });
    }

    function setField(name: keyof CertificationFormFields, value: string) {
        if (drawer === null) {
            return;
        }

        setDrawer((current) =>
            current === null ? current : { ...current, fields: { ...current.fields, [name]: value } },
        );
        setDirty(true);
    }

    const isSaving = createMutation.isPending || updateMutation.isPending;
    const certifications = certificationsQuery.data ?? [];
    const query = search.trim().toLowerCase();
    const visible =
        query === ""
            ? certifications
            : certifications.filter((certification) =>
                  `${certification.name} ${certification.issuer} ${certification.year}`
                      .toLowerCase()
                      .includes(query),
              );
    const parentOptions = certifications.filter(
        (item) =>
            item.parent_id === null &&
            (drawer === null || typeof drawer.id !== "number" || item.id !== drawer.id),
    );

    return (
        <div>
            <AdminSectionHead
                title="Certifications"
                description="Credentials. A certificate can group child certificates under it."
                action={
                    <AddButton onClick={() => openDrawer("new", emptyFields)}>
                        Add certification
                    </AddButton>
                }
            />

            <div className="mt-5">
                <AdminSearchInput
                    value={search}
                    onChange={setSearch}
                    placeholder="Search certifications…"
                />
            </div>

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
                ) : visible.length === 0 ? (
                    <p className="font-mono text-[10.5px] text-(--graphite)">
                        {certifications.length === 0
                            ? "No certifications yet."
                            : "No certifications match the search."}
                    </p>
                ) : (
                    <ul className="divide-y divide-(--line) rounded-2xl border border-(--glass-border) bg-(--glass-bg) backdrop-blur-xl backdrop-saturate-160">
                        {visible.map((certification) => (
                            <AdminRow
                                key={certification.id}
                                title={certification.name}
                                subtitle={`${certification.issuer} · ${certification.year}`}
                                tag={certification.link !== "" ? "Verified" : ""}
                                onEdit={() => openDrawer(certification.id, toFields(certification))}
                                onDelete={() => handleDelete(certification)}
                                deleting={deleteMutation.isPending}
                            />
                        ))}
                    </ul>
                )}
            </div>

            <AdminDrawer
                open={drawer !== null}
                title={drawer !== null && drawer.id === "new" ? "Add certification" : "Edit certification"}
                onClose={closeDrawer}
                footer={
                    <>
                        <PrimaryButton
                            type="submit"
                            form="certification-editor"
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
                        id="certification-editor"
                        onSubmit={handleSubmit}
                        className="grid gap-3 sm:grid-cols-2"
                    >
                        <Field label="Title" wide>
                            <input
                                value={drawer.fields.name}
                                onChange={(event) => setField("name", event.target.value)}
                                className={adminFieldInputClassName}
                            />
                        </Field>

                        <Field label="Issuer">
                            <input
                                value={drawer.fields.issuer}
                                onChange={(event) => setField("issuer", event.target.value)}
                                className={adminFieldInputClassName}
                            />
                        </Field>

                        <Field label="Year">
                            <input
                                value={drawer.fields.year}
                                onChange={(event) => setField("year", event.target.value)}
                                placeholder="2026"
                                className={adminFieldInputClassName}
                            />
                        </Field>

                        <Field label="Credential">
                            <input
                                value={drawer.fields.credential}
                                onChange={(event) => setField("credential", event.target.value)}
                                placeholder="Coursera"
                                className={adminFieldInputClassName}
                            />
                        </Field>

                        <Field label="Badge">
                            <input
                                value={drawer.fields.badge}
                                onChange={(event) => setField("badge", event.target.value)}
                                placeholder="IBM"
                                className={adminFieldInputClassName}
                            />
                        </Field>

                        <Field label="Credential code">
                            <input
                                value={drawer.fields.code}
                                onChange={(event) => setField("code", event.target.value)}
                                placeholder="FSD"
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

                        <Field label="Accent">
                            <select
                                value={drawer.fields.accent}
                                onChange={(event) => setField("accent", event.target.value)}
                                className={adminFieldInputClassName}
                            >
                                {accents.map((accent) => (
                                    <option key={accent} value={accent}>
                                        {accent}
                                    </option>
                                ))}
                            </select>
                        </Field>

                        <Field label="Parent program" hint="Group courses under a parent certificate">
                            <select
                                value={drawer.fields.parent_id}
                                onChange={(event) => setField("parent_id", event.target.value)}
                                className={adminFieldInputClassName}
                            >
                                <option value="">None (top level)</option>
                                {parentOptions.map((option) => (
                                    <option key={option.id} value={option.id}>
                                        {option.name}
                                    </option>
                                ))}
                            </select>
                        </Field>

                        <Field label="Verify link" wide>
                            <input
                                value={drawer.fields.link}
                                onChange={(event) => setField("link", event.target.value)}
                                placeholder="https://…"
                                className={adminFieldInputClassName}
                            />
                        </Field>

                        <ImageUploadField
                            label="Certificate image"
                            value={drawer.fields.image}
                            onChange={(url) => setField("image", url)}
                            token={token}
                            onUnauthorized={onUnauthorized}
                            aspect={21 / 9}
                            maxEdge={1280}
                        />

                        <PdfUploadField
                            label="Certificate PDF"
                            value={drawer.fields.pdf}
                            onChange={(url) => setField("pdf", url)}
                            token={token}
                            onUnauthorized={onUnauthorized}
                            defaultFilename="certificate.pdf"
                        />

                        <ImageUploadField
                            label="Badge image"
                            value={drawer.fields.badge_image}
                            onChange={(url) => setField("badge_image", url)}
                            token={token}
                            onUnauthorized={onUnauthorized}
                            aspect={1}
                            maxEdge={512}
                        />

                        <Field label="Badge link" wide>
                            <input
                                value={drawer.fields.badge_link}
                                onChange={(event) => setField("badge_link", event.target.value)}
                                placeholder="https://…"
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
