// userPrefs.js
// Utility for saving and loading user breathing preferences

import { PREFS_KEY } from './constants.js';


export const STANDARD_DURATIONS = [5, 10, 15, 20, 25, 30];
export const DEFAULT_PREFS = {
  inSec: 4.5,
  outSec: 4.5,
  duration: 10,
};

export function isCustomDuration(duration) {
  return !STANDARD_DURATIONS.includes(duration);
}

export function savePrefs({ inSec, outSec, duration }) {
  const prefs = { inSec, outSec, duration };
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  } catch (e) {
    // ignore storage errors
  }
}

export function loadPrefs() {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (!raw) return { ...DEFAULT_PREFS };
    const prefs = JSON.parse(raw);
    // Validate loaded values
    return {
      inSec: typeof prefs.inSec === 'number' && prefs.inSec >= 1 && prefs.inSec <= 15 ? prefs.inSec : DEFAULT_PREFS.inSec,
      outSec: typeof prefs.outSec === 'number' && prefs.outSec >= 1 && prefs.outSec <= 15 ? prefs.outSec : DEFAULT_PREFS.outSec,
      duration: typeof prefs.duration === 'number' && prefs.duration >= 1 && prefs.duration <= 180 ? prefs.duration : DEFAULT_PREFS.duration,
    };
  } catch {
    return { ...DEFAULT_PREFS };
  }
}
