import { useEffect, useRef, useState } from "react";

import profileDefault from "@/assets/images/profile-default.webp";
import profileGoodMorning from "@/assets/images/profile-GoodMorning.png";
import profileSleep from "@/assets/images/profile-Sleep.png";
import profileAwake from "@/assets/images/profile-WokeUp.png";

import { useTheme } from "@/context/theme";

type ProfileState =
    | "profile-default"
    | "profile-good-morning"
    | "profile-sleep"
    | "profile-awake";

const PORTRAITS: Record<ProfileState, string> = {
    "profile-default": profileDefault,
    "profile-good-morning": profileGoodMorning,
    "profile-sleep": profileSleep,
    "profile-awake": profileAwake,
};

function advanceState(state: ProfileState): ProfileState {
    switch (state) {
        case "profile-good-morning":
        case "profile-awake":
            return "profile-default";
        case "profile-sleep":
            return "profile-awake";
        default:
            return state;
    }
}

function sourceMatches(img: HTMLImageElement, src: string) {
    return img.getAttribute("src") === src;
}

export function HeroPortrait() {
    const { theme } = useTheme();

    /*
     * Easter-egg state machine:
     *   - First visit always starts at the default portrait.
     *   - Theme transitions retrigger it: Dark -> Light shows the coffee
     *     portrait (one click returns to default); Light -> Dark shows the
     *     sleeping portrait (click -> awake -> default).
     */
    const [state, setState] = useState<ProfileState>("profile-default");

    const [previousTheme, setPreviousTheme] = useState(theme);

    if (previousTheme !== theme) {
        setPreviousTheme(theme);
        setState(
            theme === "dark"
                ? "profile-sleep"
                : "profile-good-morning",
        );
    }

    const baseImgRef = useRef<HTMLImageElement>(null);
    const overlayImgRef = useRef<HTMLImageElement>(null);
    const promoteTimerRef = useRef<number | null>(null);

    /* Preload the prepared portraits so the first click is instant. */
    useEffect(() => {
        Object.values(PORTRAITS).forEach((src) => {
            const image = new Image();
            image.src = src;
        });
    }, []);

    /* Crossfade the portrait whenever the state changes. This touches the
     * DOM directly (an external system) rather than staging more React state,
     * so each transition is a smooth two-layer fade between the prepared
     * images. */
    useEffect(() => {
        const target = PORTRAITS[state];
        const base = baseImgRef.current;
        const overlay = overlayImgRef.current;

        if (!base || !overlay) {
            return;
        }

        if (sourceMatches(base, target)) {
            return;
        }

        const reduceMotion =
            window.matchMedia &&
            window.matchMedia(
                "(prefers-reduced-motion: reduce)",
            ).matches;

        if (reduceMotion) {
            base.src = target;
            overlay.removeAttribute("src");
            return;
        }

        if (promoteTimerRef.current !== null) {
            window.clearTimeout(promoteTimerRef.current);
        }

        overlay.src = target;
        overlay.style.transition = "none";
        overlay.style.opacity = "0";
        void overlay.getBoundingClientRect();
        overlay.style.transition =
            "opacity 500ms ease, transform 500ms ease";
        overlay.style.transform = "scale(1.015)";
        overlay.style.opacity = "1";

        // After the fade completes, promote the overlay to the base layer.
        promoteTimerRef.current = window.setTimeout(() => {
            base.src = target;
            overlay.style.transition = "none";
            overlay.style.opacity = "0";
            overlay.style.transform = "scale(1)";
            overlay.removeAttribute("src");
        }, 520);
    }, [state]);

    useEffect(
        () => () => {
            if (promoteTimerRef.current !== null) {
                window.clearTimeout(promoteTimerRef.current);
            }
        },
        [],
    );

    const handleClick = () => {
        setState(advanceState(state));
    };

    return (
        <button
            type="button"
            onClick={handleClick}
            aria-label="Portrait of Ivan Harvey Rivera — click to change"
            title="Click me"
            className="
                group
                relative
                aspect-square
                w-full
                cursor-pointer
                overflow-hidden
                rounded-[20px]
                border
                border-(--glass-border)
                bg-(--glass-bg)
                p-0
                text-left
                shadow-[inset_0_1px_0_var(--glass-highlight),0_18px_45px_rgba(31,38,135,0.10)]
                backdrop-blur-[18px]
                backdrop-saturate-140
                ring-1
                ring-black/[0.04]
                transition-[box-shadow,border-color]
                duration-300
                ease-[cubic-bezier(0.22,1,0.36,1)]

                hover:border-(--accent-strong)/60
                hover:shadow-[inset_0_1px_0_var(--glass-highlight),0_0_0_1px_var(--accent-strong)/25,0_22px_55px_-20px_var(--accent-strong)/35]

                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-(--accent-strong)

                dark:ring-white/[0.06]
            "
        >
            <div className="relative h-full w-full">
                <img
                    ref={baseImgRef}
                    src={PORTRAITS["profile-default"]}
                    alt="Portrait of Ivan Harvey Rivera"
                    fetchPriority="high"
                    decoding="async"
                    className="absolute inset-0 h-full w-full object-cover"
                />

                <img
                    ref={overlayImgRef}
                    alt=""
                    aria-hidden="true"
                    decoding="async"
                    className="absolute inset-0 h-full w-full object-cover opacity-0"
                />
            </div>

            <span
                aria-hidden="true"
                className="
                    pointer-events-none
                    absolute
                    inset-0
                    rounded-[20px]
                    shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]
                "
            />
        </button>
    );
}