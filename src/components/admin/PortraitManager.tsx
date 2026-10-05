import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import type { PortraitState } from "@/components/hero/HeroPortrait";
import { useUpdateProfile } from "@/hooks/profile/useProfile";
import { isUnauthorized } from "@/services/api";
import {
    getProfile,
    type Profile,
    type PortraitState as PortraitContent,
} from "@/services/profile/profile";
import { useAdminToast } from "./toastContext";
import { AdminCard } from "./AdminCard";
import { Field, FormError, adminFieldInputClassName } from "./AdminFields";
import { ImageUploadField } from "./ImageUploadField";
import { SaveBar } from "./SaveBar";

type PortraitManagerProps = {
    token: string;
    onUnauthorized: () => void;
    onDirtyChange: (dirty: boolean) => void;
};

const PORTRAIT_STATES: { key: PortraitState; label: string }[] = [
    { key: "profile-default", label: "Default" },
    { key: "profile-good-morning", label: "Good morning" },
    { key: "profile-sleep", label: "Sleeping" },
    { key: "profile-awake", label: "Awake" },
];

type PortraitForm = Record<string, { image: string; alt: string }>;

function toForm(portrait: Record<string, PortraitContent>): PortraitForm {
    const form: PortraitForm = {};

    for (const { key } of PORTRAIT_STATES) {
        form[key] = {
            image: portrait[key]?.image ?? "",
            alt: portrait[key]?.alt ?? "",
        };
    }

    return form;
}

export function PortraitManager({ token, onUnauthorized, onDirtyChange }: PortraitManagerProps) {
    const profileQuery = useQuery({
        queryKey: ["profile"],
        queryFn: getProfile,
        retry: 1,
        refetchOnWindowFocus: false,
    });

    const updateMutation = useUpdateProfile(token);
    const notify = useAdminToast();

    const [form, setForm] = useState<PortraitForm | null>(null);
    const [formError, setFormError] = useState<string | null>(null);
    const [syncedProfile, setSyncedProfile] = useState<Profile | null>(null);
    const [touched, setTouched] = useState(false);

    if (profileQuery.data !== undefined && syncedProfile !== profileQuery.data) {
        setSyncedProfile(profileQuery.data);
        setForm(toForm(profileQuery.data.portrait));
        setTouched(false);
        onDirtyChange(false);
    }

    function setDirty(next: boolean) {
        setTouched(next);
        onDirtyChange(next);
    }

    function setStateField(state: PortraitState, field: "image" | "alt", value: string) {
        setForm((current) =>
            current === null
                ? current
                : { ...current, [state]: { ...current[state], [field]: value } },
        );
        setDirty(true);
    }

    function discard() {
        if (profileQuery.data === undefined) {
            return;
        }

        setForm(toForm(profileQuery.data.portrait));
        setFormError(null);
        setDirty(false);
    }

    function commit() {
        if (form === null || profileQuery.data === undefined) {
            return;
        }

        setFormError(null);

        const portrait: Record<string, PortraitContent> = {};

        for (const { key } of PORTRAIT_STATES) {
            portrait[key] = {
                image: form[key].image.trim(),
                alt: form[key].alt.trim(),
            };
        }

        updateMutation.mutate(
            { ...profileQuery.data, portrait },
            {
                onSuccess: () => {
                    setDirty(false);
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
                Portrait
            </h1>

            <p className="mt-1.5 max-w-2xl text-[13.5px] leading-relaxed text-(--graphite)">
                One image per portrait state. Leave a state empty to keep its
                bundled photo.
            </p>

            <div className="mt-5">
                {profileQuery.isPending ? (
                    <p className="font-mono text-[10.5px] text-(--graphite)">
                        Loading portrait...
                    </p>
                ) : profileQuery.isError || form === null ? (
                    <div className="flex items-center gap-3">
                        <p className="font-mono text-[10.5px] text-(--graphite)">
                            Unable to load portrait.
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
                    <div className="space-y-4">
                        {PORTRAIT_STATES.map(({ key, label }) => (
                            <AdminCard key={key} title={label} subtitle="Portrait state">
                                <ImageUploadField
                                    label={label}
                                    value={form[key].image}
                                    onChange={(url) => setStateField(key, "image", url)}
                                    token={token}
                                    onUnauthorized={onUnauthorized}
                                    aspect={1}
                                    maxEdge={900}
                                />

                                <div className="mt-3">
                                    <Field label={`${label} alt text`}>
                                        <input
                                            value={form[key].alt}
                                            onChange={(event) =>
                                                setStateField(key, "alt", event.target.value)
                                            }
                                            placeholder="Portrait of Ivan Harvey Rivera"
                                            className={adminFieldInputClassName}
                                        />
                                    </Field>
                                </div>
                            </AdminCard>
                        ))}

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
