import { StatCard } from "./StatCard";

export function HeroStats() {
    return (
        <div
            className="
                mt-10
                grid
                gap-4
                sm:grid-cols-2
                lg:grid-cols-4
            "
        >
            <StatCard
                label="EXPERIENCE"
                value="--"
            />

            <StatCard
                label="COMMITS / YR"
                value="--"
            />

            <StatCard
                label="COFFEES CONSUMED"
                value="Yes ☕"
            />
        </div>
    );
}