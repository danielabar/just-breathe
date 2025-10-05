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

// System under test
import { renderMainView } from "./main.js";

// Required so we can provide alternate mock implementations
import * as userPrefs from "./userPrefs.js";

// Required so we can verify the session start
import { startBreathingSession } from "./session.js";

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

  it("calls savePrefs with correct values on form submit", () => {
    renderMainView(container);

    const form = container.querySelector(".breath-form");
    const inInput = form.elements["in"];
    const outInput = form.elements["out"];
    const durationSelect = form.elements["duration"];
    const customInput = form.elements["customDuration"];

    // Simulate user input
    inInput.value = "5";
    outInput.value = "6";
    durationSelect.value = "10";
    customInput.value = "";

    // Submit the form
    form.dispatchEvent(new Event("submit", { bubbles: true }));

    expect(userPrefs.savePrefs).toHaveBeenCalledWith({
      inSec: 5,
      outSec: 6,
      duration: 10,
    });
  });

  it("calls startBreathingSession with correct arguments on form submit", () => {
    renderMainView(container);

    const form = container.querySelector(".breath-form");
    const inInput = form.elements["in"];
    const outInput = form.elements["out"];
    const durationSelect = form.elements["duration"];
    const customInput = form.elements["customDuration"];

    // Simulate user input
    inInput.value = "4";
    outInput.value = "5";
    durationSelect.value = "15";
    customInput.value = "";

    // Submit the form
    form.dispatchEvent(new Event("submit", { bubbles: true }));

    // The session-area container
    const sessionArea = container.querySelector("#session-area");

    // Check arguments passed to startBreathingSession
    expect(startBreathingSession).toHaveBeenCalledWith(
      expect.objectContaining({
        inSec: 4,
        outSec: 5,
        durationMin: 15,
        container: sessionArea,
        onDone: expect.any(Function),
      })
    );
  });

  it("hides the form after starting a session", () => {
    renderMainView(container);

    const form = container.querySelector(".breath-form");
    const inInput = form.elements["in"];
    const outInput = form.elements["out"];
    const durationSelect = form.elements["duration"];
    const customInput = form.elements["customDuration"];

    // Simulate user input
    inInput.value = "4";
    outInput.value = "5";
    durationSelect.value = "15";
    customInput.value = "";

    // Submit the form
    form.dispatchEvent(new Event("submit", { bubbles: true }));

    expect(form.style.display).toBe("none");
  });

  it("loads form with prefillValues when provided", () => {
    // Override isCustomDuration to return true for our custom duration
    userPrefs.isCustomDuration.mockImplementation((duration) => duration !== 5 &&
                                                  duration !== 10 && duration !== 15 &&
                                                  duration !== 20 && duration !== 25 &&
                                                  duration !== 30);

    const prefillValues = {
      inSec: 7.5,
      outSec: 8.5,
      duration: 22
    };

    renderMainView(container, prefillValues);

    const inInput = container.querySelector('input[name="in"]');
    const outInput = container.querySelector('input[name="out"]');
    const durationSelect = container.querySelector('select[name="duration"]');
    const customInput = container.querySelector('input[name="customDuration"]');

    expect(inInput.value).toBe("7.5");
    expect(outInput.value).toBe("8.5");
    expect(durationSelect.value).toBe("custom");
    expect(customInput.style.display).toBe("");
    expect(customInput.value).toBe("22");

    // Verify loadPrefs was not called when prefillValues are provided
    expect(userPrefs.loadPrefs).not.toHaveBeenCalled();
  });
});
