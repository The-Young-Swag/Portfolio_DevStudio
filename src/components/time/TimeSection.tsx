import { useEffect, useRef, useState, type CSSProperties } from "react";

import { Container, Section } from "@/components/layout";
import { SectionHeading } from "@/components/ui";

import { createNightScheduler } from "./nightScheduler";
import {
    effectiveMotion,
    motionMode,
    readMotionChoice,
    writeMotionChoice,
    type MotionChoice,
} from "./motionChoice";
import { MotionToggle } from "./MotionToggle";
import {
    getDecimalTime,
    getSkyState,
    MOON_COLOR,
    MOON_GLOW_RADIUS,
    MOON_RADIUS,
    SUN_COLOR,
    SUN_GLOW_RADIUS,
    SUN_RADIUS,
} from "./skyState";
import {
    formatDate,
    formatTime,
    formatTimeZone,
    TIME_ZONE,
} from "./timeUtils";

const stars = [
    [70, 40, 1.4],
    [150, 80, 1],
    [230, 35, 1.3],
    [330, 60, 1],
    [420, 30, 1.5],
    [520, 55, 1],
    [610, 25, 1.3],
    [700, 70, 1],
    [790, 45, 1.4],
    [850, 90, 1],
    [40, 100, 1],
    [270, 95, 1],
    [120, 55, 1.1],
    [380, 25, 1.2],
    [480, 85, 1],
    [750, 35, 1.3],
    [180, 20, 1],
    [650, 15, 1.2],
    [820, 65, 1],
    [90, 115, 1.1],
] as const;

// One driver tick per second. Sky variables are minute-quantized, so the
// per-tick work is a single pure state computation plus scheduler math;
// nothing here re-renders the React tree.
const TICK_MS = 1000;
const TICK_SECONDS = TICK_MS / 1000;

// Stable visibility before the scene (and its night session) may start,
// so a mid-scroll flicker never reaches the scheduler.
const VISIBILITY_DEBOUNCE_MS = 400;

// Shooting star cadence within a night session.
const SHOOT_INTERVAL_S = 2.5;

// Meteor-shower stagger. METEOR_STREAK_ANIM_S must match the CSS
// `.time-meteor-falling` animation-duration (0.7s): the stagger spreads the
// streaks so the burst lasts METEOR_SHOWER_DURATION_S end to end.
const METEOR_STREAK_ANIM_S = 0.7;
const METEOR_SHOWER_DURATION_S = 5;

// Fixed saucer altitude: clear of the peaks, below the cloud layer.
const UFO_FLIGHT_Y = 55;

// Dev-only time override (?sky=HH:MM, Manila wall time) so every phase and
// the night events can be exercised without waiting. The import.meta.env.DEV
// guard lets the production build drop the branch entirely.
function resolveNow(): Date {
    const now = new Date();

    if (!import.meta.env.DEV) {
        return now;
    }

    const match = /^(\d{1,2}):(\d{2})$/.exec(
        new URLSearchParams(window.location.search).get("sky") ?? "",
    );

    if (!match) {
        return now;
    }

    const hours = Number(match[1]);
    const minutes = Number(match[2]);

    if (hours > 23 || minutes > 59) {
        return now;
    }

    const [year, month, day] = new Intl.DateTimeFormat("en-CA", {
        timeZone: TIME_ZONE,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    })
        .format(now)
        .split("-")
        .map(Number);

    // Asia/Manila is fixed at UTC+8 (no DST), so the offset is a constant.
    return new Date(
        Date.UTC(
            year,
            month - 1,
            day,
            hours - 8,
            minutes,
            now.getSeconds(),
            now.getMilliseconds(),
        ),
    );
}

