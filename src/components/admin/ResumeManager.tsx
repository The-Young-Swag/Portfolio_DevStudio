import { useState } from "react";
import type { FormEvent } from "react";
import { useQuery } from "@tanstack/react-query";

import { useUpdateProfile } from "@/hooks/profile/useProfile";
import { isUnauthorized } from "@/services/api";
import {
    getProfile,
} from "@/services/profile/profile";
import { PdfUploadField } from "./PdfUploadField";

type ResumeManagerProps = {
    token: string;
    onUnauthorized: () => void;
};

export function ResumeManager({ token, onUnauthorized }: ResumeManagerProps) {
    const profileQuery = useQuery({
        queryKey: ["profile"],
        queryFn: getProfile,
        retry: 1,
        refetchOnWindowFocus: false,
    });

    const updateMutation = useUpdateProfile(token);

    const [resume, setResume] = useState("");
    const [formError, setFormError] = useState<string | null>(null);
    const [saved, setSaved] = useState(false);
    const [loaded, setLoaded] = useState(false);

    if (profileQuery.data !== undefined && !loaded) {
        setLoaded(true);
        setResume(profileQuery.data.resume ?? "");
    }

    function handleChange(url: string) {
        setSaved(false);
        setResume(url);
    }

    function handleSubmit(event: FormEvent) {
        event.preventDefault();

        if (!loaded || profileQuery.data === undefined) {
            return;
        }

        setFormError(null);
        setSaved(false);

        updateMutation.mutate(
            { ...profileQuery.data, resume },
            {
                onSuccess: () => setSaved(true),
                onError: (error: unknown) => {
                    if (isUnauthorized(error)) {
                        onUnauthorized();
                        return;
                    }

                    setFormError(error instanceof Error ? error.message : "Something went wrong.");
                },
            },
        );
    }

    return (
        <section aria-label="Resume">
            <div className="mt-8 flex items-baseline justify-between">
                <h2 className="font-display text-[20px] font-medium text-(--ink)">
                    Resume
                </h2>
            </div>

            <p className="mt-2 max-w-2xl font-mono text-[10.5px] leading-relaxed text-(--graphite)">
                Upload a PDF or paste a link. Clearing the field hides the
                Resume button on the public site.
            </p>

            <div className="mt-4">
                {profileQuery.isPending ? (
                    <p className="font-mono text-[10.5px] text-(--graphite)">
                        Loading resume...
                    </p>
                ) : profileQuery.isError || !loaded ? (
                    <div className="flex items-center gap-3">
                        <p className="font-mono text-[10.5px] text-(--graphite)">
                            Unable to load resume.
                        </p>
                        <button
                            type="button"
                            onClick={() => profileQuery.refetch()}
                            className="font-mono text-[11px] text-(--accent-strong) hover:underline"
                        >
                            Retry
                        </button>
                    </div>
                ) : (
                    <form
                        onSubmit={handleSubmit}
                        className="
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
                        <PdfUploadField
                            label="Resume PDF"
                            value={resume}
                            onChange={handleChange}
                            token={token}
                            onUnauthorized={onUnauthorized}
                            defaultFilename="resume.pdf"
                        />

                        {formError !== null && (
                            <p className="font-mono text-[11px] text-red-500">{formError}</p>
                        )}

                        {saved && (
                            <p className="font-mono text-[11px] text-(--accent-strong)">
                                Saved.
                            </p>
                        )}

                        <div>
                            <button
                                type="submit"
                                disabled={updateMutation.isPending}
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
                                {updateMutation.isPending ? "Saving..." : "Save"}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </section>
    );
}
