import { describe, it, expect, beforeEach } from 'vitest';
import { saveSessionToHistory, getSessionHistory, clearSessionHistory } from './historyStorage.js';

describe('historyStorage', () => {
  beforeEach(() => {
    clearSessionHistory();
  });

  it('saves and retrieves a session', () => {
    saveSessionToHistory({ inSec: 4, outSec: 5, duration: 10 });
    const history = getSessionHistory();
    expect(history.length).toBe(1);
    expect(history[0].inSec).toBe(4);
    expect(history[0].outSec).toBe(5);
    expect(history[0].duration).toBe(10);
    expect(typeof history[0].timestamp).toBe('number');
  });

  it('trims history to 10 sessions', () => {
    for (let i = 0; i < 12; i++) {
      saveSessionToHistory({ inSec: i, outSec: i, duration: i });
    }
    const history = getSessionHistory();
    expect(history.length).toBe(10);
    expect(history[0].inSec).toBe(11); // newest first
    expect(history[9].inSec).toBe(2);  // oldest of the 10
  });

  it('handles empty storage', () => {
    const history = getSessionHistory();
    expect(history).toEqual([]);
  });

  it('handles corrupted storage', () => {
    localStorage.setItem('justBreathe:history', 'not-json');
    const history = getSessionHistory();
    expect(history).toEqual([]);
  });

  it('can clear history', () => {
    saveSessionToHistory({ inSec: 1, outSec: 2, duration: 3 });
    clearSessionHistory();
    expect(getSessionHistory()).toEqual([]);
  });
});
