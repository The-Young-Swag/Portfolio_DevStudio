import { Bot, CalendarDays, Code, Coffee, GitCommit, Star } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const STAT_ICONS: Record<string, LucideIcon> = {
    calendardays: CalendarDays,
    gitcommit: GitCommit,
    coffee: Coffee,
    bot: Bot,
    star: Star,
    code: Code,
};

export const STAT_ICON_KEYS = [
    "calendardays",
    "gitcommit",
    "coffee",
    "bot",
    "star",
    "code",
] as const;

export function resolveStatIcon(key: string): LucideIcon {
    return STAT_ICONS[key] ?? Star;
}
