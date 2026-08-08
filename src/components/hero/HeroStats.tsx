import { CalendarDays, Coffee, GitCommit, Bot } from "lucide-react";

import { StatItem } from "./StatItem";

export function HeroStats() {
    return (
        <div className="mt-10 border-t border-neutral-200">
            <div className="grid grid-cols-3">
                <StatItem
                    value="--"
                    label="Experience"
                    icon={CalendarDays}
                />

                <StatItem
                    value="--"
                    label="Commits / Yr"
                    icon={GitCommit}
                />

                <StatItem
                    value="YES"
                    label="Coffees Consumed"
                    icon={Coffee}
                />
            </div>

            <div className="border-t border-neutral-200 px-1 py-5 sm:py-6">
                <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.14em] text-neutral-400">
                    Also true
                </p>

                <div className="flex flex-wrap gap-2.5">
                    <span className="inline-flex items-center gap-2 rounded-md border border-neutral-200 px-3 py-2 font-mono text-[11px] text-neutral-500">
                        <Bot size={12} />
                        AI tabs opened: Classified
                    </span>

                    <span className="inline-flex items-center gap-2 rounded-md border border-neutral-200 px-3 py-2 font-mono text-[11px] text-neutral-500">
                        <GitCommit size={12} />
                        Commit messages: surprisingly descriptive
                    </span>

                    <span className="inline-flex items-center gap-2 rounded-md border border-neutral-200 px-3 py-2 font-mono text-[11px] text-neutral-500">
                        <Coffee size={12} />
                        Sleep: pending PR review
                    </span>
                </div>
            </div>
        </div>
    );
}