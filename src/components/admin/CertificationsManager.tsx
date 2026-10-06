import { useState } from "react";
import type { FormEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowDown, ArrowUp } from "lucide-react";

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
import { Field, FormError, adminFieldInputClassName } from "./AdminFields";
import { ConfirmDeleteButton, IconButton, PrimaryButton } from "./AdminButtons";
import { AccordionItem, AddRowButton, AdminSectionHead } from "./AdminList";
import { ImageUploadField } from "./ImageUploadField";
import { PdfUploadField } from "./PdfUploadField";
import { reorderSwap } from "./reorder";

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

function toInputForItem(certification: Certification, sortOrder: number): CertificationInput {
    return toInput({ ...toFields(certification), sort_order: String(sortOrder) });
}

function subtitleFor(fields: Pick<CertificationFormFields, "issuer" | "year">): string {
    return (
        [fields.issuer, fields.year].filter((part) => part !== "").join(" · ") ||
        "Not saved yet"
    );
}

function CertificationForm({
    fields,
    parentOptions,
    formError,
    token,
    onUnauthorized,
    onField,
}: {
    fields: CertificationFormFields;
    parentOptions: Certification[];
    formError: string | null;
    token: string;
    onUnauthorized: () => void;
    onField: (name: keyof CertificationFormFields, value: string) => void;
}) {
    return (
        <>
            <Field label="Title" wide>
                <input
                    value={fields.name}
                    onChange={(event) => onField("name", event.target.value)}
                    className={adminFieldInputClassName}
                />
            </Field>

            <Field label="Issuer">
                <input
                    value={fields.issuer}
                    onChange={(event) => onField("issuer", event.target.value)}
                    className={adminFieldInputClassName}
                />
            </Field>

            <Field label="Date">
                <input
                    value={fields.year}
                    onChange={(event) => onField("year", event.target.value)}
                    placeholder="2026"
                    className={adminFieldInputClassName}
                />
            </Field>

            <Field label="Platform">
                <input
                    value={fields.credential}
                    onChange={(event) => onField("credential", event.target.value)}
                    placeholder="Coursera"
                    className={adminFieldInputClassName}
                />
            </Field>

            <Field label="Badge">
                <input
                    value={fields.badge}
                    onChange={(event) => onField("badge", event.target.value)}
                    placeholder="IBM"
                    className={adminFieldInputClassName}
                />
            </Field>

            <Field label="Credential code">
                <input
                    value={fields.code}
                    onChange={(event) => onField("code", event.target.value)}
                    placeholder="FSD"
                    className={adminFieldInputClassName}
                />
            </Field>

            <Field label="Verify link" wide>
                <input
                    value={fields.link}
                    onChange={(event) => onField("link", event.target.value)}
                    placeholder="https://…"
                    className={adminFieldInputClassName}
                />
            </Field>

            <Field label="Group under" hint="Group courses under a parent certificate">
                <select
                    value={fields.parent_id}
                    onChange={(event) => onField("parent_id", event.target.value)}
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

            <Field label="Accent">
                <select
                    value={fields.accent}
                    onChange={(event) => onField("accent", event.target.value)}
                    className={adminFieldInputClassName}
                >
                    {accents.map((accent) => (
                        <option key={accent} value={accent}>
                            {accent}
                        </option>
                    ))}
                </select>
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

            <ImageUploadField
                label="Certificate image"
                value={fields.image}
                onChange={(url) => onField("image", url)}
                token={token}
                onUnauthorized={onUnauthorized}
                aspect={21 / 9}
                maxEdge={1280}
            />

            <PdfUploadField
                label="Certificate PDF"
                value={fields.pdf}
                onChange={(url) => onField("pdf", url)}
                token={token}
                onUnauthorized={onUnauthorized}
                defaultFilename="certificate.pdf"
            />

            <ImageUploadField
                label="Badge image"
                value={fields.badge_image}
                onChange={(url) => onField("badge_image", url)}
                token={token}
                onUnauthorized={onUnauthorized}
                aspect={1}
                maxEdge={512}
            />

            <Field label="Badge link" wide>
                <input
                    value={fields.badge_link}
                    onChange={(event) => onField("badge_link", event.target.value)}
                    placeholder="https://…"
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

    const [editor, setEditor] = useState<{
        id: number | "new";
        fields: CertificationFormFields;
        initial: CertificationFormFields;
    } | null>(null);
    const [touched, setTouched] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [moving, setMoving] = useState(false);

    const certifications = certificationsQuery.data ?? [];

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

    function openEditor(id: number | "new", fields: CertificationFormFields) {
        if (editor !== null && editor.id !== id && touched) {
            if (!window.confirm("Discard unsaved changes?")) {
                return;
            }
        }

        setEditor({ id, fields, initial: fields });
        setFormError(null);
        setDirty(false);
    }

    function toggleEditor(id: number | "new", fields: CertificationFormFields) {
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

    function childCountFor(id: number): number {
        return certifications.filter((item) => item.parent_id === id).length;
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
        const swap = reorderSwap(certifications, id, direction);

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

    function setField(name: keyof CertificationFormFields, value: string) {
        if (editor === null) {
            return;
        }

        setEditor((current) =>
            current === null ? current : { ...current, fields: { ...current.fields, [name]: value } },
        );
        setDirty(true);
    }

    const isSaving = createMutation.isPending || updateMutation.isPending;
    const openId = editor?.id ?? null;
    const parentOptions = (certifications ?? []).filter(
        (item) =>
            item.parent_id === null &&
            (editor === null || typeof editor.id !== "number" || item.id !== editor.id),
    );

    function editorFooter(id: number | "new") {
        const childCount = id === "new" ? 0 : childCountFor(id);

        return (
            <div className="mt-5 flex items-center gap-2.5 border-t border-(--line) pt-4">
                <PrimaryButton type="submit" form="certification-editor" disabled={isSaving}>
                    {isSaving ? "Saving…" : "Save & publish"}
                </PrimaryButton>

                <span className="flex-1" />

                {id !== "new" && (
                    <>
                        <IconButton
                            label="Move certification up"
                            onClick={() => move(id, -1)}
                            disabled={moving || reorderSwap(certifications, id, -1) === null}
                        >
                            <ArrowUp size={16} strokeWidth={2} aria-hidden="true" />
                        </IconButton>

                        <IconButton
                            label="Move certification down"
                            onClick={() => move(id, 1)}
                            disabled={moving || reorderSwap(certifications, id, 1) === null}
                        >
                            <ArrowDown size={16} strokeWidth={2} aria-hidden="true" />
                        </IconButton>

                        <ConfirmDeleteButton
                            onConfirm={() => handleDelete(id)}
                            disabled={deleteMutation.isPending}
                            confirmLabel={
                                childCount > 0
                                    ? `Click again to delete + ${childCount} ${childCount === 1 ? "course" : "courses"}`
                                    : undefined
                            }
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
                title="Certifications"
                description="Shown on the Certificates page."
            />

            <div className="mt-6">
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
                ) : (
                    <div className="rounded-2xl border border-(--glass-border) bg-(--glass-bg) backdrop-blur-xl backdrop-saturate-160">
                        <div className="divide-y divide-(--line)">
                            {openId === "new" && editor !== null && (
                                <AccordionItem
                                    open
                                    title={editor.fields.name || "New certification"}
                                    subtitle={subtitleFor(editor.fields)}
                                    tag={editor.fields.credential}
                                    onToggle={() => toggleEditor("new", emptyFields)}
                                >
                                    <form
                                        id="certification-editor"
                                        onSubmit={handleSubmit}
                                        className="grid gap-x-4 gap-y-3.5 sm:grid-cols-2"
                                    >
                                        <CertificationForm
                                            fields={editor.fields}
                                            parentOptions={parentOptions}
                                            formError={formError}
                                            token={token}
                                            onUnauthorized={onUnauthorized}
                                            onField={setField}
                                        />
                                    </form>

                                    {editorFooter("new")}
                                </AccordionItem>
                            )}

                            {certifications.length === 0 && openId !== "new" && (
                                <p className="px-5 py-4 font-mono text-[10.5px] text-(--graphite)">
                                    No certifications yet.
                                </p>
                            )}

                            {certifications.map((certification) => {
                                const open = openId === certification.id;

                                return (
                                    <AccordionItem
                                        key={certification.id}
                                        open={open}
                                        title={
                                            open
                                                ? editor?.fields.name || certification.name
                                                : certification.name
                                        }
                                        subtitle={
                                            open && editor
                                                ? subtitleFor(editor.fields)
                                                : subtitleFor(certification)
                                        }
                                        tag={
                                            open && editor
                                                ? editor.fields.credential
                                                : certification.credential
                                        }
                                        onToggle={() =>
                                            toggleEditor(certification.id, toFields(certification))
                                        }
                                    >
                                        {open && editor !== null && (
                                            <>
                                                <form
                                                    id="certification-editor"
                                                    onSubmit={handleSubmit}
                                                    className="grid gap-x-4 gap-y-3.5 sm:grid-cols-2"
                                                >
                                                    <CertificationForm
                                                        fields={editor.fields}
                                                        parentOptions={parentOptions}
                                                        formError={formError}
                                                        token={token}
                                                        onUnauthorized={onUnauthorized}
                                                        onField={setField}
                                                    />
                                                </form>

                                                {editorFooter(certification.id)}
                                            </>
                                        )}
                                    </AccordionItem>
                                );
                            })}
                        </div>

                        <AddRowButton onClick={() => openEditor("new", emptyFields)}>
                            Add certification
                        </AddRowButton>
                    </div>
                )}
            </div>
        </div>
    );
}
