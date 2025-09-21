import { HISTORY_KEY } from './constants.js';

export function saveSessionToHistory({ inSec, outSec, duration }) {
  const timestamp = Date.now();
  let history = [];
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (raw) history = JSON.parse(raw);
    if (!Array.isArray(history)) history = [];
  } catch {
    history = [];
  }
  history.unshift({ timestamp, inSec, outSec, duration });
  history = history.slice(0, 10);
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch {
    // ignore storage errors
  }
}

export function getSessionHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const history = JSON.parse(raw);
    return Array.isArray(history) ? history : [];
  } catch {
    return [];
  }
}

export function clearSessionHistory() {
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch {
    // ignore
  }
}
