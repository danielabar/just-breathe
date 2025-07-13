import { renderMainView } from './main.js';
import { renderAboutView } from './about.js';

const mainSection = document.getElementById('view-main');
const aboutSection = document.getElementById('view-about');
const navMain = document.getElementById('nav-main');
const navAbout = document.getElementById('nav-about');

function showView(view) {
  if (view === 'about') {
    mainSection.hidden = true;
    aboutSection.hidden = false;
    navMain.removeAttribute('aria-current');
    navAbout.setAttribute('aria-current', 'page');
    renderAboutView(aboutSection);
  } else {
    mainSection.hidden = false;
    aboutSection.hidden = true;
    navMain.setAttribute('aria-current', 'page');
    navAbout.removeAttribute('aria-current');
    renderMainView(mainSection);
  }
}

navMain.addEventListener('click', () => showView('main'));
navAbout.addEventListener('click', () => showView('about'));

// Default view
showView('main');
