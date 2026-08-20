import { useEffect, useRef, useState } from "react";

import { Container, Section } from "@/components/layout";
import { SectionHeading } from "@/components/ui";

import {
    formatDate,
    formatTime,
    formatTimeZone,
    getDecimalHour,
    getPhase,
    getSkyConfig,
    TIME_ZONE,
} from "./timeUtils";

import type { TimePhase } from "./timeUtils";

type TimeState = {
    phase: TimePhase;
    time: string;
    dateLabel: string;
    timeZoneLabel: string;
    skyTop: string;
    skyBottom: string;
    starOpacity: number;
    cloudOpacity: number;
};

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

/* ---- Animation constants (ported from the Right-Now reference) ---- */

// Asia/Manila is fixed at UTC+8 (no DST), so the fractional hour can be
// derived from the epoch cheaply on every frame.
const MANILA_OFFSET_MS = 8 * 60 * 60 * 1000;

const SUNRISE = 6.0;
const SUNSET = 18.65;
const HORIZON = 210;
const AMP = 180;
const MARGIN = 70;
const WIDTH = 900;
const RISE_EASE = 0.32;
const RISE_LEAD_FRAC = 0.125;

const SHOOT_INTERVAL_MS = 2500;
const METEOR_STREAK_ANIM_S = 0.7;
const METEOR_SHOWER_DURATION_S = 5;
const UFO_EARLY_SLOT_WIN = 4;
const UFO_EARLY_SLOT_LOSE = 7;
const COMBO_TIME = 16;
const UFO_FINAL_TIME = 32;
const METEOR_TAIL_INTERVAL = 8;
const VISIBILITY_DEBOUNCE_MS = 400;

const SUN_COLOR = "#F7D88A";
const MOON_COLOR = "#EDEEF5";

function clamp(value: number, low: number, high: number) {
    return Math.max(low, Math.min(high, value));
}

function leadRemap(rawF: number) {
    return RISE_LEAD_FRAC + (1 - RISE_LEAD_FRAC) * rawF;
}

function arcPos(f: number): [number, number] {
    const x = MARGIN + f * (WIDTH - 2 * MARGIN);
    const y =
        HORIZON -
        AMP * Math.pow(Math.sin(Math.PI * f), RISE_EASE);
    return [x, y];
}

function createNightScheduler() {
    let elapsed = 0;
    let ufoTimes: number[] = [];
    let ufoIndex = 0;
    let meteorFixedTimes: number[] = [];
    let meteorIndex = 0;
    let meteorTailNext: number | null = null;

    function reset() {
        elapsed = 0;
        const ufoWonCoinToss = Math.random() < 0.5;
        ufoTimes = [
            ufoWonCoinToss
                ? UFO_EARLY_SLOT_WIN
                : UFO_EARLY_SLOT_LOSE,
            COMBO_TIME,
            UFO_FINAL_TIME,
        ];
        ufoIndex = 0;
        meteorFixedTimes = ufoWonCoinToss
            ? [COMBO_TIME]
            : [UFO_EARLY_SLOT_WIN, COMBO_TIME];
        meteorIndex = 0;
        meteorTailNext = null;
    }

    function tick(dtSeconds: number) {
        elapsed += dtSeconds;
        const fired = { ufo: false, meteor: false };

        if (
            ufoIndex < ufoTimes.length &&
            elapsed >= ufoTimes[ufoIndex]
        ) {
            ufoIndex++;
            fired.ufo = true;
        }

        if (meteorIndex < meteorFixedTimes.length) {
            if (elapsed >= meteorFixedTimes[meteorIndex]) {
                meteorIndex++;
                fired.meteor = true;
                if (meteorIndex >= meteorFixedTimes.length) {
                    meteorTailNext =
                        COMBO_TIME + METEOR_TAIL_INTERVAL;
                }
            }
        } else if (
            meteorTailNext !== null &&
            elapsed >= meteorTailNext
        ) {
            meteorTailNext += METEOR_TAIL_INTERVAL;
            fired.meteor = true;
        }

        return fired;
    }

    reset();
    return { reset, tick };
}

