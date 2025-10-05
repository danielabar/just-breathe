import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHistoryView } from './history.js';

// Mock dependencies
vi.mock('./historyStorage.js', () => ({
  getSessionHistory: vi.fn(),
}));
vi.mock('./index.js', () => ({
  showView: vi.fn(),
}));

import { getSessionHistory } from './historyStorage.js';
import { showView } from './index.js';

describe('renderHistoryView', () => {
  let container;

  beforeEach(() => {
    // Setup test container
    container = document.createElement('div');

    // Reset mocks
    vi.resetAllMocks();
  });

  // EMPTY HISTORY TESTS

  it('renders empty state when history is empty', () => {
    // Mock getSessionHistory to return empty array
    getSessionHistory.mockReturnValue([]);

    // Render the view
    renderHistoryView(container);

    // Verify empty state is rendered
    const emptyStateDiv = container.querySelector('.history-empty');
    expect(emptyStateDiv).not.toBeNull();
    expect(emptyStateDiv.textContent).toContain('No sessions yet');

    // Verify start button exists
    const startBtn = container.querySelector('#history-start-btn');
    expect(startBtn).not.toBeNull();
    expect(startBtn.textContent).toBe('Start a session');
  });

  it('calls showView("main") when empty state start button is clicked', () => {
    // Mock getSessionHistory to return empty array
    getSessionHistory.mockReturnValue([]);

    // Render the view
    renderHistoryView(container);

    // Find and click the start button
    const startBtn = container.querySelector('#history-start-btn');
    startBtn.click();

    // Verify showView was called with correct parameter
    expect(showView).toHaveBeenCalledWith('main');
  });

  // HISTORY LIST TESTS

  it('renders a single history item correctly', () => {
    // Create a test history item
    const mockHistoryItem = {
      timestamp: 1633450000000, // Example timestamp
      inSec: 4,
      outSec: 6,
      duration: 10
    };

    // Mock getSessionHistory to return our test item
    getSessionHistory.mockReturnValue([mockHistoryItem]);

    // Render the view
    renderHistoryView(container);

    // Verify history list is rendered
    const historyList = container.querySelector('.history-list');
    expect(historyList).not.toBeNull();

    // Verify history entry exists
    const historyEntry = container.querySelector('.history-entry');
    expect(historyEntry).not.toBeNull();

    // Verify data attributes are set correctly
    const card = container.querySelector('.history-entry-card');
    expect(card.dataset.in).toBe(mockHistoryItem.inSec.toString());
    expect(card.dataset.out).toBe(mockHistoryItem.outSec.toString());
    expect(card.dataset.duration).toBe(mockHistoryItem.duration.toString());

    // Verify the content shows the correct values
    const content = historyEntry.textContent;
    expect(content).toContain('Inhale');
    expect(content).toContain('4s');
    expect(content).toContain('Exhale');
    expect(content).toContain('6s');
    expect(content).toContain('10 min');

    // Verify the timestamp is formatted
    const timeDisplay = container.querySelector('.history-entry-time');
    expect(timeDisplay).not.toBeNull();
    expect(timeDisplay.textContent.trim()).toBe(new Date(mockHistoryItem.timestamp).toLocaleString());
  });

  it('renders multiple history items in correct order (newest first)', () => {
    // Create mock history items with different timestamps
    const mockHistoryItems = [
      { timestamp: 1633450000000, inSec: 4, outSec: 6, duration: 10 }, // newest
      { timestamp: 1633440000000, inSec: 3, outSec: 5, duration: 15 }, // middle
      { timestamp: 1633430000000, inSec: 5, outSec: 5, duration: 5 }   // oldest
    ];

    // Mock getSessionHistory to return our test items
    getSessionHistory.mockReturnValue([...mockHistoryItems]); // clone to ensure no mutation

    // Render the view
    renderHistoryView(container);

    // Verify history list has correct number of entries
    const historyEntries = container.querySelectorAll('.history-entry');
    expect(historyEntries.length).toBe(3);

    // Verify the order is correct (newest first) by checking timestamps
    const timeDisplays = container.querySelectorAll('.history-entry-time');
    expect(timeDisplays[0].textContent.trim()).toBe(new Date(mockHistoryItems[0].timestamp).toLocaleString());
    expect(timeDisplays[1].textContent.trim()).toBe(new Date(mockHistoryItems[1].timestamp).toLocaleString());
    expect(timeDisplays[2].textContent.trim()).toBe(new Date(mockHistoryItems[2].timestamp).toLocaleString());
  });

  // REPLAY BUTTON TESTS

  it('calls showView with correct session data when replay button is clicked', () => {
    // Create a test history item
    const mockHistoryItem = {
      timestamp: 1633450000000,
      inSec: 4.5,
      outSec: 6.5,
      duration: 10
    };

    // Mock getSessionHistory to return our test item
    getSessionHistory.mockReturnValue([mockHistoryItem]);

    // Render the view
    renderHistoryView(container);

    // Find and click the replay button
    const replayBtn = container.querySelector('.history-replay-btn');

    // Create a mock event with stopPropagation method
    const mockEvent = { stopPropagation: vi.fn() };

    // Simulate click with mock event
    replayBtn.dispatchEvent(new MouseEvent('click'));

    // Since we can't easily pass the mockEvent to the actual event handler,
    // we'll check that showView was called with the right parameters
    expect(showView).toHaveBeenCalledWith('main', {
      inSec: mockHistoryItem.inSec,
      outSec: mockHistoryItem.outSec,
      duration: mockHistoryItem.duration
    });
  });

  it('correctly parses numeric values from data attributes when replay button is clicked', () => {
    // Create a test history item with string values that should be parsed
    const mockHistoryItem = {
      timestamp: 1633450000000,
      inSec: "4.5", // String that should be parsed to number
      outSec: "6.5", // String that should be parsed to number
      duration: "10" // String that should be parsed to number
    };

    // Mock getSessionHistory to return our test item
    getSessionHistory.mockReturnValue([mockHistoryItem]);

    // Render the view
    renderHistoryView(container);

    // Find and click the replay button
    const replayBtn = container.querySelector('.history-replay-btn');
    replayBtn.click();

    // Verify showView was called with properly parsed numeric values
    expect(showView).toHaveBeenCalledWith('main', {
      inSec: 4.5, // Should be parsed to number
      outSec: 6.5, // Should be parsed to number
      duration: 10 // Should be parsed to number
    });
  });

  // EDGE CASES

  it('handles many history items (more than 10) correctly', () => {
    // Create 12 mock history items
    const mockHistoryItems = Array.from({ length: 12 }, (_, i) => ({
      timestamp: 1633450000000 + (i * 10000),
      inSec: 4,
      outSec: 6,
      duration: 10
    }));

    // Mock getSessionHistory to return all items
    // In a real app, historyStorage would limit to 10, but we want to ensure the render function handles it correctly
    getSessionHistory.mockReturnValue(mockHistoryItems);

    // Render the view
    renderHistoryView(container);

    // Check that the correct number of items are rendered
    // This test should pass even if the limiting is done in historyStorage, not in history.js
    const historyEntries = container.querySelectorAll('.history-entry');
    expect(historyEntries.length).toBe(mockHistoryItems.length);
  });
});
