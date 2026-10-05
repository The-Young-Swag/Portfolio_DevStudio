import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
    COMBO_TIME,
    createNightScheduler,
    METEOR_TAIL_INTERVAL,
    UFO_EARLY_SLOT_LOSE,
    UFO_EARLY_SLOT_WIN,
    UFO_FINAL_TIME,
    type NightScheduler,
} from "../src/components/time/nightScheduler.js";

function withRandom(value: number, run: () => void) {
    const original = Math.random;
    Math.random = () => value;
    try {
        run();
    } finally {
        Math.random = original;
    }
}

function collectFires(scheduler: NightScheduler, totalSeconds: number) {
    const ufo: number[] = [];
    const meteor: number[] = [];

    for (let second = 1; second <= totalSeconds; second++) {
        const fired = scheduler.tick(1);
        if (fired.ufo) ufo.push(second);
        if (fired.meteor) meteor.push(second);
    }

    return { ufo, meteor };
}

describe("night scheduler", () => {
    it("pins the deterministic schedule", () => {
        assert.equal(UFO_EARLY_SLOT_WIN, 4);
        assert.equal(UFO_EARLY_SLOT_LOSE, 7);
        assert.equal(COMBO_TIME, 16);
        assert.equal(UFO_FINAL_TIME, 32);
        assert.equal(METEOR_TAIL_INTERVAL, 8);
    });

    it("fires nothing before the first slot", () => {
        withRandom(0.1, () => {
            const scheduler = createNightScheduler();
            assert.deepEqual(scheduler.tick(0), { ufo: false, meteor: false });
            assert.deepEqual(scheduler.tick(3.9), {
                ufo: false,
                meteor: false,
            });
        });
    });

    it("gives the UFO the early slot when it wins the toss", () => {
        withRandom(0.1, () => {
            const { ufo, meteor } = collectFires(
                createNightScheduler(),
                40,
            );
            assert.deepEqual(ufo, [4, 16, 32]);
            assert.deepEqual(meteor, [16, 24, 32, 40]);
        });
    });

    it("delays the loser instead of skipping it", () => {
        withRandom(0.9, () => {
            const { ufo, meteor } = collectFires(
                createNightScheduler(),
                40,
            );
            assert.deepEqual(ufo, [7, 16, 32]);
            assert.deepEqual(meteor, [4, 16, 24, 32, 40]);
        });
    });

    it("fires at most one event per kind per tick, however large the step", () => {
        withRandom(0.1, () => {
            const scheduler = createNightScheduler();
            // A backgrounded tab resuming with a huge gap must not dump a
            // burst of catch-up events at once.
            assert.deepEqual(scheduler.tick(100), {
                ufo: true,
                meteor: true,
            });

            const rest = collectFires(scheduler, 100);
            assert.deepEqual(rest.ufo, [1, 2]);
            assert.ok(rest.meteor.length > 0);
        });
    });

    it("never re-rolls the schedule on its own", () => {
        withRandom(0.1, () => {
            const scheduler = createNightScheduler();
            const first = collectFires(scheduler, 64);
            assert.deepEqual(first.ufo, [4, 16, 32]);
        });
    });

    it("starts a fresh schedule on reset only", () => {
        let scheduler: NightScheduler | null = null;
        withRandom(0.1, () => {
            scheduler = createNightScheduler();
        });
        withRandom(0.9, () => {
            scheduler!.reset();
        });
        const { ufo, meteor } = collectFires(scheduler!, 40);
        assert.deepEqual(ufo, [7, 16, 32]);
        assert.deepEqual(meteor, [4, 16, 24, 32, 40]);
    });
});
