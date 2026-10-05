import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
    getDecimalTime,
    getSkyState,
    SKY_SUNRISE,
} from "../src/components/time/skyState.js";
import { getSkyConfig, TIME_ZONE } from "../src/components/time/timeUtils.js";

function manila(hour: number, minute = 0) {
    return new Date(Date.UTC(2026, 9, 5, hour - 8, minute));
}

describe("getDecimalTime", () => {
    it("converts a UTC instant to Manila wall time", () => {
        assert.equal(
            getDecimalTime(new Date(Date.UTC(2026, 9, 5, 2, 30)), TIME_ZONE),
            10.5,
        );
    });

    it("handles midnight as hour zero", () => {
        assert.equal(
            getDecimalTime(new Date(Date.UTC(2026, 9, 4, 16, 0)), TIME_ZONE),
            0,
        );
    });

    it("survives DST edges in zones that observe it", () => {
        // US spring forward 2026-03-08: 01:30 EST exists, 03:30 EDT exists.
        assert.equal(
            getDecimalTime(
                new Date(Date.UTC(2026, 2, 8, 6, 30)),
                "America/New_York",
            ),
            1.5,
        );
        assert.equal(
            getDecimalTime(
                new Date(Date.UTC(2026, 2, 8, 7, 30)),
                "America/New_York",
            ),
            3.5,
        );
        // The skipped 02:30 local time resolves instead of throwing.
        assert.ok(
            Number.isFinite(
                getDecimalTime(
                    new Date(Date.UTC(2026, 2, 8, 7, 0)),
                    "America/New_York",
                ),
            ),
        );
    });
});

describe("getSkyState phases", () => {
    const cases: Array<[number, number, string]> = [
        [0, 0, "Night"],
        [4, 59, "Night"],
        [5, 0, "Dawn"],
        [5, 30, "Dawn"],
        [6, 59, "Dawn"],
        [7, 0, "Day"],
        [12, 0, "Day"],
        [16, 59, "Day"],
        [17, 0, "Dusk"],
        [18, 0, "Dusk"],
        [18, 59, "Dusk"],
        [19, 0, "Night"],
        [22, 0, "Night"],
    ];

    for (const [hour, minute, phase] of cases) {
        it(`labels ${hour}:${minute} as ${phase}`, () => {
            assert.equal(getSkyState(manila(hour, minute)).phase, phase);
        });
    }

    it("matches the sky colours of its phase", () => {
        for (const [hour, phase] of [
            [5, "Dawn"],
            [12, "Day"],
            [18, "Dusk"],
            [23, "Night"],
        ] as const) {
            const sky = getSkyState(manila(hour));
            const config = getSkyConfig(phase);
            assert.equal(sky.skyTop, config.skyTop);
            assert.equal(sky.skyBottom, config.skyBottom);
            assert.equal(sky.starOpacity, config.starOpacity);
            assert.equal(sky.cloudOpacity, config.cloudOpacity);
        }
    });
});

describe("getSkyState bodies", () => {
    it("shows the sun at noon and the moon at midnight", () => {
        assert.equal(getSkyState(manila(12)).body, "sun");
        assert.equal(getSkyState(manila(0)).body, "moon");
    });

    it("keeps the sun up through dusk and swaps after sunset", () => {
        assert.equal(getSkyState(manila(18)).body, "sun");
        assert.equal(getSkyState(manila(20)).body, "moon");
    });

    it("keeps positions inside the scene", () => {
        for (let hour = 0; hour < 24; hour++) {
            const sky = getSkyState(manila(hour));
            assert.ok(sky.x >= 60 && sky.x <= 840, `x at ${hour}h`);
            assert.ok(sky.y >= 20 && sky.y <= 215, `y at ${hour}h`);
        }
    });

    it("moves the sun across the sky during the day", () => {
        let previous = -Infinity;
        for (let hour = SKY_SUNRISE; hour <= 18; hour++) {
            const sky = getSkyState(manila(hour));
            assert.equal(sky.body, "sun");
            assert.ok(sky.x > previous, `sun x at ${hour}h`);
            previous = sky.x;
        }
    });

    it("moves the moon across the sky during the night", () => {
        let previous = -Infinity;
        for (const hour of [20, 22, 0, 2, 4]) {
            const sky = getSkyState(manila(hour));
            assert.equal(sky.body, "moon");
            assert.ok(sky.x > previous, `moon x at ${hour}h`);
            previous = sky.x;
        }
    });

    it("flags night from star visibility", () => {
        assert.equal(getSkyState(manila(12)).isNight, false);
        assert.equal(getSkyState(manila(6)).isNight, false);
        assert.equal(getSkyState(manila(22)).isNight, true);
    });
});