export function TimeSection() {
    const wrapRef = useRef<HTMLDivElement>(null);
    const svgRef = useRef<SVGSVGElement>(null);
    const phaseRef = useRef<HTMLParagraphElement>(null);
    const timeRef = useRef<HTMLParagraphElement>(null);
    const dateRef = useRef<HTMLParagraphElement>(null);
    const timeZoneRef = useRef<HTMLParagraphElement>(null);
    const shootingStarRef = useRef<SVGLineElement>(null);
    const meteorGroupRef = useRef<SVGGElement>(null);
    const ufoBaseRef = useRef<SVGGElement>(null);
    const ufoRef = useRef<SVGGElement>(null);

    // Explicit motion choice mirror for the driver. Toggling writes through
    // this ref and the wrapper attribute, never through React state, so the
    // driver effect (and the night schedule) survives the toggle.
    const [initialChoice] = useState<MotionChoice | null>(() =>
        readMotionChoice(),
    );
    const choiceRef = useRef<MotionChoice | null>(initialChoice);

    function handleMotionChoice(next: MotionChoice) {
        choiceRef.current = next;
        writeMotionChoice(next);
        wrapRef.current?.setAttribute("data-scene-motion", motionMode(next));
    }

    // First-paint values, computed once. Every later update writes through
    // refs and CSS variables, never through React state.
    const initialNow = resolveNow();
    const initialSky = getSkyState(initialNow, TIME_ZONE);
    const initialVars = {
        "--sky-top": initialSky.skyTop,
        "--sky-bottom": initialSky.skyBottom,
        "--star-opacity": String(initialSky.starOpacity),
        "--cloud-opacity": String(initialSky.cloudOpacity),
        "--body-x": `${initialSky.x.toFixed(1)}px`,
        "--body-y": `${initialSky.y.toFixed(1)}px`,
        "--sun-opacity": initialSky.body === "sun" ? "1" : "0",
        "--moon-opacity": initialSky.body === "moon" ? "1" : "0",
    } as CSSProperties;

    /* ---- Sky driver: single 1s timer, no render loop ---- */
    useEffect(() => {
        const wrap = wrapRef.current;
        const svg = svgRef.current;

        if (!wrap || !svg) {
            return;
        }

        // TS can't carry the null-check narrowing into the closures below,
        // so capture the guarded references once.
        const wrapEl: HTMLDivElement = wrap;
        const svgEl: SVGSVGElement = svg;

        const scheduler = createNightScheduler();
        let hasSessionStarted = false;
        let nightElapsed = 0;
        let shootNextAt = 0;
        let timer = 0;
        let debounce = 0;
        let running = false;
        let isIntersecting = false;
        let lastMinute = -1;
        let lastTexts = "";

        function fireStreak() {
            const line = shootingStarRef.current;

            if (!line) {
                return;
            }

            const sx1 = 100 + Math.random() * 600;
            const sy1 = 20 + Math.random() * 60;
            const len = 30 + Math.random() * 40;
            const angle = 0.3 + Math.random() * 0.5;

            line.setAttribute("x1", sx1.toFixed(1));
            line.setAttribute("y1", sy1.toFixed(1));
            line.setAttribute(
                "x2",
                (sx1 + len * Math.cos(angle)).toFixed(1),
            );
            line.setAttribute(
                "y2",
                (sy1 + len * Math.sin(angle)).toFixed(1),
            );
            line.classList.remove("time-shooting");
            void line.getBoundingClientRect();
            line.classList.add("time-shooting");
        }

        function launchMeteorShower() {
            const group = meteorGroupRef.current;

            if (!group) {
                return;
            }

            const lines = Array.from(
                group.querySelectorAll<SVGLineElement>("line"),
            );

            if (lines.length === 0) {
                return;
            }

            const radiantX = 250 + Math.random() * 400;
            const radiantY = -5 + Math.random() * 30;
            const baseAngle = 0.4 + Math.random() * 0.4;
            const n = lines.length;

            const order = Array.from({ length: n }, (_, i) => i);
            for (let i = order.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [order[i], order[j]] = [order[j], order[i]];
            }

            const step =
                (METEOR_SHOWER_DURATION_S - METEOR_STREAK_ANIM_S) / (n - 1);

            lines.forEach((line, i) => {
                const angle = baseAngle + (Math.random() - 0.5) * 0.18;
                const offset =
                    (i - (n - 1) / 2) * (45 + Math.random() * 20);
                const len = 70 + Math.random() * 60;
                const sx1 = radiantX + offset;
                const sy1 = radiantY + (Math.random() - 0.5) * 12;

                line.setAttribute("x1", sx1.toFixed(1));
                line.setAttribute("y1", sy1.toFixed(1));
                line.setAttribute(
                    "x2",
                    (sx1 + len * Math.cos(angle)).toFixed(1),
                );
                line.setAttribute(
                    "y2",
                    (sy1 + len * Math.sin(angle)).toFixed(1),
                );
                line.style.animationDelay =
                    (order[i] * step + (Math.random() - 0.5) * 0.1).toFixed(
                        2,
                    ) + "s";
                line.classList.remove("time-meteor-falling");
                void line.getBoundingClientRect();
                line.classList.add("time-meteor-falling");
            });
        }

        function launchUFO() {
            const ufo = ufoRef.current;
            const base = ufoBaseRef.current;

            if (!ufo || !base) {
                return;
            }

            base.setAttribute("transform", `translate(0, ${UFO_FLIGHT_Y})`);
            ufo.classList.remove("time-ufo-flying");
            void ufo.getBoundingClientRect();
            ufo.classList.add("time-ufo-flying");
            ufo.addEventListener(
                "animationend",
                () => ufo.classList.remove("time-ufo-flying"),
                { once: true },
            );
        }

        function writeSkyVars(
            skyTop: string,
            skyBottom: string,
            starOpacity: number,
            cloudOpacity: number,
            body: string,
            x: number,
            y: number,
        ) {
            svgEl.style.setProperty("--sky-top", skyTop);
            svgEl.style.setProperty("--sky-bottom", skyBottom);
            svgEl.style.setProperty("--star-opacity", String(starOpacity));
            svgEl.style.setProperty("--cloud-opacity", String(cloudOpacity));
            svgEl.style.setProperty("--body-x", `${x.toFixed(1)}px`);
            svgEl.style.setProperty("--body-y", `${y.toFixed(1)}px`);
            svgEl.style.setProperty("--sun-opacity", body === "sun" ? "1" : "0");
            svgEl.style.setProperty(
                "--moon-opacity",
                body === "moon" ? "1" : "0",
            );
        }

        function writeTexts(now: Date, phase: string) {
            const time = formatTime(now);
            const date = formatDate(now);
            const zone = formatTimeZone(now);
            const key = `${phase}|${time}|${date}|${zone}`;

            if (key === lastTexts) {
                return;
            }

            lastTexts = key;

            if (phaseRef.current) {
                phaseRef.current.textContent = phase;
            }

            if (timeRef.current) {
                timeRef.current.textContent = time;
            }

            if (dateRef.current) {
                dateRef.current.textContent = date;
            }

            if (timeZoneRef.current) {
                timeZoneRef.current.textContent = `${TIME_ZONE} · ${zone}`;
            }

            svgEl.setAttribute("aria-label", `Current time scene: ${phase}`);
        }

        function stepNight(isNight: boolean) {
            if (!isNight) {
                // Night ended: drop the session so the next night starts a
                // fresh one. This is the only place the flag resets —
                // visibility flicker never touches it.
                hasSessionStarted = false;
                return;
            }

            if (!hasSessionStarted) {
                hasSessionStarted = true;
                nightElapsed = 0;
                shootNextAt = Math.random() < 0.5 ? 0 : SHOOT_INTERVAL_S;
                scheduler.reset();
            }

            // Night events follow the effective motion state: an explicit
            // pause (or reduced motion without an explicit Play) skips them.
            // The clock, phase, and schedule accounting below keep running.
            const reduceMatches =
                window.matchMedia &&
                window.matchMedia("(prefers-reduced-motion: reduce)")
                    .matches;

            if (effectiveMotion(choiceRef.current, reduceMatches) !== "play") {
                return;
            }

            nightElapsed += TICK_SECONDS;

            if (nightElapsed >= shootNextAt) {
                shootNextAt += SHOOT_INTERVAL_S;
                fireStreak();
            }

            const fired = scheduler.tick(TICK_SECONDS);

            if (fired.ufo) {
                launchUFO();
            }

            if (fired.meteor) {
                launchMeteorShower();
            }
        }

        function step() {
            const now = resolveNow();
            const sky = getSkyState(now, TIME_ZONE);
            const minute = Math.floor(getDecimalTime(now, TIME_ZONE) * 60);

            if (minute !== lastMinute) {
                lastMinute = minute;
                writeSkyVars(
                    sky.skyTop,
                    sky.skyBottom,
                    sky.starOpacity,
                    sky.cloudOpacity,
                    sky.body,
                    sky.x,
                    sky.y,
                );
                writeTexts(now, sky.phase);
            }

            stepNight(sky.isNight);
        }

        function start() {
            if (running) {
                return;
            }

            running = true;
            wrapEl.dataset.sceneActive = "true";
            lastMinute = -1;
            step();
            timer = window.setInterval(step, TICK_MS);
        }

        function stop() {
            if (!running) {
                return;
            }

            running = false;
            wrapEl.dataset.sceneActive = "false";
            window.clearInterval(timer);
        }

        function scheduleVisibilityUpdate() {
            window.clearTimeout(debounce);
            debounce = window.setTimeout(() => {
                if (isIntersecting) {
                    start();
                } else {
                    stop();
                }
            }, VISIBILITY_DEBOUNCE_MS);
        }

        let visibilityObserver: IntersectionObserver | null = null;

        if ("IntersectionObserver" in window) {
            visibilityObserver = new IntersectionObserver(
                (entries) => {
                    isIntersecting = entries[0].isIntersecting;
                    scheduleVisibilityUpdate();
                },
                { threshold: 0.3 },
            );

            visibilityObserver.observe(svgEl);
        } else {
            start();
        }

        function handleVisibilityChange() {
            if (document.hidden) {
                // Tab hidden: freeze the timer and the CSS loops. The
                // scheduler keeps its elapsed time, so showing the tab again
                // resumes the night instead of restarting it.
                window.clearTimeout(debounce);
                stop();
            } else if (isIntersecting) {
                scheduleVisibilityUpdate();
            }
        }

        document.addEventListener("visibilitychange", handleVisibilityChange);

        // bfcache restore: timers may not survive it, so re-evaluate instead
        // of assuming the pre-navigation running state is still valid.
        function handlePageShow() {
            if (!document.hidden && isIntersecting) {
                scheduleVisibilityUpdate();
            }
        }

        window.addEventListener("pageshow", handlePageShow);

        return () => {
            window.clearInterval(timer);
            window.clearTimeout(debounce);
            visibilityObserver?.disconnect();
            document.removeEventListener(
                "visibilitychange",
                handleVisibilityChange,
            );
            window.removeEventListener("pageshow", handlePageShow);
        };
    }, []);

    return (
        <Section id="time">
            <Container>
                <SectionHeading
                    number="06"
                    title="Right Now"
                    id="time"
                />

                <div
                    ref={wrapRef}
                    data-scene-active="true"
                    data-scene-motion={motionMode(initialChoice)}
                    className="
                        relative
                        mt-4
                        overflow-hidden
                        rounded-2xl
                        border
                        border-(--glass-border)
                        bg-(--glass-bg)
                        shadow-[inset_0_1px_0_var(--glass-highlight),0_10px_30px_-20px_rgba(31,38,135,0.12)]
                        backdrop-blur-xl
                        backdrop-saturate-160
                    "
                >
                    <MotionToggle
                        initial={initialChoice}
                        onChoice={handleMotionChoice}
                    />
                    <svg
                        ref={svgRef}
                        viewBox="0 0 900 280"
                        xmlns="http://www.w3.org/2000/svg"
                        style={initialVars}
                        className="block h-auto w-full"
                        role="img"
                        aria-label={`Current time scene: ${initialSky.phase}`}
                    >
                        <defs>
                            {/* Sky */}
                            <linearGradient
                                id="skyGrad"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                            >
                                <stop
                                    className="time-sky-top"
                                    offset="0%"
                                />

                                <stop
                                    className="time-sky-bottom"
                                    offset="100%"
                                />
                            </linearGradient>

                            {/* Atmospheric haze */}
                            <linearGradient
                                id="mist"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                            >
                                <stop
                                    offset="0%"
                                    stopColor="#FFFFFF"
                                    stopOpacity=".18"
                                />

                                <stop
                                    offset="100%"
                                    stopColor="#FFFFFF"
                                    stopOpacity="0"
                                />
                            </linearGradient>

                            {/* Reusable pine tree */}
                            <g id="pineTree">
                                <path d="M0,0 L-9,13 H-3 L-13,27 H-5 L-17,44 H-7 L-22,63 H22 L7,44 H17 L5,27 H13 L3,13 H9 Z" />

                                <rect
                                    x="-2.8"
                                    y="63"
                                    width="5.6"
                                    height="12"
                                    rx="1"
                                />
                            </g>

                            {/* Rare-flyby saucer */}
                            <g id="timeUfoCraft">
                                <ellipse
                                    cx="0"
                                    cy="4"
                                    rx="22"
                                    ry="6"
                                    fill="#8B8FA3"
                                />
                                <ellipse
                                    cx="0"
                                    cy="-1"
                                    rx="10"
                                    ry="7"
                                    fill="#D7DAE6"
                                />
                                <circle
                                    cx="-10"
                                    cy="4.5"
                                    r="1.6"
                                    fill="#FDE68A"
                                />
                                <circle
                                    cx="0"
                                    cy="4.5"
                                    r="1.6"
                                    fill="#FDE68A"
                                />
                                <circle
                                    cx="10"
                                    cy="4.5"
                                    r="1.6"
                                    fill="#FDE68A"
                                />
                            </g>
                        </defs>

                        {/* Sky */}
                        <rect
                            width="900"
                            height="280"
                            fill="url(#skyGrad)"
                        />

                        {/* Stars */}
                        <g className="time-stars">
                            {stars.map(([cx, cy, r], index) => (
                                <circle
                                    key={index}
                                    className="time-star"
                                    cx={cx}
                                    cy={cy}
                                    r={r}
                                    fill="#EDEDEF"
                                />
                            ))}
                        </g>

                        {/* Clouds */}
                        <g className="time-clouds" fill="#FFFFFF">
                            <g className="time-cloud">
                                <ellipse
                                    cx="190"
                                    cy="55"
                                    rx="56"
                                    ry="13"
                                />

                                <ellipse
                                    cx="235"
                                    cy="48"
                                    rx="29"
                                    ry="10"
                                />
                            </g>

                            <g className="time-cloud time-cloud-slow">
                                <ellipse
                                    cx="650"
                                    cy="42"
                                    rx="60"
                                    ry="13"
                                />

                                <ellipse
                                    cx="705"
                                    cy="37"
                                    rx="28"
                                    ry="10"
                                />
                            </g>

                            <g className="time-cloud time-cloud-fast">
                                <ellipse
                                    cx="430"
                                    cy="32"
                                    rx="44"
                                    ry="11"
                                />
                            </g>
                        </g>

                        {/* Rare shooting star — line attributes are set per
                            launch by the driver. */}
                        <line
                            ref={shootingStarRef}
                            className="time-shooting-star"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="0"
                            stroke="#EDEDEF"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                        />

                        {/* Ultra-rare meteor shower burst */}
                        <g
                            ref={meteorGroupRef}
                            stroke="#EDEDEF"
                            strokeWidth="1.4"
                            strokeLinecap="round"
                        >
                            {Array.from({ length: 6 }).map((_, index) => (
                                <line
                                    key={index}
                                    className="time-meteor"
                                    x1="0"
                                    y1="0"
                                    x2="0"
                                    y2="0"
                                />
                            ))}
                        </g>

                        {/* Ultra-rare UFO flyby */}
                        <g
                            ref={ufoBaseRef}
                            transform="translate(0, 90)"
                        >
                            <g ref={ufoRef} className="time-ufo">
                                <use href="#timeUfoCraft" />
                            </g>
                        </g>

                        {/* Atmospheric haze */}
                        <ellipse
                            cx="450"
                            cy="170"
                            rx="380"
                            ry="26"
                            fill="url(#mist)"
                        />

                        {/* Sun / Moon — positioned by CSS variables so the
                            glide stays on the compositor; the idle body
                            crossfades via opacity. */}
                        <g className="time-body">
                            <g className="time-body-sun">
                                <circle
                                    className="time-glow-pulse"
                                    r={SUN_GLOW_RADIUS}
                                    fill={SUN_COLOR}
                                    opacity="0.25"
                                />
                                <circle r={SUN_RADIUS} fill={SUN_COLOR} />
                            </g>

                            <g className="time-body-moon">
                                <circle
                                    className="time-glow-pulse"
                                    r={MOON_GLOW_RADIUS}
                                    fill={MOON_COLOR}
                                    opacity="0.25"
                                />
                                <circle r={MOON_RADIUS} fill={MOON_COLOR} />
                            </g>
                        </g>

                        {/* Far ridge */}
                        <path
                            fill="#6F8D83"
                            d="M0,165 L78,110 L150,48 L235,118 L315,60 L392,138 L450,160 L515,138 L600,62 L675,124 L770,48 L842,116 L900,84 L900,280 L0,280 Z"
                        />

                        {/* Mid ridge */}
                        <path
                            fill="#587C71"
                            d="M0,185 L90,135 L175,72 L260,160 L345,104 L450,196 L565,116 L650,168 L742,76 L826,144 L900,118 L900,280 L0,280 Z"
                        />

                        {/* Main summit layer */}
                        <path
                            fill="#2F6657"
                            d="M0,202 L95,150 L205,92 L292,178 L360,150 L450,238 L540,150 L608,178 L696,92 L805,166 L900,140 L900,280 L0,280 Z"
                        />

                        {/* Rock accents */}
                        <path
                            fill="#7A8B67"
                            opacity=".28"
                            d="M180,88 L215,128 L170,122 Z M684,92 L717,134 L673,126 Z"
                        />

                        {/* Foreground ground */}
                        <path
                            fill="#0B1715"
                            d="M0,255 C145,248 290,247 450,258 C625,270 770,256 900,248 L900,280 L0,280 Z"
                        />

                        {/* Left forest */}
                        <g fill="#06100F">
                            <g transform="translate(18,178) scale(1.45)">
                                <g className="time-tree">
                                    <use href="#pineTree" />
                                </g>
                            </g>

                            <g transform="translate(58,154) scale(1.95)">
                                <g className="time-tree time-tree-slow">
                                    <use href="#pineTree" />
                                </g>
                            </g>

                            <g transform="translate(110,184) scale(1.18)">
                                <g className="time-tree">
                                    <use href="#pineTree" />
                                </g>
                            </g>

                            <g transform="translate(150,164) scale(1.78)">
                                <g className="time-tree time-tree-slow">
                                    <use href="#pineTree" />
                                </g>
                            </g>

                            <g transform="translate(200,176) scale(1.52)">
                                <g className="time-tree">
                                    <use href="#pineTree" />
                                </g>
                            </g>

                            <g transform="translate(248,196) scale(0.95)">
                                <g className="time-tree">
                                    <use href="#pineTree" />
                                </g>
                            </g>
                        </g>

                        {/* Right forest */}
                        <g fill="#06100F">
                            <g transform="translate(660,190) scale(1.02)">
                                <g className="time-tree">
                                    <use href="#pineTree" />
                                </g>
                            </g>

                            <g transform="translate(708,176) scale(1.48)">
                                <g className="time-tree time-tree-slow">
                                    <use href="#pineTree" />
                                </g>
                            </g>

                            <g transform="translate(760,154) scale(1.92)">
                                <g className="time-tree">
                                    <use href="#pineTree" />
                                </g>
                            </g>

                            <g transform="translate(822,180) scale(1.36)">
                                <g className="time-tree time-tree-slow">
                                    <use href="#pineTree" />
                                </g>
                            </g>

                            <g transform="translate(872,152) scale(2.02)">
                                <g className="time-tree">
                                    <use href="#pineTree" />
                                </g>
                            </g>
                        </g>
                    </svg>

                    {/* Time information */}
                    <div
                        className="
                            flex
                            flex-wrap
                            items-center
                            justify-between
                            gap-3
                            border-t
                            border-(--line)
                            p-5
                            sm:p-6
                        "
                    >
                        <div>
                            <p
                                ref={phaseRef}
                                className="
                                    mb-1
                                    font-mono
                                    text-[10.5px]
                                    uppercase
                                    tracking-widest
                                    text-(--graphite-soft)
                                "
                            >
                                {initialSky.phase}
                            </p>

                            <p
                                ref={timeRef}
                                className="
                                    font-display
                                    text-[30px]
                                    leading-none
                                    text-(--ink)
                                "
                            >
                                {formatTime(initialNow)}
                            </p>
                        </div>

                        <div className="text-right">
                            <p
                                ref={dateRef}
                                className="
                                    font-mono
                                    text-[11.5px]
                                    text-(--graphite)
                                "
                            >
                                {formatDate(initialNow)}
                            </p>

                            <p
                                ref={timeZoneRef}
                                className="
                                    mt-0.5
                                    font-mono
                                    text-[10.5px]
                                    text-(--graphite-soft)
                                "
                            >
                                {TIME_ZONE} · {formatTimeZone(initialNow)}
                            </p>
                        </div>
                    </div>
                </div>

                <p
                    className="
                        mt-3
                        font-mono
                        text-[11px]
                        italic
                        text-(--graphite-soft)
                    "
                >
                    "Seize the day, then let it go."
                </p>
            </Container>
        </Section>
    );
}
