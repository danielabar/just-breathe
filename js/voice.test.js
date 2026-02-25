// jsdom does not implement the Web Speech API (speechSynthesis, SpeechSynthesisUtterance),
// so we mock these browser APIs to test our code's logic and interactions.
// Actual speech synthesis cannot be tested in this environment.
import { describe, it, expect, vi, beforeEach } from "vitest";
import { speak, cancelVoice } from "./voice.js";

describe("speak", () => {
  beforeEach(() => {
    // Mock speechSynthesis and SpeechSynthesisUtterance
    window.speechSynthesis = {
      cancel: vi.fn(),
      speak: vi.fn(),
      getVoices: vi.fn(() => []),
    };
    window.SpeechSynthesisUtterance = vi.fn(function (text) {
      this.text = text;
    });
  });

  it("calls speechSynthesis.speak with utterance", () => {
    speak("hello");
    expect(window.speechSynthesis.cancel).toHaveBeenCalled();
    expect(window.speechSynthesis.speak).toHaveBeenCalledWith(
      expect.any(window.SpeechSynthesisUtterance)
    );
  });

  it("cancelVoice delegates to speechSynthesis.cancel", () => {
    cancelVoice();
    expect(window.speechSynthesis.cancel).toHaveBeenCalled();
  });

  it("cancelVoice is safe to call when speechSynthesis is unavailable", () => {
    delete window.speechSynthesis;
    expect(() => cancelVoice()).not.toThrow();
  });
});
