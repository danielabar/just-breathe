import { describe, it, expect, beforeEach } from 'vitest';
import { renderAboutView } from './about.js';

describe('renderAboutView', () => {
  let container;

  beforeEach(() => {
    container = document.createElement('div');
  });

  it('renders the about view content', () => {
    renderAboutView(container);
    expect(container.innerHTML).toContain('Why Breathe Easy?');
    expect(container.innerHTML).toContain('James Nestor');
    expect(container.querySelector('.instructions')).not.toBeNull();
    expect(container.querySelector('a')).not.toBeNull();
  });
});
