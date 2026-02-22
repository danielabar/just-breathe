import { renderMainView }   from './main.js';
import { renderAboutView }  from './about.js';
import { renderHistoryView } from './history.js';

const appView = document.getElementById('app-view');
const tabs = {
  home:    document.getElementById('tab-home'),
  history: document.getElementById('tab-history'),
  about:   document.getElementById('tab-about'),
};

function setActiveTab(name) {
  Object.entries(tabs).forEach(([key, el]) => {
    if (el) el.setAttribute('aria-current', key === name ? 'page' : 'false');
  });
}

export function showView(view, prefillValues = null) {
  if (view === 'about') {
    setActiveTab('about');
    renderAboutView(appView);
  } else if (view === 'history') {
    setActiveTab('history');
    renderHistoryView(appView);
  } else {
    setActiveTab('home');
    renderMainView(appView, prefillValues);
  }
}

tabs.home?.addEventListener('click',    () => showView('main'));
tabs.history?.addEventListener('click', () => showView('history'));
tabs.about?.addEventListener('click',   () => showView('about'));

showView('main');
