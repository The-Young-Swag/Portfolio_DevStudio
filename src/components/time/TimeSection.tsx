import { useEffect, useState } from "react";

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

type TimeState = {
    phase: ReturnType<typeof getPhase>;
    time: string;
    dateLabel: string;
    timeZoneLabel: string;
    celestialY: number;
    celestialColor: string;
    celestialGlow: number;
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

function getTimeState(): TimeState {
    const date = new Date();

    const decimalHour = getDecimalHour(date);
    const phase = getPhase(decimalHour);
    const sky = getSkyConfig(
        phase,
        decimalHour,
    );

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

    useEffect(() => {
        const interval = window.setInterval(() => {
            setTimeState(getTimeState());
        }, 30_000);

        return () => {
            window.clearInterval(interval);
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
                        rounded-lg
                        border
                        border-neutral-200
                    "
                >
                    <svg
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
                                    offset="0%"
                                    stopColor={
                                        timeState.skyTop
                                    }
                                />

                                <stop
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

                        {/* Atmospheric haze */}
                        <ellipse
                            cx="450"
                            cy="170"
                            rx="380"
                            ry="26"
                            fill="url(#mist)"
                        />

                        {/* Sun / Moon glow */}
                        <circle
                            cx="450"
                            cy={timeState.celestialY}
                            r="36"
                            fill={
                                timeState.celestialColor
                            }
                            opacity={
                                timeState.celestialGlow
                            }
                            filter="url(#glow)"
                            style={{
                                transition:
                                    "cy 2s ease, fill 2s ease, opacity 2s ease",
                            }}
                        />

                        {/* Sun / Moon */}
                        <circle
                            cx="450"
                            cy={timeState.celestialY}
                            r="16"
                            fill={
                                timeState.celestialColor
                            }
                            style={{
                                transition:
                                    "cy 2s ease, fill 2s ease",
                            }}
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
                            <g
                                transform="translate(18,178) scale(1.45)"
                                className="time-tree"
                            >
                                <use href="#pineTree" />
                            </g>

                            <g
                                transform="translate(58,154) scale(1.95)"
                                className="time-tree time-tree-slow"
                            >
                                <use href="#pineTree" />
                            </g>

                            <g
                                transform="translate(110,184) scale(1.18)"
                                className="time-tree"
                            >
                                <use href="#pineTree" />
                            </g>

                            <g
                                transform="translate(150,164) scale(1.78)"
                                className="time-tree time-tree-slow"
                            >
                                <use href="#pineTree" />
                            </g>

                            <g
                                transform="translate(200,176) scale(1.52)"
                                className="time-tree"
                            >
                                <use href="#pineTree" />
                            </g>

                            <g
                                transform="translate(248,196) scale(0.95)"
                                className="time-tree"
                            >
                                <use href="#pineTree" />
                            </g>
                        </g>

                        {/* Right forest */}
                        <g fill="#06100F">
                            <g
                                transform="translate(660,190) scale(1.02)"
                                className="time-tree"
                            >
                                <use href="#pineTree" />
                            </g>

                            <g
                                transform="translate(708,176) scale(1.48)"
                                className="time-tree time-tree-slow"
                            >
                                <use href="#pineTree" />
                            </g>

                            <g
                                transform="translate(760,154) scale(1.92)"
                                className="time-tree"
                            >
                                <use href="#pineTree" />
                            </g>

                            <g
                                transform="translate(822,180) scale(1.36)"
                                className="time-tree time-tree-slow"
                            >
                                <use href="#pineTree" />
                            </g>

                            <g
                                transform="translate(872,152) scale(2.02)"
                                className="time-tree"
                            >
                                <use href="#pineTree" />
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
                            border-neutral-200
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
                                    tracking-[0.1em]
                                    text-neutral-500
                                "
                            >
                                {timeState.phase}
                            </p>

                            <p
                                className="
                                    font-display
                                    text-[30px]
                                    leading-none
                                    text-neutral-950
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
                                    text-neutral-500
                                "
                            >
                                {timeState.dateLabel}
                            </p>

                            <p
                                className="
                                    mt-0.5
                                    font-mono
                                    text-[10.5px]
                                    text-neutral-500
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
                        text-neutral-500
                    "
                >
                    "Time is an illusion. Lunchtime doubly so."
                    — Douglas Adams
                </p>
            </Container>
        </Section>
    );
}