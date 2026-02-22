import { describe, it, expect, beforeEach } from 'vitest';
import { renderAboutView } from './about.js';

describe('renderAboutView', () => {
  let container;

  beforeEach(() => {
    container = document.createElement('div');
  });

  it('renders the about view content', () => {
    renderAboutView(container);
    expect(container.innerHTML).toContain('Why breathe this way?');
    expect(container.innerHTML).toContain('James Nestor');
    expect(container.querySelector('.about-view-card')).not.toBeNull();
    expect(container.querySelector('.about-credit')).not.toBeNull();
    expect(container.querySelectorAll('a').length).toBeGreaterThanOrEqual(3);
  });
});
