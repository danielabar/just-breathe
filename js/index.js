import { renderMainView } from './main.js';
import { renderAboutView } from './about.js';

const appView = document.getElementById('app-view');
const hamburgerBtn = document.getElementById('hamburger-btn');
const mobileMenu = document.getElementById('mobile-menu');

// Helper to clear aria-current from all menu buttons
function clearAriaCurrent() {
  const btns = mobileMenu.querySelectorAll('button');
  btns.forEach(btn => btn.removeAttribute('aria-current'));
}

function showView(view) {
  clearAriaCurrent();
  if (view === 'about') {
    const navAbout = document.getElementById('nav-about');
    if (navAbout) navAbout.setAttribute('aria-current', 'page');
    renderAboutView(appView);
  } else {
    const navMain = document.getElementById('nav-main');
    if (navMain) navMain.setAttribute('aria-current', 'page');
    renderMainView(appView);
  }
  // Hide menu after navigation (for mobile UX)
  mobileMenu.hidden = true;
}

// Populate the mobile menu with nav buttons
function setupMenu() {
  mobileMenu.innerHTML = `
    <button id="nav-main" type="button">Home</button>
    <button id="nav-about" type="button">About</button>
  `;
  const navMain = document.getElementById('nav-main');
  const navAbout = document.getElementById('nav-about');
  navMain.addEventListener('click', () => showView('main'));
  navAbout.addEventListener('click', () => showView('about'));
}

// Hamburger toggles menu visibility
hamburgerBtn.addEventListener('click', () => {
  // Populate menu if empty (idempotent)
  if (!mobileMenu.innerHTML.trim()) setupMenu();
  mobileMenu.hidden = !mobileMenu.hidden;
});

// Render main view by default
renderMainView(appView);

// So we can test it
export { showView };
