export const TIME_ZONE = "Asia/Manila";

export type TimePhase = "Dawn" | "Day" | "Dusk" | "Night";

export type SkyConfig = {
    skyTop: string;
    skyBottom: string;
    celestialColor: string;
    celestialY: number;
    celestialGlow: number;
    starOpacity: number;
    cloudOpacity: number;
};

export function getDecimalHour(date: Date) {
    const parts = new Intl.DateTimeFormat("en-US", {
        timeZone: TIME_ZONE,
        hour: "numeric",
        minute: "numeric",
        hour12: false,
    }).formatToParts(date);

    const hour = Number(
        parts.find((part) => part.type === "hour")?.value ?? 0
    );

    const minute = Number(
        parts.find((part) => part.type === "minute")?.value ?? 0
    );

    return hour + minute / 60;
}

export function getPhase(decimalHour: number): TimePhase {
    if (decimalHour >= 5 && decimalHour < 7) {
        return "Dawn";
    }

    if (decimalHour >= 7 && decimalHour < 17) {
        return "Day";
    }

    if (decimalHour >= 17 && decimalHour < 19) {
        return "Dusk";
    }

    return "Night";
}

export function getSkyConfig(
    phase: TimePhase,
    decimalHour: number,
): SkyConfig {
    switch (phase) {
        case "Dawn":
            return {
                skyTop: "#243447",
                skyBottom: "#D59A78",
                celestialColor: "#FFD27D",
                celestialY:
                    120 - (decimalHour - 5) * 45,
                celestialGlow: 0.45,
                starOpacity: 0.25,
                cloudOpacity: 0.7,
            };

        case "Day":
            return {
                skyTop: "#75A9C4",
                skyBottom: "#DCE8E2",
                celestialColor: "#FFF1B8",
                celestialY: 70,
                celestialGlow: 0.6,
                starOpacity: 0,
                cloudOpacity: 0.8,
            };

        case "Dusk":
            return {
                skyTop: "#4B506B",
                skyBottom: "#D57C67",
                celestialColor: "#FFD18A",
                celestialY:
                    100 + (decimalHour - 17) * 35,
                celestialGlow: 0.4,
                starOpacity: 0.35,
                cloudOpacity: 0.65,
            };

        case "Night":
            return {
                skyTop: "#0B0C14",
                skyBottom: "#181B2C",
                celestialColor: "#C7CBDA",
                celestialY: 105,
                celestialGlow: 0.2,
                starOpacity: 1,
                cloudOpacity: 0.25,
            };
    }
}

export function formatTime(date: Date) {
    return new Intl.DateTimeFormat("en-US", {
        timeZone: TIME_ZONE,
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    }).format(date);
}

export function formatDate(date: Date) {
    return new Intl.DateTimeFormat("en-US", {
        timeZone: TIME_ZONE,
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
    }).format(date);
}

export function formatTimeZone(date: Date) {
    return (
        new Intl.DateTimeFormat("en-US", {
            timeZone: TIME_ZONE,
            timeZoneName: "short",
        })
            .formatToParts(date)
            .find(
                (part) =>
                    part.type === "timeZoneName",
            )?.value ?? "PHT"
    );
}