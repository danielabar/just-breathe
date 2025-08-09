import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { startBreathingSession } from "./session.js";
import { speak } from "./voice.js";

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
    expect(stateEl.textContent).toBe('Breathe in');
    expect(speak).toHaveBeenCalledWith('Breathe in');
  });
});
