// Explicit motion choice for the sky scene, persisted across visits.
// Storage access is injected so the helpers stay testable outside a browser,
// and this module touches no DOM globals so it type-checks in every project.

export type MotionChoice = "play" | "paused";

export type MotionMode = "auto" | MotionChoice;

export type MotionStore = {
    getItem(key: string): string | null;
    setItem(key: string, value: string): void;
};

const STORAGE_KEY = "time-scene-motion";

function defaultStore(): MotionStore | null {
    try {
        const candidate = (
            globalThis as unknown as {
                localStorage?: MotionStore;
            }
        ).localStorage;
        return typeof candidate === "undefined" ? null : candidate;
    } catch {
        return null;
    }
}

export function readMotionChoice(
    store: MotionStore | null = defaultStore(),
): MotionChoice | null {
    try {
        const value = store?.getItem(STORAGE_KEY);
        return value === "play" || value === "paused" ? value : null;
    } catch {
        return null;
    }
}

export function writeMotionChoice(
    choice: MotionChoice,
    store: MotionStore | null = defaultStore(),
): void {
    try {
        store?.setItem(STORAGE_KEY, choice);
    } catch {
        // Private browsing etc: the choice simply doesn't persist.
    }
}

export function motionMode(choice: MotionChoice | null): MotionMode {
    return choice ?? "auto";
}

// An explicit choice always wins. Without one, reduced motion pauses and
// everything else autoplays.
export function effectiveMotion(
    choice: MotionChoice | null,
    reduceMatches: boolean,
): "play" | "paused" {
    if (choice !== null) {
        return choice;
    }

    return reduceMatches ? "paused" : "play";
}
