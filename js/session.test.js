import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { startBreathingSession } from "./session.js";
import { speak } from "./voice.js";
import * as historyStorage from "./historyStorage.js";

// Mock speak to track calls
vi.mock("./voice.js", () => ({
  speak: vi.fn(() => ({ addEventListener: vi.fn((event, cb) => { if (event === 'end') cb(); }) }))
}));

// Use fake timers for countdown

describe("startBreathingSession countdown", () => {
  let container, onDone;

  beforeEach(() => {
    container = document.createElement("div");
    onDone = vi.fn();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("shows countdown text and calls speak for each countdown step", () => {
    startBreathingSession({ inSec: 3, outSec: 4, durationMin: 1, container, onDone });
    const stateEl = container.querySelector('#breathing-state');
    expect(stateEl.textContent).toBe('Starting in 3...');
    expect(speak).toHaveBeenCalledWith('Starting in 3', true);

    // Advance timers for 'Starting in 3' pause
    vi.advanceTimersByTime(1000); // COUNTDOWN_STARTING_PAUSE_MS
    expect(stateEl.textContent).toBe('2...');
    expect(speak).toHaveBeenCalledWith('2', true);

    // Advance timers for '2' pause
    vi.advanceTimersByTime(1000); // COUNTDOWN_NUMBER_PAUSE_MS
    expect(stateEl.textContent).toBe('1...');
    expect(speak).toHaveBeenCalledWith('1', true);

    // Advance timers for '1' pause
    vi.advanceTimersByTime(1000); // COUNTDOWN_NUMBER_PAUSE_MS
    // After countdown, should start session
    expect(stateEl.textContent).toBe('breathe in');
    expect(speak).toHaveBeenCalledWith('Breathe in');
  });

  it("calls onDone with completed=false and saves to history when Stop button is clicked", () => {
    const saveSessionSpy = vi.spyOn(historyStorage, "saveSessionToHistory");
    startBreathingSession({
      inSec: 3,
      outSec: 4,
      durationMin: 1,
      container,
      onDone,
    });
    const stopBtn = container.querySelector("#stop-btn");
    expect(stopBtn).toBeTruthy();

    // Simulate clicking the Stop button
    stopBtn.click();

    // onDone should be called with completed: false
    expect(onDone).toHaveBeenCalledWith({ completed: false });
    expect(saveSessionSpy).toHaveBeenCalledWith({ inSec: 3, outSec: 4, duration: 1 });
    saveSessionSpy.mockRestore();
  });

  it("calls onDone with completed=true and saves to history when session completes naturally", () => {
    const saveSessionSpy = vi.spyOn(historyStorage, "saveSessionToHistory");
    // Patch requestAnimationFrame to run immediately
    global.requestAnimationFrame = (cb) => setTimeout(cb, 0);

    startBreathingSession({
      inSec: 3,
      outSec: 4,
      durationMin: 1 / 60, // very short session for test
      container,
      onDone,
    });

    // Fast-forward countdown
    vi.advanceTimersByTime(1000 + 1000 + 1000); // countdown

    // Fast-forward session duration (should be very short)
    vi.advanceTimersByTime(1000); // simulate session start

    // Fast-forward the final out-breath timeout
    vi.advanceTimersByTime(4000); // outSec * 1000

    const stateEl = container.querySelector('#breathing-state');
    const progressEl = container.querySelector('#progress');

    // Verify "All done!" message and speech
    expect(stateEl.textContent).toBe('All done!');
    expect(speak).toHaveBeenCalledWith('All done');
    expect(progressEl.style.width).toBe('100%');

    // onDone should be called automatically after session completes
    expect(onDone).toHaveBeenCalledWith({ completed: true });
    expect(saveSessionSpy).toHaveBeenCalledWith({ inSec: 3, outSec: 4, duration: 1 / 60 });
    saveSessionSpy.mockRestore();
  });
});
