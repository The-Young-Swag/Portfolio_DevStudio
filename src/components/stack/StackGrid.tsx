import { stack } from "@/constants/stack";
import { StackItem } from "./StackItem";

export function StackGrid() {
    return (
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {stack.map((group) => (
                <div
                    key={group.group}
                    className="
                        rounded-2xl
                        border
                        border-(--glass-border)
                        bg-(--glass-bg)
                        p-6
                        shadow-[inset_0_1px_0_var(--glass-highlight),0_10px_30px_-20px_rgba(31,38,135,0.12)]
                        backdrop-blur-xl
                        backdrop-saturate-160
                    "
                >
                    <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-(--graphite-soft)">
                        {group.group}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                        {group.items.map((technology) => (
                            <StackItem key={technology} name={technology} />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}