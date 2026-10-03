import { useState } from "react";
import type { FormEvent } from "react";
import { useQuery } from "@tanstack/react-query";

import type { PortraitState } from "@/components/hero/HeroPortrait";
import { useUpdateProfile } from "@/hooks/profile/useProfile";
import { ApiError } from "@/services/api";
import {
    getProfile,
    type Profile,
    type PortraitState as PortraitContent,
} from "@/services/profile/profile";
import { ImageUploadField } from "./ImageUploadField";

type PortraitManagerProps = {
    token: string;
    onUnauthorized: () => void;
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

export function PortraitManager({ token, onUnauthorized }: PortraitManagerProps) {
    const profileQuery = useQuery({
        queryKey: ["profile"],
        queryFn: getProfile,
        retry: 1,
        refetchOnWindowFocus: false,
    });

    const updateMutation = useUpdateProfile(token);

    const [form, setForm] = useState<PortraitForm | null>(null);
    const [formError, setFormError] = useState<string | null>(null);
    const [saved, setSaved] = useState(false);
    const [syncedProfile, setSyncedProfile] = useState<Profile | null>(null);

    if (profileQuery.data !== undefined && syncedProfile !== profileQuery.data) {
        setSyncedProfile(profileQuery.data);
        setForm(toForm(profileQuery.data.portrait));
    }

    function setStateField(state: PortraitState, field: "image" | "alt", value: string) {
        setSaved(false);
        setForm((current) =>
            current === null
                ? current
                : { ...current, [state]: { ...current[state], [field]: value } },
        );
    }

    function handleSubmit(event: FormEvent) {
        event.preventDefault();

        if (form === null || profileQuery.data === undefined) {
            return;
        }

        setFormError(null);
        setSaved(false);

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
                onSuccess: () => setSaved(true),
                onError: (error: unknown) => {
                    if (error instanceof ApiError && error.status === 401) {
                        onUnauthorized();
                        return;
                    }

                    setFormError(error instanceof Error ? error.message : "Something went wrong.");
                },
            },
        );
    }

    return (
        <section aria-label="Portrait">
            <div className="mt-8 flex items-baseline justify-between">
                <h2 className="font-display text-[20px] font-medium text-(--ink)">
                    Portrait
                </h2>
            </div>

            <p className="mt-2 max-w-2xl font-mono text-[10.5px] leading-relaxed text-(--graphite)">
                One image per portrait state. Leave a state empty to keep its
                bundled photo.
            </p>

            <div className="mt-4">
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
                    <form
                        onSubmit={handleSubmit}
                        className="
                            space-y-5
                            rounded-2xl
                            border
                            border-(--glass-border)
                            bg-(--glass-bg)
                            p-5
                            backdrop-blur-xl
                            backdrop-saturate-160
                        "
                    >
                        {PORTRAIT_STATES.map(({ key, label }) => (
                            <div key={key}>
                                <ImageUploadField
                                    label={label}
                                    value={form[key].image}
                                    onChange={(url) => setStateField(key, "image", url)}
                                    token={token}
                                    onUnauthorized={onUnauthorized}
                                    aspect={1}
                                    maxEdge={900}
                                />

                                <label className="mt-2 block">
                                    <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-(--graphite-soft)">
                                        {label} alt text
                                    </span>
                                    <input
                                        value={form[key].alt}
                                        onChange={(event) =>
                                            setStateField(key, "alt", event.target.value)
                                        }
                                        placeholder="Portrait of Ivan Harvey Rivera"
                                        className="mt-1 w-full rounded-lg border border-(--glass-border) bg-white/40 px-3 py-2 text-[13px] text-(--ink) outline-none focus:border-(--accent-strong) dark:bg-black/20"
                                    />
                                </label>
                            </div>
                        ))}

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
