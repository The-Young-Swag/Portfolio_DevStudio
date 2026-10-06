import { useState } from "react";
import { Moon, Sun } from "lucide-react";

import profileDefault from "@/assets/images/profile-default.webp";
import { useTheme } from "@/context/theme";
import { useProfile } from "@/hooks/profile/useProfile";
import { ADMIN_GROUPS, type AdminSectionId } from "./adminSections";

type AdminSidebarProps = {
    current: AdminSectionId;
    counts: Record<string, number | undefined>;
    dirty: Partial<Record<AdminSectionId, boolean>>;
    onNavigate: (id: AdminSectionId) => void;
};

function initialsFor(name: string): string {
    const parts = name.trim().split(/\s+/).filter((part) => part !== "");

    if (parts.length === 0) {
        return "?";
    }

    const first = parts[0]?.charAt(0) ?? "";
    const last = parts.length > 1 ? (parts[parts.length - 1]?.charAt(0) ?? "") : "";

    return `${first}${last}`.toUpperCase();
}

export function AdminSidebar({ current, counts, dirty, onNavigate }: AdminSidebarProps) {
    const { theme, toggleTheme } = useTheme();
    const { profile } = useProfile();
    const [portraitFailed, setPortraitFailed] = useState(false);
    const dark = theme === "dark";

    const displayName = profile.name.trim() === "" ? "Content admin" : profile.name;
    const defaultPortrait = profile.portrait["profile-default"]?.image || profileDefault;
    const siteHost = typeof window === "undefined" ? "" : window.location.host;

    return (
        <aside
            aria-label="Admin sections"
            className="
                flex
                flex-row
                items-center
                gap-1.5
                overflow-x-auto
                border-b
                border-(--line)
                px-4
                py-3
                min-[820px]:sticky
                min-[820px]:top-0
                min-[820px]:h-dvh
                min-[820px]:flex-col
                min-[820px]:items-stretch
                min-[820px]:gap-1
                min-[820px]:overflow-y-auto
                min-[820px]:overflow-x-visible
                min-[820px]:border-b-0
                min-[820px]:border-r
                min-[820px]:px-4
                min-[820px]:py-5
            "
        >
            <div className="mr-2 hidden shrink-0 items-center gap-2.5 min-[820px]:mb-3 min-[820px]:flex">
                {portraitFailed ? (
                    <span
                        aria-hidden="true"
                        className="
                            flex
                            h-8
                            w-8
                            items-center
                            justify-center
                            rounded-lg
                            bg-(--accent-strong)
                            font-display
                            text-[13px]
                            font-semibold
                            text-white
                        "
                    >
                        {initialsFor(displayName)}
                    </span>
                ) : (
                    <img
                        src={defaultPortrait}
                        alt=""
                        onError={() => setPortraitFailed(true)}
                        className="h-8 w-8 shrink-0 rounded-lg border border-(--glass-border) object-cover"
                    />
                )}

                <span className="min-w-0">
                    <span className="block truncate text-[13.5px] font-semibold text-(--ink)">
                        {displayName}
                    </span>
                    {siteHost !== "" && (
                        <span className="block truncate font-mono text-[10.5px] text-(--graphite-soft)">
                            {siteHost}
                        </span>
                    )}
                </span>
            </div>

            {ADMIN_GROUPS.map((group) => (
                <div key={group.label} className="contents">
                    <p className="hidden px-2.5 pb-1 pt-4 font-mono text-[10.5px] uppercase tracking-[0.1em] text-(--graphite-soft) min-[820px]:block">
                        {group.label}
                    </p>

                    {group.sections.map((section) => {
                        const Icon = section.icon;
                        const active = section.id === current;
                        const count =
                            section.countKey !== undefined
                                ? counts[section.countKey]
                                : undefined;
                        const isDirty = dirty[section.id] === true;

                        return (
                            <button
                                key={section.id}
                                type="button"
                                onClick={() => onNavigate(section.id)}
                                aria-current={active ? "page" : undefined}
                                className={`
                                    flex
                                    shrink-0
                                    items-center
                                    gap-2.5
                                    rounded-xl
                                    px-3
                                    py-2.5
                                    text-[13.5px]
                                    transition-colors
                                    duration-150
                                    focus-visible:outline-none
                                    focus-visible:ring-2
                                    focus-visible:ring-(--accent-strong)
                                    min-[820px]:w-full
                                    min-[820px]:text-left
                                    ${
                                        active
                                            ? "bg-(--accent-strong)/10 font-semibold text-(--accent-strong) shadow-[inset_0_0_0_1px_var(--accent-strong)/30]"
                                            : "text-(--graphite) hover:bg-(--glass-bg) hover:text-(--ink)"
                                    }
                                `}
                            >
                                <Icon size={16} strokeWidth={2} aria-hidden="true" />

                                <span className="whitespace-nowrap">{section.label}</span>

                                {count !== undefined && !isDirty && (
                                    <span className="ml-auto hidden font-mono text-[11px] text-(--graphite-soft) min-[820px]:inline">
                                        {count}
                                    </span>
                                )}

                                {isDirty && (
                                    <span
                                        aria-label="Unsaved changes"
                                        title="Unsaved changes"
                                        className="ml-auto h-2 w-2 shrink-0 rounded-full bg-(--accent-strong)"
                                    />
                                )}
                            </button>
                        );
                    })}
                </div>
            ))}

            <div className="mt-auto hidden shrink-0 pt-3 min-[820px]:block">
                <button
                    type="button"
                    onClick={toggleTheme}
                    className="
                        flex
                        w-full
                        items-center
                        gap-2.5
                        rounded-xl
                        px-3
                        py-2.5
                        text-[13.5px]
                        text-(--graphite)
                        transition-colors
                        duration-150
                        hover:bg-(--glass-bg)
                        hover:text-(--ink)
                        focus-visible:outline-none
                        focus-visible:ring-2
                        focus-visible:ring-(--accent-strong)
                    "
                >
                    {dark ? (
                        <Sun size={16} strokeWidth={2} aria-hidden="true" />
                    ) : (
                        <Moon size={16} strokeWidth={2} aria-hidden="true" />
                    )}
                    {dark ? "Light mode" : "Dark mode"}
                </button>
            </div>
        </aside>
    );
}