function getTimeState(): TimeState {
    const date = new Date();

    const decimalHour = getDecimalHour(date);
    const phase = getPhase(decimalHour);
    const sky = getSkyConfig(phase);

    return {
        phase,
        time: formatTime(date),
        dateLabel: formatDate(date),
        timeZoneLabel: formatTimeZone(date),
        ...sky,
    };
}

export function TimeSection() {
    const [timeState, setTimeState] =
        useState<TimeState>(getTimeState);

    const svgRef = useRef<SVGSVGElement>(null);
    const celestialRef = useRef<SVGCircleElement>(null);
    const celestialGlowRef = useRef<SVGCircleElement>(null);
    const shootingStarRef = useRef<SVGLineElement>(null);
    const meteorGroupRef = useRef<SVGGElement>(null);
    const ufoBaseRef = useRef<SVGGElement>(null);
    const ufoRef = useRef<SVGGElement>(null);

    useEffect(() => {
        const interval = window.setInterval(() => {
            setTimeState(getTimeState());
        }, 1_000);

        return () => {
            window.clearInterval(interval);
        };
    }, []);

    /* ---- Dynamic sky: sun/moon arc + rare night events ---- */
    useEffect(() => {
        const svg = svgRef.current;
        const celestial = celestialRef.current;
        const glow = celestialGlowRef.current;
        const shootingStar = shootingStarRef.current;

        if (!svg || !celestial || !glow) {
            return;
        }

        // TS can't carry the null-check narrowing into the closures below,
        // so capture the guarded references once.
        const celestialEl: SVGCircleElement = celestial;
        const glowEl: SVGCircleElement = glow;

        const reduceMotion =
            window.matchMedia &&
            window.matchMedia(
                "(prefers-reduced-motion: reduce)",
            ).matches;

        // Debounced visibility gate: only the *stable* in-view state may
        // start a night session, so a mid-scroll flicker never resets it.
        let isIntersecting = false;
        let cardVisible = false;
        let visibilityDebounceTimer: number | undefined;
        let hasSessionStarted = false;
        let nightElapsed = 0;
        let shootNextAt = 0;
        let lastSecond = -1;
        let lastFrameTs = 0;
        let rafId = 0;
        let visibilityObserver: IntersectionObserver | null = null;

        const scheduler = createNightScheduler();

        function fireStreak(line: SVGLineElement | null) {
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

            const order = Array.from(
                { length: n },
                (_, i) => i,
            );
            for (let i = order.length - 1; i > 0; i--) {
                const j = Math.floor(
                    Math.random() * (i + 1),
                );
                [order[i], order[j]] = [
                    order[j],
                    order[i],
                ];
            }

            const step =
                (METEOR_SHOWER_DURATION_S -
                    METEOR_STREAK_ANIM_S) /
                (n - 1);

            lines.forEach((line, i) => {
                const angle =
                    baseAngle + (Math.random() - 0.5) * 0.18;
                const offset =
                    (i - (n - 1) / 2) *
                    (45 + Math.random() * 20);
                const len = 70 + Math.random() * 60;
                const sx1 = radiantX + offset;
                const sy1 =
                    radiantY + (Math.random() - 0.5) * 12;

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
                line.style.animationDelay = (
                    order[i] * step +
                    (Math.random() - 0.5) * 0.1
                ).toFixed(2) + "s";
                line.classList.remove(
                    "time-meteor-falling",
                );
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

            base.setAttribute("transform", "translate(0, 55)");
            ufo.classList.remove("time-ufo-flying");
            void ufo.getBoundingClientRect();
            ufo.classList.add("time-ufo-flying");
        }

        function setCelestialState(
            useMoon: boolean,
        ) {
            const bodyColor = useMoon
                ? MOON_COLOR
                : SUN_COLOR;
            const bodyRadius = useMoon ? 13 : 19;
            const glowRadius = useMoon ? 30 : 44;

            celestialEl.setAttribute(
                "r",
                String(bodyRadius),
            );
            celestialEl.setAttribute("fill", bodyColor);
            glowEl.setAttribute("r", String(glowRadius));
            glowEl.setAttribute("fill", bodyColor);
        }

        function tick(now: number) {
            const dt = Math.min(now - lastFrameTs, 100);
            lastFrameTs = now;

            const t =
                ((Date.now() + MANILA_OFFSET_MS) / 3600000) %
                24;

            const isNight = t >= SUNSET || t < SUNRISE;

            const sunF =
                clamp(
                    (t - (SUNRISE - 0.7)) / 0.7,
                    0,
                    1,
                ) *
                clamp(
                    ((SUNSET + 0.7) - t) / 0.7,
                    0,
                    1,
                );
            const useMoon = sunF < 0.5;

            // Sun: rises at SUNRISE, sets at SUNSET.
            const dayFRaw = clamp(
                (t - SUNRISE) / (SUNSET - SUNRISE),
                0,
                1,
            );
            const dayF = leadRemap(dayFRaw);
            const [sunX, sunY] = arcPos(dayF);

            // Moon: continues the same arc through the night.
            const nightSpan = 24 - SUNSET + SUNRISE;
            const tNight =
                t >= SUNSET
                    ? t - SUNSET
                    : t + 24 - SUNSET;
            const nightFRaw = clamp(
                tNight / nightSpan,
                0,
                1,
            );
            const nightF = leadRemap(nightFRaw);
            const [moonX, moonY] = arcPos(nightF);

            const [cx, cy] = useMoon
                ? [moonX, moonY]
                : [sunX, sunY];

            celestialEl.setAttribute("cx", cx.toFixed(2));
            celestialEl.setAttribute("cy", cy.toFixed(2));
            glowEl.setAttribute("cx", cx.toFixed(2));
            glowEl.setAttribute("cy", cy.toFixed(2));

            const thisSecond = Math.floor(
                Date.now() / 1000,
            );

            if (thisSecond !== lastSecond) {
                lastSecond = thisSecond;
                setCelestialState(useMoon);

                if (!isNight) {
                    hasSessionStarted = false;
                } else if (
                    !hasSessionStarted &&
                    cardVisible
                ) {
                    hasSessionStarted = true;
                    nightElapsed = 0;
                    shootNextAt =
                        Math.random() < 0.5
                            ? 0
                            : SHOOT_INTERVAL_MS;
                    scheduler.reset();
                }
            }

            if (
                isNight &&
                hasSessionStarted &&
                cardVisible
            ) {
                nightElapsed += dt;

                if (nightElapsed >= shootNextAt) {
                    shootNextAt += SHOOT_INTERVAL_MS;
                    fireStreak(shootingStar);
                }

                const fired = scheduler.tick(dt / 1000);

                if (fired.ufo) {
                    launchUFO();
                }

                if (fired.meteor) {
                    launchMeteorShower();
                }
            }

            rafId = requestAnimationFrame(tick);
        }

        if (reduceMotion) {
            // Static but sensible placement for reduced-motion users.
            const t =
                ((Date.now() + MANILA_OFFSET_MS) / 3600000) %
                24;
            const sunF =
                clamp(
                    (t - (SUNRISE - 0.7)) / 0.7,
                    0,
                    1,
                ) *
                clamp(
                    ((SUNSET + 0.7) - t) / 0.7,
                    0,
                    1,
                );
            const useMoon = sunF < 0.5;
            const dayFRaw = clamp(
                (t - SUNRISE) / (SUNSET - SUNRISE),
                0,
                1,
            );
            const [sunX, sunY] = arcPos(leadRemap(dayFRaw));
            const nightSpan = 24 - SUNSET + SUNRISE;
            const tNight =
                t >= SUNSET
                    ? t - SUNSET
                    : t + 24 - SUNSET;
            const [moonX, moonY] = arcPos(
                leadRemap(clamp(tNight / nightSpan, 0, 1)),
            );
            const [cx, cy] = useMoon
                ? [moonX, moonY]
                : [sunX, sunY];

            celestialEl.setAttribute("cx", cx.toFixed(2));
            celestialEl.setAttribute("cy", cy.toFixed(2));
            glowEl.setAttribute("cx", cx.toFixed(2));
            glowEl.setAttribute("cy", cy.toFixed(2));
            setCelestialState(useMoon);
            return;
        }

        if ("IntersectionObserver" in window) {
            visibilityObserver = new IntersectionObserver(
                (entries) => {
                    isIntersecting = entries[0].isIntersecting;

                    if (visibilityDebounceTimer) {
                        window.clearTimeout(
                            visibilityDebounceTimer,
                        );
                    }

                    visibilityDebounceTimer =
                        window.setTimeout(() => {
                            cardVisible = isIntersecting;
                        }, VISIBILITY_DEBOUNCE_MS);
                },
                { threshold: 0.3 },
            );

            visibilityObserver.observe(svg);
        } else {
            cardVisible = true;
        }

        rafId = requestAnimationFrame(tick);

        return () => {
            cancelAnimationFrame(rafId);

            visibilityObserver?.disconnect();

            if (visibilityDebounceTimer) {
                window.clearTimeout(
                    visibilityDebounceTimer,
                );
            }
        };
    }, []);

    return (
        <Section id="time">
            <Container>
                <SectionHeading
                    number="06"
                    title="Right Now"
                />

                <div
                    className="
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
                    <svg
                        ref={svgRef}
                        viewBox="0 0 900 280"
                        xmlns="http://www.w3.org/2000/svg"
                        className="block h-auto w-full"
                        role="img"
                        aria-label={`Current time scene: ${timeState.phase}`}
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
                                    className="time-sky-stop"
                                    offset="0%"
                                    stopColor={
                                        timeState.skyTop
                                    }
                                />

                                <stop
                                    className="time-sky-stop"
                                    offset="100%"
                                    stopColor={
                                        timeState.skyBottom
                                    }
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

                            {/* Celestial glow */}
                            <filter
                                id="glow"
                                x="-60%"
                                y="-60%"
                                width="220%"
                                height="220%"
                            >
                                <feGaussianBlur
                                    stdDeviation="8"
                                    result="blur"
                                />

                                <feMerge>
                                    <feMergeNode in="blur" />
                                    <feMergeNode in="SourceGraphic" />
                                </feMerge>
                            </filter>

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
                        <g
                            style={{
                                opacity:
                                    timeState.starOpacity,
                                transition:
                                    "opacity 2s ease",
                            }}
                        >
                            {stars.map(
                                ([cx, cy, r], index) => (
                                    <circle
                                        key={index}
                                        className="time-star"
                                        cx={cx}
                                        cy={cy}
                                        r={r}
                                        fill="#EDEDEF"
                                    />
                                ),
                            )}
                        </g>

                        {/* Clouds */}
                        <g
                            fill="#FFFFFF"
                            style={{
                                opacity:
                                    timeState.cloudOpacity,
                                transition:
                                    "opacity 2s ease",
                            }}
                        >
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
                            launch by the animation loop. */}
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
                            {Array.from({ length: 6 }).map(
                                (_, index) => (
                                    <line
                                        key={index}
                                        className="time-meteor"
                                        x1="0"
                                        y1="0"
                                        x2="0"
                                        y2="0"
                                    />
                                ),
                            )}
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

                        {/* Sun / Moon glow — position is animated by the
                            RAF loop; CSS adds the pulsing breathe. */}
                        <circle
                            ref={celestialGlowRef}
                            className="time-glow-pulse time-celestial"
                            cx="450"
                            cy="130"
                            r="30"
                            fill="#C7CBDA"
                            opacity="0.2"
                            filter="url(#glow)"
                        />

                        {/* Sun / Moon */}
                        <circle
                            ref={celestialRef}
                            className="time-celestial"
                            cx="450"
                            cy="130"
                            r="13"
                            fill="#C7CBDA"
                        />

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
                                className="
                                    mb-1
                                    font-mono
                                    text-[10.5px]
                                    uppercase
                                    tracking-widest
                                    text-(--graphite-soft)
                                "
                            >
                                {timeState.phase}
                            </p>

                            <p
                                className="
                                    font-display
                                    text-[30px]
                                    leading-none
                                    text-(--ink)
                                "
                            >
                                {timeState.time}
                            </p>
                        </div>

                        <div className="text-right">
                            <p
                                className="
                                    font-mono
                                    text-[11.5px]
                                    text-(--graphite)
                                "
                            >
                                {timeState.dateLabel}
                            </p>

                            <p
                                className="
                                    mt-0.5
                                    font-mono
                                    text-[10.5px]
                                    text-(--graphite-soft)
                                "
                            >
                                {TIME_ZONE} ·{" "}
                                {timeState.timeZoneLabel}
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