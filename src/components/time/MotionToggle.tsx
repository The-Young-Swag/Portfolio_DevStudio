import { useEffect, useState } from "react";
import { Pause, Play } from "lucide-react";

import {
    effectiveMotion,
    writeMotionChoice,
    type MotionChoice,
} from "./motionChoice";

function useLiveReduceMotion(): boolean {
    const [reduceMatches, setReduceMatches] = useState(
        () =>
            typeof window !== "undefined" &&
            !!window.matchMedia &&
            window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    );

    useEffect(() => {
        if (!window.matchMedia) {
            return;
        }

        const query = window.matchMedia("(prefers-reduced-motion: reduce)");
        const handleChange = (event: MediaQueryListEvent) => {
            setReduceMatches(event.matches);
        };

        query.addEventListener("change", handleChange);

        return () => {
            query.removeEventListener("change", handleChange);
        };
    }, []);

    return reduceMatches;
}

type MotionToggleProps = {
    initial: MotionChoice | null;
    onChoice: (choice: MotionChoice) => void;
};

// Small Play/Pause override on the sky card. An explicit choice always wins
// and is persisted; without one the scene follows the OS reduced-motion
// setting. Only this button re-renders, never the scene driver.
export function MotionToggle({ initial, onChoice }: MotionToggleProps) {
    const [choice, setChoice] = useState<MotionChoice | null>(initial);
    const reduceMatches = useLiveReduceMotion();
    const playing = effectiveMotion(choice, reduceMatches) === "play";
    const label = playing ? "Pause" : "Play";
    const Icon = playing ? Pause : Play;

    function toggle() {
        const next: MotionChoice = playing ? "paused" : "play";
        setChoice(next);
        writeMotionChoice(next);
        onChoice(next);
    }

    return (
        <button
            type="button"
            onClick={toggle}
            aria-pressed={playing}
            aria-label={`${label} sky animation`}
            title={`${label} sky animation`}
            className="
                glass
                absolute
                right-3
                top-3
                z-10
                inline-flex
                min-h-9
                items-center
                gap-1.5
                rounded-full
                px-3
                py-2
                font-mono
                text-[10.5px]
                text-(--ink)
                transition-colors
                duration-150
                hover:border-(--accent-strong)
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-(--accent-strong)
            "
        >
            <Icon size={12} strokeWidth={2} aria-hidden="true" />
            {label}
        </button>
    );
}
