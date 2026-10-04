import { useRef, useState } from "react";
import { useNavigate } from "react-router";
import { KeyRound } from "lucide-react";

import { useProfile } from "@/hooks/profile/useProfile";
import { profile as staticProfile } from "@/constants/profile";
import { Container } from "./Container";

const TAP_WINDOW_MS = 3000;
const REQUIRED_TAPS = 5;
const UNLOCK_ANIMATION_MS = 700;

export function Footer() {
    const { profile } = useProfile();
    const navigate = useNavigate();
    const tapsRef = useRef<number[]>([]);
    const [unlocked, setUnlocked] = useState(false);

    const year = new Date().getFullYear();
    const note = profile.footer_note ?? staticProfile.footer_note;

    function handleCopyrightTap() {
        const now = Date.now();
        const taps = [...tapsRef.current.filter((tap) => now - tap < TAP_WINDOW_MS), now];
        tapsRef.current = taps;

        if (taps.length < REQUIRED_TAPS) {
            return;
        }

        tapsRef.current = [];

        const reduceMotion =
            typeof window.matchMedia === "function" &&
            window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        if (reduceMotion) {
            navigate("/admin");
            return;
        }

        setUnlocked(true);
        window.setTimeout(() => navigate("/admin"), UNLOCK_ANIMATION_MS);
    }

    return (
        <footer
            className="
                border-t
                border-(--line)
                py-6
            "
        >
            <Container>
                <div
                    className="
                        flex
                        flex-wrap
                        items-center
                        justify-between
                        gap-4
                    "
                >
<p
                            className="
                                flex
                                items-center
                                gap-1.5
                                font-mono
                                text-[10.5px]
                                text-(--graphite-soft)
                            "
                        >
                            <span onClick={handleCopyrightTap} className="select-none">
                                © {year}
                            </span>

                            <span
                                aria-hidden="true"
                                className={`
                                    inline-flex
                                    text-(--accent-strong)
                                    transition-all
                                    duration-500
                                    ${unlocked ? "scale-100 opacity-100" : "scale-75 opacity-0"}
                                `}
                            >
                                <KeyRound size={11} strokeWidth={2} />
                            </span>

                            {profile.name} — {note}
                        </p>

                    <div
                        className="
                            flex
                            items-center
                            gap-4
                            font-mono
                            text-[10.5px]
                            text-(--graphite-soft)
                        "
                    >
                        <a
                            href={profile.github}
                            target="_blank"
                            rel="noreferrer"
                            className="
                                inline-flex
                                min-h-[44px]
                                items-center
                                transition-colors
                                duration-150
                                hover:text-(--accent-strong)
                            "
                        >
                            GitHub
                        </a>

                        <a
                            href={profile.linkedin}
                            target="_blank"
                            rel="noreferrer"
                            className="
                                inline-flex
                                min-h-[44px]
                                items-center
                                transition-colors
                                duration-150
                                hover:text-(--accent-strong)
                            "
                        >
                            LinkedIn
                        </a>
                    </div>
                </div>
            </Container>
        </footer>
    );
}