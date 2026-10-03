import "react-easy-crop/react-easy-crop.css";

import { useRef, useState } from "react";
import Cropper from "react-easy-crop";
import type { Area } from "react-easy-crop";

import { ApiError, uploadImage } from "@/services/api";
import { useFocusTrap } from "@/components/ui/useFocusTrap";
import { ImagePlaceholder } from "@/components/ui";

const ACCEPTED_TYPES = ["image/webp", "image/jpeg", "image/png", "image/avif"];
const MAX_IMAGE_BYTES = 400 * 1024;
const MAX_INPUT_BYTES = 15 * 1024 * 1024;
const QUALITIES = [0.82, 0.65, 0.5, 0.35, 0.2];

type ImageUploadFieldProps = {
    label: string;
    value: string;
    onChange: (url: string) => void;
    token: string;
    onUnauthorized: () => void;
    aspect: number;
    maxEdge: number;
};

function loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error("Unable to read the image file."));
        image.src = src;
    });
}

function canvasToWebp(canvas: HTMLCanvasElement, quality: number): Promise<Blob | null> {
    return new Promise((resolve) => {
        canvas.toBlob((blob) => resolve(blob), "image/webp", quality);
    });
}

async function cropToWebp(
    image: HTMLImageElement,
    pixels: Area,
    maxEdge: number,
): Promise<Blob> {
    const scale = Math.min(1, maxEdge / Math.max(pixels.width, pixels.height));
    const width = Math.max(1, Math.round(pixels.width * scale));
    const height = Math.max(1, Math.round(pixels.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");

    if (!context) {
        throw new Error("Unable to process the image in this browser.");
    }

    context.drawImage(
        image,
        pixels.x,
        pixels.y,
        pixels.width,
        pixels.height,
        0,
        0,
        width,
        height,
    );

    for (const quality of QUALITIES) {
        const blob = await canvasToWebp(canvas, quality);

        if (blob && blob.size <= MAX_IMAGE_BYTES) {
            return blob;
        }
    }

    throw new Error("The cropped image is still larger than 400 KB.");
}

export function ImageUploadField({
    label,
    value,
    onChange,
    token,
    onUnauthorized,
    aspect,
    maxEdge,
}: ImageUploadFieldProps) {
    const fileRef = useRef<HTMLInputElement>(null);

    const [cropSrc, setCropSrc] = useState<string | null>(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedPixels, setCroppedPixels] = useState<Area | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    const trapRef = useFocusTrap<HTMLDivElement>(cropSrc !== null);

    const dialogOpen = cropSrc !== null;

    function closeDialog() {
        if (cropSrc) {
            URL.revokeObjectURL(cropSrc);
        }

        setCropSrc(null);
        setCroppedPixels(null);
        setCrop({ x: 0, y: 0 });
        setZoom(1);
    }

    function handleDialogKeyDown(event: React.KeyboardEvent) {
        if (event.key === "Escape") {
            event.stopPropagation();
            closeDialog();
        }
    }

    function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];
        event.target.value = "";

        if (!file) {
            return;
        }

        if (!ACCEPTED_TYPES.includes(file.type)) {
            setError("Only WebP, JPEG, PNG, and AVIF files are allowed.");
            return;
        }

        if (file.size > MAX_INPUT_BYTES) {
            setError("That file is too large to process (15 MB limit).");
            return;
        }

        setError(null);
        setCropSrc(URL.createObjectURL(file));
    }

    async function handleSaveCrop() {
        if (!cropSrc || !croppedPixels) {
            return;
        }

        setSaving(true);
        setError(null);

        try {
            const image = await loadImage(cropSrc);
            const blob = await cropToWebp(image, croppedPixels, maxEdge);
            const uploaded = await uploadImage(blob, token);

            onChange(uploaded.url);
            closeDialog();
        } catch (saveError) {
            if (saveError instanceof ApiError && saveError.status === 401) {
                onUnauthorized();
                return;
            }

            setError(saveError instanceof Error ? saveError.message : "Unable to save the image.");
        } finally {
            setSaving(false);
        }
    }

    return (
        <div>
            <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-(--graphite-soft)">
                {label}
            </span>

            {value !== "" && (
                <div className="mt-2 flex items-center gap-3">
                    <img
                        src={value}
                        alt={`${label} preview`}
                        className="h-16 w-16 rounded-xl border border-(--line) object-cover"
                    />

                    <button
                        type="button"
                        onClick={() => fileRef.current?.click()}
                        className="font-mono text-[11px] text-(--graphite) transition-colors duration-150 hover:text-(--accent-strong)"
                    >
                        Replace
                    </button>

                    <button
                        type="button"
                        onClick={() => onChange("")}
                        className="font-mono text-[11px] text-(--graphite) transition-colors duration-150 hover:text-red-500"
                    >
                        Remove
                    </button>
                </div>
            )}

            <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                <input
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                    placeholder="https://… or /api/images/…"
                    className="w-full rounded-lg border border-(--glass-border) bg-white/40 px-3 py-2 text-[13px] text-(--ink) outline-none focus:border-(--accent-strong) dark:bg-black/20"
                />

                <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
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
                    "
                >
                    Upload…
                </button>

                <input
                    ref={fileRef}
                    type="file"
                    accept="image/webp,image/jpeg,image/png,image/avif"
                    onChange={handleFile}
                    className="hidden"
                    aria-label={`Choose ${label} file`}
                />
            </div>

            {value === "" && (
                <div className="mt-2">
                    <ImagePlaceholder className="h-16 w-28 rounded-xl border border-(--line)" />
                </div>
            )}

            {error !== null && (
                <p className="mt-2 font-mono text-[11px] text-red-500">{error}</p>
            )}

            {dialogOpen && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
                    onClick={closeDialog}
                >
                    <div
                        ref={trapRef}
                        role="dialog"
                        aria-modal="true"
                        aria-label={`Crop ${label}`}
                        tabIndex={-1}
                        onClick={(event) => event.stopPropagation()}
                        onKeyDown={handleDialogKeyDown}
                        className="
                            w-full
                            max-w-lg
                            rounded-2xl
                            border
                            border-(--glass-border)
                            bg-(--glass-bg-strong)
                            p-5
                            shadow-2xl
                            backdrop-blur-xl
                        "
                    >
                        <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-(--graphite-soft)">
                            Crop {label}
                        </p>

                        <div className="relative mt-3 h-64 w-full overflow-hidden rounded-xl bg-black/40 sm:h-80">
                            <Cropper
                                image={cropSrc}
                                crop={crop}
                                zoom={zoom}
                                aspect={aspect}
                                onCropChange={setCrop}
                                onCropComplete={(_, pixels) => setCroppedPixels(pixels)}
                                onZoomChange={setZoom}
                                showGrid={false}
                            />
                        </div>

                        <label className="mt-4 block">
                            <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-(--graphite-soft)">
                                Zoom
                            </span>
                            <input
                                type="range"
                                min={1}
                                max={3}
                                step={0.1}
                                value={zoom}
                                onChange={(event) => setZoom(Number(event.target.value))}
                                className="mt-1 w-full"
                            />
                        </label>

                        <div className="mt-4 flex gap-3">
                            <button
                                type="button"
                                onClick={handleSaveCrop}
                                disabled={saving || croppedPixels === null}
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
                                {saving ? "Saving…" : "Save"}
                            </button>

                            <button
                                type="button"
                                onClick={closeDialog}
                                disabled={saving}
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
                                    disabled:opacity-60
                                "
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
