import { describe, it, expect, beforeEach, afterEach } from "vitest";

import {
  loadPrefs,
  savePrefs,
  STANDARD_DURATIONS,
  DEFAULT_PREFS,
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
