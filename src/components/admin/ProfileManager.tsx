import { useState } from "react";
import type { FormEvent } from "react";
import { useQuery } from "@tanstack/react-query";

import { useUpdateProfile } from "@/hooks/profile/useProfile";
import { isUnauthorized } from "@/services/api";
import {
    getProfile,
    type Profile,
    type ProfileInput,
} from "@/services/profile/profile";

type ProfileManagerProps = {
    token: string;
    onUnauthorized: () => void;
};

type ProfileFormFields = {
    name: string;
    headline: string;
    location: string;
    availability: string;
    description: string;
    github: string;
    linkedin: string;
    email: string;
    contact_heading: string;
    contact_title: string;
    contact_intro: string;
    contact_email_label: string;
    footer_note: string;
};

const fieldClassName =
    "mt-1 w-full rounded-lg border border-(--glass-border) bg-white/40 px-3 py-2 text-[13px] text-(--ink) outline-none focus:border-(--accent-strong) dark:bg-black/20";

const labelClassName =
    "font-mono text-[10px] uppercase tracking-[0.12em] text-(--graphite-soft)";

function toFields(profile: Profile): ProfileFormFields {
    return {
        name: profile.name,
        headline: profile.headline,
        location: profile.location,
        availability: profile.availability,
        description: profile.description,
        github: profile.github,
        linkedin: profile.linkedin,
        email: profile.email,
        contact_heading: profile.contact_heading ?? "",
        contact_title: profile.contact_title ?? "",
        contact_intro: profile.contact_intro ?? "",
        contact_email_label: profile.contact_email_label ?? "",
        footer_note: profile.footer_note ?? "",
    };
}

function toInput(fields: ProfileFormFields, current: Profile): ProfileInput {
    return {
        name: fields.name.trim(),
        headline: fields.headline.trim(),
        location: fields.location.trim(),
        availability: fields.availability.trim(),
        description: fields.description.trim(),
        github: fields.github.trim(),
        linkedin: fields.linkedin.trim(),
        email: fields.email.trim(),
        resume: current.resume ?? "",
        portrait: current.portrait,
        hero_stats: current.hero_stats,
        also_true: current.also_true,
        contact_heading: fields.contact_heading.trim(),
        contact_title: fields.contact_title.trim(),
        contact_intro: fields.contact_intro.trim(),
        contact_email_label: fields.contact_email_label.trim(),
        footer_note: fields.footer_note.trim(),
    };
}

