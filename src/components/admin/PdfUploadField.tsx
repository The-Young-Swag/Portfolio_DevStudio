import { useRef, useState } from "react";

import { ApiError, uploadFile, type UploadedFile } from "@/services/api";

const MAX_PDF_BYTES = 2 * 1024 * 1024;

type PdfUploadFieldProps = {
    label: string;
    value: string;
    onChange: (url: string) => void;
    token: string;
    onUnauthorized: () => void;
    defaultFilename: string;
};

function formatKilobytes(size: number): string {
    return `${Math.max(1, Math.round(size / 1024))} KB`;
}

export function PdfUploadField({
    label,
    value,
    onChange,
    token,
    onUnauthorized,
    defaultFilename,
}: PdfUploadFieldProps) {
    const fileRef = useRef<HTMLInputElement>(null);

    const [uploaded, setUploaded] = useState<UploadedFile | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);

    const shownFilename = uploaded && uploaded.url === value ? uploaded.filename : null;

    async function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];
        event.target.value = "";

        if (!file) {
            return;
        }

        const looksLikePdf =
            file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");

        if (!looksLikePdf) {
            setError("Only PDF files are allowed.");
            return;
        }

        if (file.size === 0 || file.size > MAX_PDF_BYTES) {
            setError("The PDF must be non-empty and 2 MB or smaller.");
            return;
        }

        setError(null);
        setUploading(true);

        try {
            const result = await uploadFile(file, defaultFilename, token);
            setUploaded(result);
            onChange(result.url);
        } catch (uploadError) {
            if (uploadError instanceof ApiError && uploadError.status === 401) {
                onUnauthorized();
                return;
            }

            setError(
                uploadError instanceof Error ? uploadError.message : "Unable to upload the PDF.",
            );
        } finally {
            setUploading(false);
        }
    }

    return (
        <div>
            <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-(--graphite-soft)">
                {label}
            </span>

            {value !== "" && (
                <div className="mt-2 flex flex-wrap items-center gap-3">
                    <p className="max-w-full truncate font-mono text-[11px] text-(--graphite)">
                        {shownFilename !== null
                            ? `${shownFilename} (${formatKilobytes(uploaded?.size ?? 0)})`
                            : value}
                    </p>

                    <a
                        href={value}
                        target="_blank"
                        rel="noreferrer"
                        className="font-mono text-[11px] text-(--accent-strong) hover:underline"
                    >
                        View
                    </a>

                    <button
                        type="button"
                        onClick={() => fileRef.current?.click()}
                        className="font-mono text-[11px] text-(--graphite) transition-colors duration-150 hover:text-(--accent-strong)"
                    >
                        Replace
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            setUploaded(null);
                            onChange("");
                        }}
                        className="font-mono text-[11px] text-(--graphite) transition-colors duration-150 hover:text-red-500"
                    >
                        Remove
                    </button>
                </div>
            )}

            <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                <input
                    value={value}
                    aria-label={`${label} URL`}
                    onChange={(event) => onChange(event.target.value)}
                    placeholder="https://… or /api/files/…"
                    className="w-full rounded-lg border border-(--glass-border) bg-white/40 px-3 py-2 text-[13px] text-(--ink) outline-none focus:border-(--accent-strong) dark:bg-black/20"
                />

                <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                    className="
                        shrink-0
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
                        disabled:opacity-60
                    "
                >
                    {uploading ? "Uploading…" : "Upload PDF…"}
                </button>

                <input
                    ref={fileRef}
                    type="file"
                    accept="application/pdf,.pdf"
                    onChange={handleFile}
                    className="hidden"
                    aria-label={`Choose ${label} PDF file`}
                />
            </div>

            {error !== null && (
                <p className="mt-2 font-mono text-[11px] text-red-500">{error}</p>
            )}
        </div>
    );
}
