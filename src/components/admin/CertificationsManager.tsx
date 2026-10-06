import { useEffect, useRef, useState } from "react";
import type { FormEvent, PropsWithChildren } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, Pencil, Plus } from "lucide-react";

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
import { ContentImage } from "@/components/ui";
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

function FormSubhead({ children }: PropsWithChildren) {
    return (
        <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.12em] text-(--graphite-soft) sm:col-span-2">
            {children}
        </p>
    );
}

function CertificationForm({
    fields,
    formError,
    token,
    onUnauthorized,
    onField,
}: {
    fields: CertificationFormFields;
    formError: string | null;
    token: string;
    onUnauthorized: () => void;
    onField: (name: keyof CertificationFormFields, value: string) => void;
}) {
    return (
        <>
            <FormSubhead>Details</FormSubhead>

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

            <FormSubhead>Cover image and files</FormSubhead>

            <div className="sm:col-span-2">
                <ImageUploadField
                    label="Certificate image"
                    value={fields.image}
                    onChange={(url) => onField("image", url)}
                    token={token}
                    onUnauthorized={onUnauthorized}
                    aspect={21 / 9}
                    maxEdge={1280}
                    crop={false}
                />

                <p className="mt-1 text-[12px] leading-relaxed text-(--graphite-soft)">
                    Shown on the card. Without one, the PDF below is used instead.
                </p>
            </div>

            <div className="sm:col-span-2">
                <PdfUploadField
                    label="Certificate PDF"
                    value={fields.pdf}
                    onChange={(url) => onField("pdf", url)}
                    token={token}
                    onUnauthorized={onUnauthorized}
                    defaultFilename="certificate.pdf"
                />

                <p className="mt-1 text-[12px] leading-relaxed text-(--graphite-soft)">
                    Previewed on the detail page, plus a download button.
                </p>
            </div>

            <FormSubhead>Links</FormSubhead>

            <Field label="Verify link" wide>
                <input
                    value={fields.link}
                    onChange={(event) => onField("link", event.target.value)}
                    placeholder="https://…"
                    className={adminFieldInputClassName}
                />
            </Field>

            <ImageUploadField
                label="Badge image"
                value={fields.badge_image}
                onChange={(url) => onField("badge_image", url)}
                token={token}
                onUnauthorized={onUnauthorized}
                aspect={1}
                maxEdge={512}
                crop={false}
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
    const [courseTitle, setCourseTitle] = useState("");
    const [courseLink, setCourseLink] = useState("");
    const [courseError, setCourseError] = useState<string | null>(null);

    const certifications = certificationsQuery.data ?? [];
    const listed = certifications.filter(
        (certification) =>
            certification.parent_id === null ||
            !certifications.some((parent) => parent.id === certification.parent_id),
    );

    function setDirty(next: boolean) {
        setTouched(next);
        onDirtyChange(next);
    }

    function resetCourseForm() {
        setCourseTitle("");
        setCourseLink("");
        setCourseError(null);
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
        resetCourseForm();
        setDirty(false);
    }

    function toggleEditor(id: number | "new", fields: CertificationFormFields) {
        if (editor !== null && editor.id === id) {
            if (touched && !window.confirm("Discard unsaved changes?")) {
                return;
            }

            setEditor(null);
            setFormError(null);
            resetCourseForm();
            setDirty(false);
            return;
        }

        openEditor(id, fields);
    }

    function closeEditor() {
        setEditor(null);
        setFormError(null);
        resetCourseForm();
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

    function addCourse(parentId: number) {
        if (courseTitle.trim() === "") {
            setCourseError("Give the course a title first.");
            return;
        }

        setCourseError(null);
        const siblings = certifications.filter((item) => item.parent_id === parentId);
        const nextSortOrder =
            siblings.length === 0
                ? 0
                : Math.max(...siblings.map((item) => item.sort_order)) + 1;

        createMutation.mutate(
            {
                name: courseTitle.trim(),
                issuer: "",
                year: "",
                credential: "",
                badge: "",
                code: "",
                accent: "blue",
                image: "",
                link: courseLink.trim(),
                parent_id: parentId,
                pdf: "",
                badge_image: "",
                badge_link: "",
                sort_order: nextSortOrder,
            },
            {
                onSuccess: () => {
                    resetCourseForm();
                    notify("Saved and live on your site");
                },
                onError: (error: unknown) => {
                    if (isUnauthorized(error)) {
                        onUnauthorized();
                        return;
                    }

                    setCourseError(
                        error instanceof Error ? error.message : "Something went wrong.",
                    );
                },
            },
        );
    }

    async function move(id: number, direction: -1 | 1) {
        const swap = reorderSwap(listed, id, direction);

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
    const openItem =
        typeof openId === "number"
            ? (certifications.find((item) => item.id === openId) ?? null)
            : null;
    const openParentName =
        openItem?.parent_id === null || openItem?.parent_id === undefined
            ? null
            : (certifications.find((item) => item.id === openItem.parent_id)?.name ?? null);
    // A child course has no row of its own in the list below, so its
    // editor renders in a dedicated slot at the top instead of nowhere.
    const isOrphanOpen =
        editor !== null && openItem !== null && !listed.some((item) => item.id === openId);
    const orphanRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (isOrphanOpen) {
            orphanRef.current?.scrollIntoView({ block: "nearest" });
        }
    }, [isOrphanOpen]);

    function editorFooter(id: number | "new") {
        const childCount = id === "new" ? 0 : childCountFor(id);
        const reorderable = id !== "new" && listed.some((item) => item.id === id);

        return (
            <div className="mt-5 flex items-center gap-2.5 border-t border-(--line) pt-4">
                <PrimaryButton type="submit" form="certification-editor" disabled={isSaving}>
                    {isSaving ? "Saving…" : "Save & publish"}
                </PrimaryButton>

                <span className="flex-1" />

                {reorderable && (
                    <>
                        <IconButton
                            label="Move certification up"
                            onClick={() => move(id, -1)}
                            disabled={moving || reorderSwap(listed, id, -1) === null}
                        >
                            <ArrowUp size={16} strokeWidth={2} aria-hidden="true" />
                        </IconButton>

                        <IconButton
                            label="Move certification down"
                            onClick={() => move(id, 1)}
                            disabled={moving || reorderSwap(listed, id, 1) === null}
                        >
                            <ArrowDown size={16} strokeWidth={2} aria-hidden="true" />
                        </IconButton>
                    </>
                )}

                {id !== "new" && (
                    <ConfirmDeleteButton
                        onConfirm={() => handleDelete(id)}
                        disabled={deleteMutation.isPending}
                        confirmLabel={
                            childCount > 0
                                ? `Click again to delete + ${childCount} ${childCount === 1 ? "course" : "courses"}`
                                : undefined
                        }
                    />
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

    function coursesSection(parentId: number) {
        const courses = certifications.filter((item) => item.parent_id === parentId);

        return (
            <div className="sm:col-span-2">
                <FormSubhead>Included courses</FormSubhead>

                {courses.length > 0 && (
                    <ul className="mt-2 divide-y divide-(--line) rounded-xl border border-(--line)">
                        {courses.map((course) => (
                            <li
                                key={course.id}
                                className="flex items-center gap-2 px-3 py-2"
                            >
                                {course.badge_image !== "" && (
                                    <ContentImage
                                        src={course.badge_image}
                                        alt=""
                                        imageClassName="h-8 w-8 shrink-0 rounded-lg border border-(--line) object-cover"
                                        placeholderClassName="h-8 w-8 shrink-0 rounded-lg border border-(--line)"
                                    />
                                )}

                                <span className="min-w-0 flex-1 truncate text-[13.5px] text-(--ink)">
                                    {course.name}
                                </span>

                                {course.link !== "" && (
                                    <a
                                        href={course.link}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="shrink-0 font-mono text-[11px] text-(--accent-strong) hover:underline"
                                    >
                                        Verify ↗
                                    </a>
                                )}

                                <IconButton
                                    label={`Edit ${course.name}`}
                                    onClick={() => openEditor(course.id, toFields(course))}
                                >
                                    <Pencil size={14} strokeWidth={2} aria-hidden="true" />
                                </IconButton>

                                <ConfirmDeleteButton
                                    onConfirm={() => handleDelete(course.id)}
                                    disabled={deleteMutation.isPending}
                                    small
                                />
                            </li>
                        ))}
                    </ul>
                )}

                <div className="mt-2 flex flex-wrap gap-2">
                    <input
                        value={courseTitle}
                        onChange={(event) => setCourseTitle(event.target.value)}
                        placeholder="Course title"
                        aria-label="New course title"
                        className={`${adminFieldInputClassName} min-w-36 flex-[2]`}
                    />

                    <input
                        value={courseLink}
                        onChange={(event) => setCourseLink(event.target.value)}
                        placeholder="Verify link (optional)"
                        aria-label="New course verify link"
                        className={`${adminFieldInputClassName} min-w-36 flex-[2]`}
                    />

                    <button
                        type="button"
                        onClick={() => addCourse(parentId)}
                        disabled={createMutation.isPending}
                        className="
                            inline-flex
                            items-center
                            gap-1.5
                            rounded-lg
                            border
                            border-(--accent-strong)
                            bg-(--accent-strong)
                            px-3
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
                        <Plus size={14} strokeWidth={2} aria-hidden="true" />
                        {createMutation.isPending ? "Adding…" : "Add"}
                    </button>
                </div>

                {courseError !== null && (
                    <p className="mt-1.5 font-mono text-[11px] text-red-500">{courseError}</p>
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
                                            formError={formError}
                                            token={token}
                                            onUnauthorized={onUnauthorized}
                                            onField={setField}
                                        />
                                    </form>

                                    {editorFooter("new")}
                                </AccordionItem>
                            )}

                            {listed.length === 0 && openId !== "new" && !isOrphanOpen && (
                                <p className="px-5 py-4 font-mono text-[10.5px] text-(--graphite)">
                                    No certifications yet.
                                </p>
                            )}

                            {isOrphanOpen && editor !== null && openItem !== null && (
                                <div ref={orphanRef}>
                                    <AccordionItem
                                        open
                                        title={editor.fields.name || openItem.name}
                                        subtitle={subtitleFor(editor.fields)}
                                        tag={editor.fields.credential}
                                        onToggle={() =>
                                            toggleEditor(openItem.id, toFields(openItem))
                                        }
                                    >
                                        <form
                                            id="certification-editor"
                                            onSubmit={handleSubmit}
                                            className="grid gap-x-4 gap-y-3.5 sm:grid-cols-2"
                                        >
                                            <CertificationForm
                                                fields={editor.fields}
                                                formError={formError}
                                                token={token}
                                                onUnauthorized={onUnauthorized}
                                                onField={setField}
                                            />

                                            {openParentName !== null && (
                                                <p className="text-[12px] leading-relaxed text-(--graphite-soft) sm:col-span-2">
                                                    Part of {openParentName}. Courses group
                                                    here automatically.
                                                </p>
                                            )}
                                        </form>

                                        {editorFooter(openItem.id)}
                                    </AccordionItem>
                                </div>
                            )}

                            {listed.map((certification) => {
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
                                                        formError={formError}
                                                        token={token}
                                                        onUnauthorized={onUnauthorized}
                                                        onField={setField}
                                                    />

                                                    {openParentName !== null && (
                                                        <p className="text-[12px] leading-relaxed text-(--graphite-soft) sm:col-span-2">
                                                            Part of {openParentName}. Courses group
                                                            here automatically.
                                                        </p>
                                                    )}

                                                    {typeof editor.id === "number" &&
                                                        openItem?.parent_id === null &&
                                                        coursesSection(editor.id)}
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
