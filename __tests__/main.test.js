// __tests__/main.test.js
import { jest } from "@jest/globals";

// Mocks for ESM (must use unstable_mockModule + import())
jest.unstable_mockModule("../js/userPrefs.js", () => ({
  loadPrefs: jest.fn(() => ({ inSec: 4, outSec: 6, duration: 5 })),
  savePrefs: jest.fn(),
  DEFAULT_PREFS: { inSec: 4.5, outSec: 4.5, duration: 10 },
  STANDARD_DURATIONS: [3, 5, 10],
  isCustomDuration: jest.fn(() => false),
}));

const mockStartBreathingSession = jest.fn();

jest.unstable_mockModule("../js/session.js", () => ({
  startBreathingSession: mockStartBreathingSession,
}));

// Now dynamically import the module under test *after* mocks are registered
const { renderMainView } = await import("../js/main.js");

describe("renderMainView", () => {
  it("renders the form with user preferences and attaches event listeners", () => {
    const container = document.createElement("div");

    renderMainView(container);

    const form = container.querySelector("form.breath-form");
    expect(form).not.toBeNull();

    expect(form.elements["in"].value).toBe("4");
    expect(form.elements["out"].value).toBe("6");
    expect(form.elements["duration"].value).toBe("5");

    form.dispatchEvent(
      new Event("submit", { bubbles: true, cancelable: true })
    );

    expect(mockStartBreathingSession).toHaveBeenCalledWith(
      expect.objectContaining({
        inSec: 4,
        outSec: 6,
        durationMin: 5,
        container: container.querySelector("#session-area"),
        onDone: expect.any(Function),
      })
    );
  });
});
