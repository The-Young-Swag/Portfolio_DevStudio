// Deterministic night-event schedule, in seconds since the session started:
//
// - 4s: a coin toss decides whether the UFO or a meteor shower fires here.
//   The loser is delayed, not skipped: the UFO appears at 4s or 7s, and a
//   meteor shower that loses the toss waits for 16s instead.
// - 16s: guaranteed combo, UFO and meteor shower together.
// - 32s: the UFO's last appearance this session.
// - Meteor showers recur every 8s after 16s for the rest of the night.
//
// The schedule is rolled once per session by reset(). Nothing here touches
// the DOM or the clock: callers advance time with tick() and fire the
// returned events themselves. In particular a brief visibility flicker must
// never call reset() — pausing only stops calling tick().

export const UFO_EARLY_SLOT_WIN = 4;
export const UFO_EARLY_SLOT_LOSE = 7;
export const COMBO_TIME = 16;
export const UFO_FINAL_TIME = 32;
export const METEOR_TAIL_INTERVAL = 8;

export type NightEvents = {
    ufo: boolean;
    meteor: boolean;
};

export type NightScheduler = {
    reset: () => void;
    tick: (dtSeconds: number) => NightEvents;
};

export function createNightScheduler(): NightScheduler {
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
            ufoWonCoinToss ? UFO_EARLY_SLOT_WIN : UFO_EARLY_SLOT_LOSE,
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

    function tick(dtSeconds: number): NightEvents {
        elapsed += dtSeconds;
        const fired: NightEvents = { ufo: false, meteor: false };

        if (ufoIndex < ufoTimes.length && elapsed >= ufoTimes[ufoIndex]) {
            ufoIndex++;
            fired.ufo = true;
        }

        if (meteorIndex < meteorFixedTimes.length) {
            if (elapsed >= meteorFixedTimes[meteorIndex]) {
                meteorIndex++;
                fired.meteor = true;
                if (meteorIndex >= meteorFixedTimes.length) {
                    meteorTailNext = COMBO_TIME + METEOR_TAIL_INTERVAL;
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
