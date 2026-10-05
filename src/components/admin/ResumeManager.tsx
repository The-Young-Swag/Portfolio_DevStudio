import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { useUpdateProfile } from "@/hooks/profile/useProfile";
import { isUnauthorized } from "@/services/api";
import {
    getProfile,
} from "@/services/profile/profile";
import { useAdminToast } from "./toastContext";
import { FormError } from "./AdminFields";
import { SaveBar } from "./SaveBar";
import { PdfUploadField } from "./PdfUploadField";

type ResumeManagerProps = {
    token: string;
    onUnauthorized: () => void;
    onDirtyChange: (dirty: boolean) => void;
};

export function ResumeManager({ token, onUnauthorized, onDirtyChange }: ResumeManagerProps) {
    const profileQuery = useQuery({
        queryKey: ["profile"],
        queryFn: getProfile,
        retry: 1,
        refetchOnWindowFocus: false,
    });

    const updateMutation = useUpdateProfile(token);
    const notify = useAdminToast();

    const [resume, setResume] = useState("");
    const [formError, setFormError] = useState<string | null>(null);
    const [loaded, setLoaded] = useState(false);
    const [touched, setTouched] = useState(false);

    if (profileQuery.data !== undefined && !loaded) {
        setLoaded(true);
        setResume(profileQuery.data.resume ?? "");
    }

    function handleChange(url: string) {
        setResume(url);
        setTouched(true);
        onDirtyChange(true);
    }

    function discard() {
        if (profileQuery.data === undefined) {
            return;
        }

        setResume(profileQuery.data.resume ?? "");
        setFormError(null);
        setTouched(false);
        onDirtyChange(false);
    }

    function commit() {
        if (!loaded || profileQuery.data === undefined) {
            return;
        }

        setFormError(null);

        updateMutation.mutate(
            { ...profileQuery.data, resume },
            {
                onSuccess: () => {
                    setTouched(false);
                    onDirtyChange(false);
                    notify("Saved and live on your site");
                },
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
        <div>
            <h1 className="font-display text-[26px] font-medium tracking-tight text-(--ink)">
                Resume
            </h1>

            <p className="mt-1.5 max-w-2xl text-[13.5px] leading-relaxed text-(--graphite)">
                Upload a PDF or paste a link. Clearing the field hides the
                Resume button on the public site.
            </p>

            <div className="mt-5">
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
                    <div
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

                        {formError !== null && <FormError message={formError} />}
                    </div>
                )}
            </div>

            <SaveBar
                open={touched}
                saving={updateMutation.isPending}
                onSave={commit}
                onDiscard={discard}
            />
        </div>
    );
}
