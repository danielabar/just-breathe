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

describe("renderMainView", () => {
  let container;

  beforeEach(() => {
    container = document.createElement("div");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("loads form with user prefs", () => {
    renderMainView(container);
    const inInput = container.querySelector('input[name="in"]');
    const outInput = container.querySelector('input[name="out"]');
    const durationSelect = container.querySelector('select[name="duration"]');

    expect(inInput.value).toBe("3");
    expect(outInput.value).toBe("4");
    expect(durationSelect.value).toBe("15");
  });
});
