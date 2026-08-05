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
                label="Experience"
                value="--"
            />

            <StatCard
                label="GitHub Contributions"
                value="--"
            />

            <StatCard
                label="Availability"
                value="Open to Work"
            />

            <StatCard
                label="Coffees Consumed"
                value="Yes ☕"
            />
        </div>
    );
}