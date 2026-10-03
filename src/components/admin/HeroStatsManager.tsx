import { useState } from "react";
import type { FormEvent } from "react";
import { useQuery } from "@tanstack/react-query";

import { STAT_ICON_KEYS } from "@/components/hero/statIcons";
import { useUpdateProfile } from "@/hooks/profile/useProfile";
import { profile as staticProfile } from "@/constants/profile";
import { ApiError } from "@/services/api";
import {
    getProfile,
    type HeroStat,
    type Profile,
} from "@/services/profile/profile";

type HeroStatsManagerProps = {
    token: string;
    onUnauthorized: () => void;
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

export function HeroStatsManager({ token, onUnauthorized }: HeroStatsManagerProps) {
    const profileQuery = useQuery({
        queryKey: ["profile"],
        queryFn: getProfile,
        retry: 1,
        refetchOnWindowFocus: false,
    });

    const updateMutation = useUpdateProfile(token);

    const [rows, setRows] = useState<StatRow[] | null>(null);
    const [formError, setFormError] = useState<string | null>(null);
    const [saved, setSaved] = useState(false);
    const [syncedProfile, setSyncedProfile] = useState<Profile | null>(null);
    const [rowIdCounter, setRowIdCounter] = useState(0);

    if (profileQuery.data !== undefined && syncedProfile !== profileQuery.data) {
        const stats = profileQuery.data.hero_stats ?? staticProfile.hero_stats;
        setSyncedProfile(profileQuery.data);
        setRows(toRows(stats, rowIdCounter + 1));
        setRowIdCounter(rowIdCounter + stats.length);
    }

    function updateRow(id: number, patch: Partial<HeroStat>) {
        setSaved(false);
        setRows((current) =>
            current === null
                ? current
                : current.map((row) => (row.id === id ? { ...row, ...patch } : row)),
        );
    }

    function moveRow(id: number, direction: -1 | 1) {
        setSaved(false);
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
        setSaved(false);
        setRows((current) => (current === null ? current : current.filter((row) => row.id !== id)));
    }

    function addRow() {
        setSaved(false);
        setRowIdCounter((counter) => counter + 1);
        setRows((current) => [
            ...(current ?? []),
            { id: rowIdCounter + 1, label: "", value: "", suffix: "", icon: "star", live: null },
        ]);
    }

    function handleSubmit(event: FormEvent) {
        event.preventDefault();

        if (rows === null || profileQuery.data === undefined) {
            return;
        }

        setFormError(null);
        setSaved(false);

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
        <section aria-label="Hero stats">
            <div className="mt-8 flex items-baseline justify-between">
                <h2 className="font-display text-[20px] font-medium text-(--ink)">
                    Hero stats
                </h2>

                <button
                    type="button"
                    onClick={addRow}
                    className="
                        font-mono
                        text-[11px]
                        text-(--accent-strong)
                        hover:underline
                    "
                >
                    Add stat
                </button>
            </div>

            <div className="mt-4">
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
                        {rows.length === 0 && (
                            <p className="font-mono text-[10.5px] text-(--graphite)">
                                No stats. The row of stats will be hidden on the site.
                            </p>
                        )}

                        {rows.map((row, index) => (
                            <div
                                key={row.id}
                                className="space-y-2 rounded-xl border border-(--line) p-3"
                            >
                                <div className="grid gap-2 sm:grid-cols-2">
                                    <label className="block">
                                        <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-(--graphite-soft)">
                                            Label
                                        </span>
                                        <input
                                            value={row.label}
                                            onChange={(event) =>
                                                updateRow(row.id, { label: event.target.value })
                                            }
                                            className="mt-1 w-full rounded-lg border border-(--glass-border) bg-white/40 px-3 py-2 text-[13px] text-(--ink) outline-none focus:border-(--accent-strong) dark:bg-black/20"
                                        />
                                    </label>

                                    <label className="block">
                                        <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-(--graphite-soft)">
                                            Value
                                        </span>
                                        <input
                                            value={row.value}
                                            onChange={(event) =>
                                                updateRow(row.id, { value: event.target.value })
                                            }
                                            className="mt-1 w-full rounded-lg border border-(--glass-border) bg-white/40 px-3 py-2 text-[13px] text-(--ink) outline-none focus:border-(--accent-strong) dark:bg-black/20"
                                        />
                                    </label>

                                    <label className="block">
                                        <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-(--graphite-soft)">
                                            Suffix
                                        </span>
                                        <input
                                            value={row.suffix}
                                            onChange={(event) =>
                                                updateRow(row.id, { suffix: event.target.value })
                                            }
                                            className="mt-1 w-full rounded-lg border border-(--glass-border) bg-white/40 px-3 py-2 text-[13px] text-(--ink) outline-none focus:border-(--accent-strong) dark:bg-black/20"
                                        />
                                    </label>

                                    <label className="block">
                                        <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-(--graphite-soft)">
                                            Icon
                                        </span>
                                        <select
                                            value={row.icon}
                                            onChange={(event) =>
                                                updateRow(row.id, { icon: event.target.value })
                                            }
                                            className="mt-1 w-full rounded-lg border border-(--glass-border) bg-white/40 px-3 py-2 text-[13px] text-(--ink) outline-none focus:border-(--accent-strong) dark:bg-black/20"
                                        >
                                            {STAT_ICON_KEYS.map((key) => (
                                                <option key={key} value={key}>
                                                    {key}
                                                </option>
                                            ))}
                                        </select>
                                    </label>
                                </div>

                                <label className="block">
                                    <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-(--graphite-soft)">
                                        Source
                                    </span>
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
                                        className="mt-1 w-full rounded-lg border border-(--glass-border) bg-white/40 px-3 py-2 text-[13px] text-(--ink) outline-none focus:border-(--accent-strong) dark:bg-black/20"
                                    >
                                        {LIVE_OPTIONS.map((option) => (
                                            <option key={option.label} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </label>

                                <div className="flex gap-3">
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
