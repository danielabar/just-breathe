import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock the view renderers
vi.mock('./main.js', () => ({ renderMainView: vi.fn() }));
vi.mock('./about.js', () => ({ renderAboutView: vi.fn() }));
import { renderMainView } from './main.js';
import { renderAboutView } from './about.js';

let showView, tabHome, tabAbout, appView;

describe('showView', () => {
  beforeEach(async () => {
    document.body.innerHTML = `
      <header>
        <h1>Just Breathe</h1>
      </header>
      <main>
        <section id="app-view"></section>
      </main>
      <nav class="tab-bar" aria-label="Main navigation">
        <button id="tab-home" class="tab-btn" type="button"></button>
        <button id="tab-history" class="tab-btn" type="button"></button>
        <button id="tab-about" class="tab-btn" type="button"></button>
      </nav>
    `;
    tabHome = document.getElementById('tab-home');
    tabAbout = document.getElementById('tab-about');
    appView = document.getElementById('app-view');
    renderMainView.mockClear();
    renderAboutView.mockClear();

    // Import index.js after DOM is set up, using a cache-busting query param
    const mod = await import('./index.js?' + Math.random());
    showView = mod.showView;
  });

  it('renders main view and sets aria-current on Home', () => {
    showView('main');
    expect(renderMainView).toHaveBeenCalledWith(appView, null);
    expect(tabHome.getAttribute('aria-current')).toBe('page');
    expect(tabAbout.getAttribute('aria-current')).toBe('false');
  });

  it('renders about view and sets aria-current on About', () => {
    showView('about');
    expect(renderAboutView).toHaveBeenCalledWith(appView);
    expect(tabAbout.getAttribute('aria-current')).toBe('page');
    expect(tabHome.getAttribute('aria-current')).toBe('false');
  });
});
