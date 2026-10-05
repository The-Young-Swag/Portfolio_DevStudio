import {
    getPhase,
    getSkyConfig,
    TIME_ZONE,
    type TimePhase,
} from "./timeUtils.js";

export const SKY_SUNRISE = 6.0;
export const SKY_SUNSET = 18.65;

const SKY_HORIZON = 210;
const SKY_AMPLITUDE = 180;
const SKY_MARGIN = 70;
const SKY_WIDTH = 900;
const SKY_RISE_EASE = 0.32;
const SKY_RISE_LEAD_FRAC = 0.125;

export const SUN_COLOR = "#F7D88A";
export const MOON_COLOR = "#EDEEF5";

export const SUN_RADIUS = 19;
export const MOON_RADIUS = 13;
export const SUN_GLOW_RADIUS = 44;
export const MOON_GLOW_RADIUS = 30;

export type SkyBody = "sun" | "moon";

export type SkyState = {
    phase: TimePhase;
    skyTop: string;
    skyBottom: string;
    starOpacity: number;
    cloudOpacity: number;
    body: SkyBody;
    x: number;
    y: number;
    isNight: boolean;
};

function clamp(value: number, low: number, high: number) {
    return Math.max(low, Math.min(high, value));
}

function leadRemap(rawF: number) {
    return SKY_RISE_LEAD_FRAC + (1 - SKY_RISE_LEAD_FRAC) * rawF;
}

function arcPosition(f: number): { x: number; y: number } {
    return {
        x: SKY_MARGIN + f * (SKY_WIDTH - 2 * SKY_MARGIN),
        y:
            SKY_HORIZON -
            SKY_AMPLITUDE * Math.pow(Math.sin(Math.PI * f), SKY_RISE_EASE),
    };
}

export function getDecimalTime(date: Date, timeZone: string): number {
    const parts = new Intl.DateTimeFormat("en-US", {
        timeZone,
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
        hour12: false,
    }).formatToParts(date);

    const find = (type: string) =>
        Number(parts.find((part) => part.type === type)?.value ?? 0);

    const hours = find("hour") % 24;

    return hours + find("minute") / 60 + find("second") / 3600;
}

export function getSkyState(date: Date, timeZone: string = TIME_ZONE): SkyState {
    const t = getDecimalTime(date, timeZone);
    const phase = getPhase(t);
    const sky = getSkyConfig(phase);

    const sunF =
        clamp((t - (SKY_SUNRISE - 0.7)) / 0.7, 0, 1) *
        clamp((SKY_SUNSET + 0.7 - t) / 0.7, 0, 1);
    const body: SkyBody = sunF < 0.5 ? "moon" : "sun";

    const dayF = leadRemap(
        clamp((t - SKY_SUNRISE) / (SKY_SUNSET - SKY_SUNRISE), 0, 1),
    );
    const sun = arcPosition(dayF);

    const nightSpan = 24 - SKY_SUNSET + SKY_SUNRISE;
    const tNight = t >= SKY_SUNSET ? t - SKY_SUNSET : t + 24 - SKY_SUNSET;
    const nightF = leadRemap(clamp(tNight / nightSpan, 0, 1));
    const moon = arcPosition(nightF);

    const position = body === "moon" ? moon : sun;

    return {
        phase,
        skyTop: sky.skyTop,
        skyBottom: sky.skyBottom,
        starOpacity: sky.starOpacity,
        cloudOpacity: sky.cloudOpacity,
        body,
        x: position.x,
        y: position.y,
        isNight: sky.starOpacity > 0.3,
    };
}
