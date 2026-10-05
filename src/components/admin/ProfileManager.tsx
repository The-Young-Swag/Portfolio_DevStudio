import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { useUpdateProfile } from "@/hooks/profile/useProfile";
import { isUnauthorized } from "@/services/api";
import {
    getProfile,
    type Profile,
    type ProfileInput,
} from "@/services/profile/profile";
import { useAdminToast } from "./toastContext";
import { AdminCard } from "./AdminCard";
import { Field, FormError, adminFieldInputClassName } from "./AdminFields";
import { SaveBar } from "./SaveBar";

type ProfileManagerProps = {
    token: string;
    onUnauthorized: () => void;
    onDirtyChange: (dirty: boolean) => void;
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

export function ProfileManager({ token, onUnauthorized, onDirtyChange }: ProfileManagerProps) {
    const profileQuery = useQuery({
        queryKey: ["profile"],
        queryFn: getProfile,
        retry: 1,
        refetchOnWindowFocus: false,
    });

    const updateMutation = useUpdateProfile(token);
    const notify = useAdminToast();

    const [fields, setFields] = useState<ProfileFormFields | null>(null);
    const [formError, setFormError] = useState<string | null>(null);
    const [syncedProfile, setSyncedProfile] = useState<Profile | null>(null);
    const [touched, setTouched] = useState(false);

    if (profileQuery.data !== undefined && syncedProfile !== profileQuery.data) {
        setSyncedProfile(profileQuery.data);
        setFields(toFields(profileQuery.data));
        setTouched(false);
        onDirtyChange(false);
    }

    function setDirty(next: boolean) {
        setTouched(next);
        onDirtyChange(next);
    }

    function setField(name: keyof ProfileFormFields, value: string) {
        setFields((current) => (current === null ? current : { ...current, [name]: value }));
        setDirty(true);
    }

    function discard() {
        if (profileQuery.data === undefined) {
            return;
        }

        setFields(toFields(profileQuery.data));
        setFormError(null);
        setDirty(false);
    }

    function commit() {
        if (fields === null || profileQuery.data === undefined) {
            return;
        }

        setFormError(null);

        updateMutation.mutate(toInput(fields, profileQuery.data), {
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
        });
    }

    return (
        <div>
            <h1 className="font-display text-[26px] font-medium tracking-tight text-(--ink)">
                Profile
            </h1>

            <p className="mt-1.5 max-w-2xl text-[13.5px] leading-relaxed text-(--graphite)">
                Who you are, shown at the top of the home page and in the footer.
            </p>

            <div className="mt-5">
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
                    <div className="space-y-4">
                        <AdminCard title="Basics" subtitle="Name, headline and where you are">
                            <div className="grid gap-3 sm:grid-cols-2">
                                <Field label="Name">
                                    <input
                                        value={fields.name}
                                        onChange={(event) => setField("name", event.target.value)}
                                        className={adminFieldInputClassName}
                                    />
                                </Field>

                                <Field label="Headline">
                                    <input
                                        value={fields.headline}
                                        onChange={(event) => setField("headline", event.target.value)}
                                        className={adminFieldInputClassName}
                                    />
                                </Field>

                                <Field label="Location">
                                    <input
                                        value={fields.location}
                                        onChange={(event) => setField("location", event.target.value)}
                                        className={adminFieldInputClassName}
                                    />
                                </Field>

                                <Field label="Availability">
                                    <input
                                        value={fields.availability}
                                        onChange={(event) => setField("availability", event.target.value)}
                                        className={adminFieldInputClassName}
                                    />
                                </Field>
                            </div>
                        </AdminCard>

                        <AdminCard title="About" subtitle="Your intro paragraph">
                            <Field label="Description" wide>
                                <textarea
                                    value={fields.description}
                                    onChange={(event) => setField("description", event.target.value)}
                                    rows={3}
                                    className={adminFieldInputClassName}
                                />
                            </Field>
                        </AdminCard>

                        <AdminCard title="Links" subtitle="Where people can find you" defaultOpen={false}>
                            <div className="grid gap-3 sm:grid-cols-2">
                                <Field label="GitHub URL">
                                    <input
                                        value={fields.github}
                                        onChange={(event) => setField("github", event.target.value)}
                                        className={adminFieldInputClassName}
                                    />
                                </Field>

                                <Field label="LinkedIn URL">
                                    <input
                                        value={fields.linkedin}
                                        onChange={(event) => setField("linkedin", event.target.value)}
                                        className={adminFieldInputClassName}
                                    />
                                </Field>

                                <Field label="Email">
                                    <input
                                        value={fields.email}
                                        onChange={(event) => setField("email", event.target.value)}
                                        className={adminFieldInputClassName}
                                    />
                                </Field>
                            </div>
                        </AdminCard>

                        <AdminCard title="Contact section" subtitle="Heading and button on the contact block" defaultOpen={false}>
                            <div className="grid gap-3 sm:grid-cols-2">
                                <Field label="Contact heading">
                                    <input
                                        value={fields.contact_heading}
                                        onChange={(event) => setField("contact_heading", event.target.value)}
                                        className={adminFieldInputClassName}
                                    />
                                </Field>

                                <Field label="Contact email button label">
                                    <input
                                        value={fields.contact_email_label}
                                        onChange={(event) => setField("contact_email_label", event.target.value)}
                                        className={adminFieldInputClassName}
                                    />
                                </Field>
                            </div>

                            <div className="mt-3">
                                <Field label="Contact title" wide>
                                    <input
                                        value={fields.contact_title}
                                        onChange={(event) => setField("contact_title", event.target.value)}
                                        className={adminFieldInputClassName}
                                    />
                                </Field>
                            </div>

                            <div className="mt-3">
                                <Field label="Contact intro" wide>
                                    <textarea
                                        value={fields.contact_intro}
                                        onChange={(event) => setField("contact_intro", event.target.value)}
                                        rows={3}
                                        className={adminFieldInputClassName}
                                    />
                                </Field>
                            </div>

                            <div className="mt-3">
                                <Field label="Footer note" wide>
                                    <input
                                        value={fields.footer_note}
                                        onChange={(event) => setField("footer_note", event.target.value)}
                                        className={adminFieldInputClassName}
                                    />
                                </Field>
                            </div>
                        </AdminCard>

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
