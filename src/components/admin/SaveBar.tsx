import { Check } from "lucide-react";

import { PrimaryButton, SecondaryButton } from "./AdminButtons";

type SaveBarProps = {
    open: boolean;
    saving: boolean;
    onSave: () => void;
    onDiscard: () => void;
};

export function SaveBar({ open, saving, onSave, onDiscard }: SaveBarProps) {
    if (!open) {
        return null;
    }

    return (
        <div
            className="
                fixed
                bottom-[max(1.25rem,env(safe-area-inset-bottom))]
                left-1/2
                z-[60]
                flex
                -translate-x-1/2
                items-center
                gap-3
                whitespace-nowrap
                rounded-2xl
                border
                border-(--glass-border)
                bg-(--glass-bg-strong)
                py-2
                pl-4
                pr-2
                shadow-lg
                backdrop-blur-xl
                backdrop-saturate-160
            "
        >
            <span className="flex items-center gap-2 font-mono text-[11.5px] text-(--ink)">
                <span
                    aria-hidden="true"
                    className="h-2 w-2 rounded-full bg-(--accent-strong)"
                />
                Unsaved changes
            </span>

            <SecondaryButton onClick={onDiscard}>Discard</SecondaryButton>

            <PrimaryButton onClick={onSave} disabled={saving}>
                <Check size={15} strokeWidth={2} aria-hidden="true" />
                {saving ? "Saving…" : "Save & publish"}
            </PrimaryButton>
        </div>
    );
}
