import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("./userPrefs.js", () => ({
  loadPrefs: vi.fn(() => ({
    inSec: 3,
    outSec: 4,
    duration: 15,
  })),
  savePrefs: vi.fn(),
  STANDARD_DURATIONS: [5, 10, 15, 20, 25, 30],
  isCustomDuration: vi.fn(() => false),
}));

vi.mock("./session.js", () => ({
  startBreathingSession: vi.fn(),
}));

import { renderMainView } from "./main.js";
import * as userPrefs from "./userPrefs.js";

describe("renderMainView", () => {
  let container;

  beforeEach(() => {
    container = document.createElement("div");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // Use default mock implementations
  it("loads form with standard user prefs and hides custom duration input", () => {
    renderMainView(container);
    const inInput = container.querySelector('input[name="in"]');
    const outInput = container.querySelector('input[name="out"]');
    const durationSelect = container.querySelector('select[name="duration"]');
    const customInput = container.querySelector('input[name="customDuration"]');

    expect(inInput.value).toBe("3");
    expect(outInput.value).toBe("4");
    expect(durationSelect.value).toBe("15");
    expect(customInput.style.display).toBe("none");
    expect(customInput.value).toBe("");
  });

  // Override the mock implementations for this test only
  it("shows custom duration input when prefs.duration is custom", () => {
    userPrefs.loadPrefs.mockImplementation(() => ({
      inSec: 3,
      outSec: 4,
      duration: 42, // not in STANDARD_DURATIONS
    }));
    userPrefs.isCustomDuration.mockImplementation(() => true);

    renderMainView(container);

    const durationSelect = container.querySelector('select[name="duration"]');
    const customInput = container.querySelector('input[name="customDuration"]');

    expect(durationSelect.value).toBe("custom");
    expect(customInput.style.display).toBe("");
    expect(customInput.value).toBe("42");
  });
});
