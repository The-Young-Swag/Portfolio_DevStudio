import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { STAT_ICON_KEYS } from "@/components/hero/statIcons";
import { useUpdateProfile } from "@/hooks/profile/useProfile";
import { profile as staticProfile } from "@/constants/profile";
import { isUnauthorized } from "@/services/api";
import {
    getProfile,
    type HeroStat,
    type Profile,
} from "@/services/profile/profile";
import { useAdminToast } from "./toastContext";
import { Field, FormError, adminFieldInputClassName } from "./AdminFields";
import { AddButton } from "./AdminList";
import { SaveBar } from "./SaveBar";

type HeroStatsManagerProps = {
    token: string;
    onUnauthorized: () => void;
    onDirtyChange: (dirty: boolean) => void;
};

type StatRow = HeroStat & { id: number };

const LIVE_OPTIONS = [
    { value: "", label: "Fixed value" },
    { value: "experience", label: "Experience (live)" },
    { value: "contributions", label: "Contributions (live)" },
] as const;

function toRows(stats: HeroStat[], firstId: number): StatRow[] {
    return stats.map((stat, index) => ({ ...stat, id: firstId + index }));
}

export function HeroStatsManager({ token, onUnauthorized, onDirtyChange }: HeroStatsManagerProps) {
    const profileQuery = useQuery({
        queryKey: ["profile"],
        queryFn: getProfile,
        retry: 1,
        refetchOnWindowFocus: false,
    });

    const updateMutation = useUpdateProfile(token);
    const notify = useAdminToast();

    const [rows, setRows] = useState<StatRow[] | null>(null);
    const [initialRows, setInitialRows] = useState<StatRow[] | null>(null);
    const [formError, setFormError] = useState<string | null>(null);
    const [syncedProfile, setSyncedProfile] = useState<Profile | null>(null);
    const [rowIdCounter, setRowIdCounter] = useState(0);
    const [touched, setTouched] = useState(false);

    if (profileQuery.data !== undefined && syncedProfile !== profileQuery.data) {
        const stats = profileQuery.data.hero_stats ?? staticProfile.hero_stats;
        setSyncedProfile(profileQuery.data);
        setRows(toRows(stats, rowIdCounter + 1));
        setInitialRows(toRows(stats, rowIdCounter + 1));
        setRowIdCounter(rowIdCounter + stats.length);
        onDirtyChange(false);
    }

    function markTouched() {
        setTouched(true);
        onDirtyChange(true);
    }

    function updateRow(id: number, patch: Partial<HeroStat>) {
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
        setRows((current) => [
            ...(current ?? []),
            { id: rowIdCounter + 1, label: "", value: "", suffix: "", icon: "star", live: null },
        ]);
    }

    function discard() {
        setRows(initialRows === null ? null : [...initialRows]);
        setFormError(null);
        onDirtyChange(false);
    }

    function commit() {
        if (rows === null || profileQuery.data === undefined) {
            return;
        }

        setFormError(null);

        const hero_stats: HeroStat[] = rows.map(({ label, value, suffix, icon, live }) => ({
            label: label.trim(),
            value: value.trim(),
            suffix: suffix.trim(),
            icon,
            live,
        }));

        updateMutation.mutate(
            { ...profileQuery.data, hero_stats },
            {
                onSuccess: (profile) => {
                    setInitialRows(toRows(profile.hero_stats ?? [], 0));
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
                    <h1 className="font-display text-[32px] font-medium tracking-tight text-(--ink)">
                        Home hero
                    </h1>

                    <p className="mt-1.5 max-w-2xl text-[15px] leading-relaxed text-(--graphite)">
                        Stats beside your portrait. Live sources are calculated
                        automatically.
                    </p>
                </div>

                <AddButton onClick={addRow}>Add stat</AddButton>
            </div>

            <div className="mt-5">
                {profileQuery.isPending ? (
                    <p className="font-mono text-[10.5px] text-(--graphite)">
                        Loading hero stats...
                    </p>
                ) : profileQuery.isError || rows === null ? (
                    <div className="flex items-center gap-3">
                        <p className="font-mono text-[10.5px] text-(--graphite)">
                            Unable to load hero stats.
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
                                No stats. The row of stats will be hidden on the site.
                            </p>
                        )}

                        <div className="space-y-3">
                        {rows.map((row, index) => (
                            <div
                                key={row.id}
                                className="space-y-2 rounded-2xl border border-(--glass-border) bg-(--glass-bg) p-4 backdrop-blur-xl backdrop-saturate-160"
                            >
                                <div className="grid gap-3 sm:grid-cols-2">
                                    <Field label="Label">
                                        <input
                                            value={row.label}
                                            onChange={(event) =>
                                                updateRow(row.id, { label: event.target.value })
                                            }
                                            className={adminFieldInputClassName}
                                        />
                                    </Field>

                                    <Field label="Value">
                                        <input
                                            value={row.value}
                                            disabled={row.live !== null}
                                            placeholder={row.live !== null ? "Calculated automatically" : ""}
                                            onChange={(event) =>
                                                updateRow(row.id, { value: event.target.value })
                                            }
                                            className={adminFieldInputClassName}
                                        />
                                    </Field>

                                    <Field label="Suffix">
                                        <input
                                            value={row.suffix}
                                            onChange={(event) =>
                                                updateRow(row.id, { suffix: event.target.value })
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

                                <Field label="Source">
                                    <select
                                        value={row.live ?? ""}
                                        onChange={(event) =>
                                            updateRow(row.id, {
                                                live:
                                                    event.target.value === ""
                                                        ? null
                                                        : (event.target.value as HeroStat["live"]),
                                            })
                                        }
                                        className={adminFieldInputClassName}
                                    >
                                        {LIVE_OPTIONS.map((option) => (
                                            <option key={option.label} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </Field>

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
