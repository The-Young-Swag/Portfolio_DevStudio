import { useEffect, useRef } from "react";

export function useFocusTrap<T extends HTMLElement>(active: boolean) {
    const ref = useRef<T>(null);

    useEffect(() => {
        const node = ref.current;

        if (!active || !node) {
            return;
        }

        const previouslyFocused = document.activeElement as HTMLElement | null;
        node.focus();

        function onKeyDown(event: KeyboardEvent) {
            if (event.key !== "Tab") {
                return;
            }

            const focusable = Array.from(
                node?.querySelectorAll<HTMLElement>(
                    'button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
                ) ?? [],
            ).filter((element) => !element.hasAttribute("disabled"));

            if (focusable.length === 0) {
                return;
            }

            const first = focusable[0];
            const last = focusable[focusable.length - 1];

            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        }

        node.addEventListener("keydown", onKeyDown);

        return () => {
            node.removeEventListener("keydown", onKeyDown);
            previouslyFocused?.focus();
        };
    }, [active]);

    return ref;
}
