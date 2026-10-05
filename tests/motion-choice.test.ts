import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
    effectiveMotion,
    motionMode,
    readMotionChoice,
    writeMotionChoice,
} from "../src/components/time/motionChoice.js";

function memoryStore(initial: Record<string, string> = {}) {
    const data = { ...initial };
    return {
        getItem: (key: string) => data[key] ?? null,
        setItem: (key: string, value: string) => {
            data[key] = value;
        },
        data,
    };
}

describe("motion choice storage", () => {
    it("reads back a stored play or paused choice", () => {
        const store = memoryStore({ "time-scene-motion": "play" });
        assert.equal(readMotionChoice(store), "play");
        store.data["time-scene-motion"] = "paused";
        assert.equal(readMotionChoice(store), "paused");
    });

    it("ignores unknown or missing values", () => {
        assert.equal(readMotionChoice(memoryStore()), null);
        assert.equal(
            readMotionChoice(memoryStore({ "time-scene-motion": "yes" })),
            null,
        );
    });

    it("writes the choice and survives a failing store", () => {
        const store = memoryStore();
        writeMotionChoice("paused", store);
        assert.equal(store.data["time-scene-motion"], "paused");
        assert.equal(readMotionChoice(null), null);
        writeMotionChoice("play", null);
        writeMotionChoice("play", {
            getItem: () => null,
            setItem: () => {
                throw new Error("denied");
            },
        });
    });
});

describe("effective motion", () => {
    it("lets an explicit choice win over the OS setting", () => {
        assert.equal(effectiveMotion("play", true), "play");
        assert.equal(effectiveMotion("paused", false), "paused");
    });

    it("autoplays unless reduced motion is on", () => {
        assert.equal(effectiveMotion(null, false), "play");
        assert.equal(effectiveMotion(null, true), "paused");
    });

    it("maps a missing choice to auto mode", () => {
        assert.equal(motionMode(null), "auto");
        assert.equal(motionMode("play"), "play");
        assert.equal(motionMode("paused"), "paused");
    });
});