export function ProfileManager({ token, onUnauthorized }: ProfileManagerProps) {
    const profileQuery = useQuery({
        queryKey: ["profile"],
        queryFn: getProfile,
        retry: 1,
        refetchOnWindowFocus: false,
    });

    const updateMutation = useUpdateProfile(token);

    const [fields, setFields] = useState<ProfileFormFields | null>(null);
    const [formError, setFormError] = useState<string | null>(null);
    const [saved, setSaved] = useState(false);
    const [syncedProfile, setSyncedProfile] = useState<Profile | null>(null);

    if (profileQuery.data !== undefined && syncedProfile !== profileQuery.data) {
        setSyncedProfile(profileQuery.data);
        setFields(toFields(profileQuery.data));
    }

    function setField(name: keyof ProfileFormFields, value: string) {
        setSaved(false);
        setFields((current) => (current === null ? current : { ...current, [name]: value }));
    }

    function handleSubmit(event: FormEvent) {
        event.preventDefault();

        if (fields === null || profileQuery.data === undefined) {
            return;
        }

        setFormError(null);
        setSaved(false);

        updateMutation.mutate(toInput(fields, profileQuery.data), {
            onSuccess: () => setSaved(true),
            onError: (error: unknown) => {
                if (isUnauthorized(error)) {
                    onUnauthorized();
                    return;
                }

                setFormError(error instanceof Error ? error.message : "Something went wrong.");
            },
        });
    }

    return (
        <section aria-label="Profile">
            <div className="mt-8 flex items-baseline justify-between">
                <h2 className="font-display text-[20px] font-medium text-(--ink)">
                    Profile
                </h2>
            </div>

            <div className="mt-4">
                {profileQuery.isPending ? (
                    <p className="font-mono text-[10.5px] text-(--graphite)">
                        Loading profile...
                    </p>
                ) : profileQuery.isError || fields === null ? (
                    <div className="flex items-center gap-3">
                        <p className="font-mono text-[10.5px] text-(--graphite)">
                            Unable to load profile.
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
                        <div className="grid gap-3 sm:grid-cols-2">
                            <label className="block">
                                <span className={labelClassName}>Name</span>
                                <input
                                    value={fields.name}
                                    onChange={(event) => setField("name", event.target.value)}
                                    className={fieldClassName}
                                />
                            </label>

                            <label className="block">
                                <span className={labelClassName}>Headline</span>
                                <input
                                    value={fields.headline}
                                    onChange={(event) => setField("headline", event.target.value)}
                                    className={fieldClassName}
                                />
                            </label>

                            <label className="block">
                                <span className={labelClassName}>Location</span>
                                <input
                                    value={fields.location}
                                    onChange={(event) => setField("location", event.target.value)}
                                    className={fieldClassName}
                                />
                            </label>

                            <label className="block">
                                <span className={labelClassName}>Availability</span>
                                <input
                                    value={fields.availability}
                                    onChange={(event) => setField("availability", event.target.value)}
                                    className={fieldClassName}
                                />
                            </label>

                            <label className="block">
                                <span className={labelClassName}>GitHub URL</span>
                                <input
                                    value={fields.github}
                                    onChange={(event) => setField("github", event.target.value)}
                                    className={fieldClassName}
                                />
                            </label>

                            <label className="block">
                                <span className={labelClassName}>LinkedIn URL</span>
                                <input
                                    value={fields.linkedin}
                                    onChange={(event) => setField("linkedin", event.target.value)}
                                    className={fieldClassName}
                                />
                            </label>

                            <label className="block">
                                <span className={labelClassName}>Email</span>
                                <input
                                    value={fields.email}
                                    onChange={(event) => setField("email", event.target.value)}
                                    className={fieldClassName}
                                />
                            </label>
                        </div>

                        <label className="block">
                            <span className={labelClassName}>Description</span>
                            <textarea
                                value={fields.description}
                                onChange={(event) => setField("description", event.target.value)}
                                rows={3}
                                className={fieldClassName}
                            />
                        </label>

                        <div className="grid gap-3 sm:grid-cols-2">
                            <label className="block">
                                <span className={labelClassName}>Contact heading</span>
                                <input
                                    value={fields.contact_heading}
                                    onChange={(event) => setField("contact_heading", event.target.value)}
                                    className={fieldClassName}
                                />
                            </label>

                            <label className="block">
                                <span className={labelClassName}>Contact email button label</span>
                                <input
                                    value={fields.contact_email_label}
                                    onChange={(event) => setField("contact_email_label", event.target.value)}
                                    className={fieldClassName}
                                />
                            </label>
                        </div>

                        <label className="block">
                            <span className={labelClassName}>Contact title</span>
                            <input
                                value={fields.contact_title}
                                onChange={(event) => setField("contact_title", event.target.value)}
                                className={fieldClassName}
                            />
                        </label>

                        <label className="block">
                            <span className={labelClassName}>Contact intro</span>
                            <textarea
                                value={fields.contact_intro}
                                onChange={(event) => setField("contact_intro", event.target.value)}
                                rows={3}
                                className={fieldClassName}
                            />
                        </label>

                        <label className="block">
                            <span className={labelClassName}>Footer note</span>
                            <input
                                value={fields.footer_note}
                                onChange={(event) => setField("footer_note", event.target.value)}
                                className={fieldClassName}
                            />
                        </label>

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
