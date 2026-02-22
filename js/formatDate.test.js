import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { formatSessionDate } from './formatDate.js';

// All tests use a fixed "now" of 2026-02-21T15:00:00 local time.
// We construct timestamps relative to that anchor so results are deterministic.
const NOW = new Date('2026-02-21T15:00:00').getTime();

// Helper: build a timestamp for a given date at a specific time
function ts(dateStr, timeStr = '14:30') {
  return new Date(`${dateStr}T${timeStr}:00`).getTime();
}

describe('formatSessionDate', () => {
  beforeAll(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  it('returns "Today · <time>" for a timestamp on the same calendar day', () => {
    // Session happened at 9:05 AM today
    const timestamp = ts('2026-02-21', '09:05');
    const result = formatSessionDate(timestamp);
    expect(result).toMatch(/^Today · /);
    expect(result).toContain('9:05');
  });

  it('returns "Yesterday · <time>" for a timestamp on the previous calendar day', () => {
    const timestamp = ts('2026-02-20', '18:45');
    const result = formatSessionDate(timestamp);
    expect(result).toMatch(/^Yesterday · /);
    expect(result).toContain('6:45');
  });

  it('returns "Mon DD · <time>" for timestamps older than yesterday', () => {
    const timestamp = ts('2026-02-15', '11:20');
    const result = formatSessionDate(timestamp);
    expect(result).toMatch(/^Feb 15 · /);
    expect(result).toContain('11:20');
  });

  it('handles a timestamp from 7 days ago', () => {
    const timestamp = ts('2026-02-14', '08:00');
    const result = formatSessionDate(timestamp);
    expect(result).toMatch(/^Feb 14 · /);
  });
});
