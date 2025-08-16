import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock the view renderers
vi.mock('./main.js', () => ({ renderMainView: vi.fn() }));
vi.mock('./about.js', () => ({ renderAboutView: vi.fn() }));
import { renderMainView } from './main.js';
import { renderAboutView } from './about.js';

let showView, navMain, navAbout, appView;

describe('showView', () => {
  beforeEach(async () => {
    document.body.innerHTML = `
      <header>
        <nav>
          <button id="nav-main">Home</button>
          <button id="nav-about">About</button>
        </nav>
      </header>
      <main>
        <section id="app-view"></section>
      </main>
    `;
    navMain = document.getElementById('nav-main');
    navAbout = document.getElementById('nav-about');
    appView = document.getElementById('app-view');
    renderMainView.mockClear();
    renderAboutView.mockClear();

    // Import index.js after DOM is set up, using a cache-busting query param
    const mod = await import('./index.js?' + Math.random());
    showView = mod.showView;
  });

  it('renders main view and sets aria-current on Home', () => {
    showView('main');
    expect(renderMainView).toHaveBeenCalledWith(appView);
    expect(navMain.getAttribute('aria-current')).toBe('page');
    expect(navAbout.getAttribute('aria-current')).toBeNull();
  });

  it('renders about view and sets aria-current on About', () => {
    showView('about');
    expect(renderAboutView).toHaveBeenCalledWith(appView);
    expect(navAbout.getAttribute('aria-current')).toBe('page');
    expect(navMain.getAttribute('aria-current')).toBeNull();
  });
});
