import { stack } from "@/constants/stack";
import { StackItem } from "./StackItem";

export function StackGrid() {
    return (
        <div className="mt-4 rounded-lg border border-neutral-200 p-6 sm:p-8">
            <p
                className="
                    mb-5
                    max-w-lg
                    text-[13px]
                    leading-relaxed
                    text-neutral-600
                "
            >
                The usual suspects. I try to keep the
                toolchain boring so the product can be
                interesting.
            </p>

            <div className="flex flex-wrap gap-2">
                {stack.map((technology) => (
                    <StackItem
                        key={technology}
                        name={technology}
                    />
                ))}
            </div>

            <p
                className="
                    mt-5
                    font-mono
                    text-[11px]
                    italic
                    text-neutral-500
                "
            >
                "It's not much, but it's honest work."
            </p>
        </div>
    );
}