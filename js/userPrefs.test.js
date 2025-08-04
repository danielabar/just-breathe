import { describe, it, expect, beforeEach, afterEach } from "vitest";

import {
  loadPrefs,
  savePrefs,
  STANDARD_DURATIONS,
  DEFAULT_PREFS,
  isCustomDuration,
} from "./userPrefs.js";

const PREFS_KEY = "justBreathe:prefs";

describe("loadPrefs", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("returns DEFAULT_PREFS if nothing is stored", () => {
    expect(loadPrefs()).toEqual(DEFAULT_PREFS);
  });

  it("returns stored prefs if valid values are present", () => {
    const validPrefs = { inSec: 5, outSec: 6, duration: 10 };
    localStorage.setItem(PREFS_KEY, JSON.stringify(validPrefs));
    expect(loadPrefs()).toEqual(validPrefs);
  });

  it("returns DEFAULT_PREFS if stored values are out of range", () => {
    const invalidPrefs = { inSec: 0, outSec: 20, duration: 999 };
    localStorage.setItem(PREFS_KEY, JSON.stringify(invalidPrefs));
    expect(loadPrefs()).toEqual(DEFAULT_PREFS);
  });

  it("returns DEFAULT_PREFS if stored values are wrong type", () => {
    const invalidPrefs = { inSec: "foo", outSec: null, duration: "bar" };
    localStorage.setItem(PREFS_KEY, JSON.stringify(invalidPrefs));
    expect(loadPrefs()).toEqual(DEFAULT_PREFS);
  });

  it("returns DEFAULT_PREFS if stored value is malformed JSON", () => {
    localStorage.setItem(PREFS_KEY, "{not valid json");
    expect(loadPrefs()).toEqual(DEFAULT_PREFS);
  });

  it("merges valid fields and falls back to DEFAULT_PREFS for missing fields", () => {
    const incompletePrefs = { inSec: 5 };
    localStorage.setItem(PREFS_KEY, JSON.stringify(incompletePrefs));
    expect(loadPrefs()).toEqual({
      inSec: 5,
      outSec: DEFAULT_PREFS.outSec,
      duration: DEFAULT_PREFS.duration,
    });
  });

  it("returns DEFAULT_PREFS if localStorage throws", () => {
    // Simulate localStorage throwing
    const originalGetItem = localStorage.getItem;
    localStorage.getItem = () => {
      throw new Error("fail");
    };
    expect(loadPrefs()).toEqual(DEFAULT_PREFS);
    localStorage.getItem = originalGetItem;

  });
});

describe("savePrefs", () => {
  const PREFS_KEY = "justBreathe:prefs";

  beforeEach(() => {
    localStorage.clear();
  });

  it("saves valid preferences to localStorage", () => {
    const prefs = { inSec: 6, outSec: 7, duration: 15 };
    savePrefs(prefs);
    const stored = JSON.parse(localStorage.getItem(PREFS_KEY));
    expect(stored).toEqual(prefs);
  });

  it("handles missing fields gracefully", () => {
    const partialPrefs = { inSec: 8 };
    savePrefs(partialPrefs);
    const stored = JSON.parse(localStorage.getItem(PREFS_KEY));
    expect(stored).toEqual({ inSec: 8 });
  });

  it("handles localStorage errors", () => {
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = () => {
      throw new Error("fail");
    };
    expect(() => savePrefs({ inSec: 5, outSec: 5, duration: 10 })).not.toThrow();
    localStorage.setItem = originalSetItem;
  });

  it("overwrites previous preferences", () => {
    const firstPrefs = { inSec: 4, outSec: 5, duration: 10 };
    const secondPrefs = { inSec: 7, outSec: 8, duration: 20 };
    savePrefs(firstPrefs);
    savePrefs(secondPrefs);
    const stored = JSON.parse(localStorage.getItem(PREFS_KEY));
    expect(stored).toEqual(secondPrefs);
  });

  it("stores only expected fields", () => {
    const prefsWithExtra = { inSec: 5, outSec: 6, duration: 10, foo: "bar", bar: 123 };
    savePrefs(prefsWithExtra);
    const stored = JSON.parse(localStorage.getItem(PREFS_KEY));
    expect(stored).toEqual({ inSec: 5, outSec: 6, duration: 10 });
  });
});

describe("isCustomDuration", () => {
  it("returns false for all STANDARD_DURATIONS", () => {
    for (const duration of STANDARD_DURATIONS) {
      expect(isCustomDuration(duration)).toBe(false);
    }
  });

  it("returns true for values not in STANDARD_DURATIONS", () => {
    expect(isCustomDuration(1)).toBe(true);
    expect(isCustomDuration(7)).toBe(true);
    expect(isCustomDuration(100)).toBe(true);
    expect(isCustomDuration(0)).toBe(true);
    expect(isCustomDuration(-5)).toBe(true);
    expect(isCustomDuration(12.5)).toBe(true);
  });

  it("returns true for non-number types", () => {
    expect(isCustomDuration("10")).toBe(true);
    expect(isCustomDuration(null)).toBe(true);
    expect(isCustomDuration(undefined)).toBe(true);
    expect(isCustomDuration([10])).toBe(true);
    expect(isCustomDuration({ duration: 10 })).toBe(true);
  });

  it("returns true for floating point numbers not in STANDARD_DURATIONS", () => {
    expect(isCustomDuration(5.1)).toBe(true);
    expect(isCustomDuration(9.9)).toBe(true);
    expect(isCustomDuration(15.5)).toBe(true);
  });
});
