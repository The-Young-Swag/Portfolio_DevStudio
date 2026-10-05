import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { STAT_ICON_KEYS } from "@/components/hero/statIcons";
import { useUpdateProfile } from "@/hooks/profile/useProfile";
import { profile as staticProfile } from "@/constants/profile";
import { isUnauthorized } from "@/services/api";
import {
    getProfile,
    type AlsoTrueItem,
    type Profile,
} from "@/services/profile/profile";
import { useAdminToast } from "./toastContext";
import { Field, FormError, adminFieldInputClassName } from "./AdminFields";
import { AddButton } from "./AdminList";
import { SaveBar } from "./SaveBar";

type AlsoTrueManagerProps = {
    token: string;
    onUnauthorized: () => void;
    onDirtyChange: (dirty: boolean) => void;
};

type AlsoTrueRow = AlsoTrueItem & { id: number };

function toRows(items: AlsoTrueItem[], firstId: number): AlsoTrueRow[] {
    return items.map((item, index) => ({ ...item, id: firstId + index }));
}

export function AlsoTrueManager({ token, onUnauthorized, onDirtyChange }: AlsoTrueManagerProps) {
    const profileQuery = useQuery({
        queryKey: ["profile"],
        queryFn: getProfile,
        retry: 1,
        refetchOnWindowFocus: false,
    });

    const updateMutation = useUpdateProfile(token);
    const notify = useAdminToast();

    const [rows, setRows] = useState<AlsoTrueRow[] | null>(null);
    const [initialRows, setInitialRows] = useState<AlsoTrueRow[] | null>(null);
    const [formError, setFormError] = useState<string | null>(null);
    const [syncedProfile, setSyncedProfile] = useState<Profile | null>(null);
    const [rowIdCounter, setRowIdCounter] = useState(0);
    const [touched, setTouched] = useState(false);

    if (profileQuery.data !== undefined && syncedProfile !== profileQuery.data) {
        const items = profileQuery.data.also_true ?? staticProfile.also_true;
        setSyncedProfile(profileQuery.data);
        setRows(toRows(items, rowIdCounter + 1));
        setInitialRows(toRows(items, rowIdCounter + 1));
        setRowIdCounter(rowIdCounter + items.length);
        onDirtyChange(false);
    }

    function markTouched() {
        setTouched(true);
        onDirtyChange(true);
    }

    function updateRow(id: number, patch: Partial<AlsoTrueItem>) {
        markTouched();
        setRows((current) =>
            current === null
                ? current
                : current.map((row) => (row.id === id ? { ...row, ...patch } : row)),
        );
    }

    function moveRow(id: number, direction: -1 | 1) {
        markTouched();
        setRows((current) => {
            if (current === null) {
                return current;
            }

            const index = current.findIndex((row) => row.id === id);
            const target = index + direction;

            if (index < 0 || target < 0 || target >= current.length) {
                return current;
            }

            const next = [...current];
            next[index] = current[target];
            next[target] = current[index];
            return next;
        });
    }

    function removeRow(id: number) {
        markTouched();
        setRows((current) => (current === null ? current : current.filter((row) => row.id !== id)));
    }

    function addRow() {
        markTouched();
        setRowIdCounter((counter) => counter + 1);
        setRows((current) => [...(current ?? []), { id: rowIdCounter + 1, text: "", icon: "star" }]);
    }

    function discard() {
        setRows(initialRows === null ? null : [...initialRows]);
        setFormError(null);
        setTouched(false);
        onDirtyChange(false);
    }

    function commit() {
        if (rows === null || profileQuery.data === undefined) {
            return;
        }

        setFormError(null);

        const also_true: AlsoTrueItem[] = rows.map(({ text, icon }) => ({
            text: text.trim(),
            icon,
        }));

        updateMutation.mutate(
            { ...profileQuery.data, also_true },
            {
                onSuccess: (profile) => {
                    setInitialRows(toRows(profile.also_true ?? [], 0));
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
            <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                    <h1 className="font-display text-[26px] font-medium tracking-tight text-(--ink)">
                        Also true
                    </h1>

                    <p className="mt-1.5 max-w-2xl text-[13.5px] leading-relaxed text-(--graphite)">
                        Fun footnotes beside the hero stats.
                    </p>
                </div>

                <AddButton onClick={addRow}>Add item</AddButton>
            </div>

            <div className="mt-5">
                {profileQuery.isPending ? (
                    <p className="font-mono text-[10.5px] text-(--graphite)">
                        Loading also-true items...
                    </p>
                ) : profileQuery.isError || rows === null ? (
                    <div className="flex items-center gap-3">
                        <p className="font-mono text-[10.5px] text-(--graphite)">
                            Unable to load also-true items.
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
                    <>
                        {rows.length === 0 && (
                            <p className="font-mono text-[10.5px] text-(--graphite)">
                                No items. The “Also true” block will be hidden on the site.
                            </p>
                        )}

                        <div className="space-y-3">
                        {rows.map((row, index) => (
                            <div
                                key={row.id}
                                className="space-y-2 rounded-2xl border border-(--glass-border) bg-(--glass-bg) p-4 backdrop-blur-xl backdrop-saturate-160"
                            >
                                <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_10rem]">
                                    <Field label="Text">
                                        <input
                                            value={row.text}
                                            onChange={(event) =>
                                                updateRow(row.id, { text: event.target.value })
                                            }
                                            className={adminFieldInputClassName}
                                        />
                                    </Field>

                                    <Field label="Icon">
                                        <select
                                            value={row.icon}
                                            onChange={(event) =>
                                                updateRow(row.id, { icon: event.target.value })
                                            }
                                            className={adminFieldInputClassName}
                                        >
                                            {STAT_ICON_KEYS.map((key) => (
                                                <option key={key} value={key}>
                                                    {key}
                                                </option>
                                            ))}
                                        </select>
                                    </Field>
                                </div>

                                <div className="flex gap-4">
                                    <button
                                        type="button"
                                        onClick={() => moveRow(row.id, -1)}
                                        disabled={index === 0}
                                        className="font-mono text-[11px] text-(--graphite) transition-colors duration-150 hover:text-(--accent-strong) disabled:opacity-40"
                                    >
                                        ↑ Up
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => moveRow(row.id, 1)}
                                        disabled={index === rows.length - 1}
                                        className="font-mono text-[11px] text-(--graphite) transition-colors duration-150 hover:text-(--accent-strong) disabled:opacity-40"
                                    >
                                        ↓ Down
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => removeRow(row.id)}
                                        className="font-mono text-[11px] text-(--graphite) transition-colors duration-150 hover:text-red-500"
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        ))}
                        </div>

                        {formError !== null && (
                            <div className="mt-3">
                                <FormError message={formError} />
                            </div>
                        )}
                    </>
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
