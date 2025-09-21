import { renderMainView } from './main.js';
import { renderAboutView } from './about.js';
import { renderHistoryView } from './history.js';

const appView = document.getElementById('app-view');
const hamburgerBtn = document.getElementById('hamburger-btn');
const mobileMenu = document.getElementById('mobile-menu');
const menuOverlay = document.getElementById('menu-overlay');

function clearAriaCurrent() {
  const btns = mobileMenu.querySelectorAll('button');
  btns.forEach(btn => btn.removeAttribute('aria-current'));
}

function closeMenu() {
  mobileMenu.hidden = true;
  menuOverlay.hidden = true;
}

function openMenu() {
  mobileMenu.hidden = false;
  menuOverlay.hidden = false;
}

function showView(view) {
  clearAriaCurrent();
  if (view === 'about') {
    const navAbout = document.getElementById('nav-about');
    if (navAbout) navAbout.setAttribute('aria-current', 'page');
    renderAboutView(appView);
  } else if (view === 'history') {
    const navHistory = document.getElementById('nav-history');
    if (navHistory) navHistory.setAttribute('aria-current', 'page');
    renderHistoryView(appView);
  } else {
    const navMain = document.getElementById('nav-main');
    if (navMain) navMain.setAttribute('aria-current', 'page');
    renderMainView(appView);
  }
  closeMenu();
}

// Attach menu button listeners
function setupMenuListeners() {
  const navMain = document.getElementById('nav-main');
  const navAbout = document.getElementById('nav-about');
  const navHistory = document.getElementById('nav-history');
  if (navMain) navMain.addEventListener('click', () => showView('main'));
  if (navAbout) navAbout.addEventListener('click', () => showView('about'));
  if (navHistory) navHistory.addEventListener('click', () => showView('history'));
}

// Hamburger toggles menu
hamburgerBtn.addEventListener('click', () => {
  openMenu();
  setupMenuListeners();
});

// Overlay click closes menu
if (menuOverlay) {
  menuOverlay.addEventListener('click', closeMenu);
}

// Escape key closes menu
document.addEventListener('keydown', e => {
  if (!mobileMenu.hidden && (e.key === 'Escape' || e.key === 'Esc')) {
    closeMenu();
  }
});

// Desktop menu listeners
const navMainDesktop = document.getElementById('nav-main-desktop');
const navHistoryDesktop = document.getElementById('nav-history-desktop');
const navAboutDesktop = document.getElementById('nav-about-desktop');
if (navMainDesktop) navMainDesktop.addEventListener('click', () => showView('main'));
if (navHistoryDesktop) navHistoryDesktop.addEventListener('click', () => showView('history'));
if (navAboutDesktop) navAboutDesktop.addEventListener('click', () => showView('about'));

// Render main view by default
renderMainView(appView);

// So we can test it
export { showView };
