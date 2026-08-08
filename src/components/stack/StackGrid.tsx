import { stack } from "@/constants/stack";
import { StackItem } from "./StackItem";

export function StackGrid() {
    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stack.map((technology) => (
                <StackItem
                    key={technology}
                    name={technology}
                />
            ))}
        </div>
    );
}