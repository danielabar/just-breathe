export function renderAboutView(container) {
  container.innerHTML = `
    <div class="about-view-card">
      <h2>Why breathe this way?</h2>
      <p>Inspired by the science in <a href="https://www.mrjamesnestor.com/breath-book/" target="_blank" rel="noopener">James Nestor's book <em>Breath: The New Science of a Lost Art</em></a>.</p>
      <p>The optimal breathing pattern for health is about 5.5 seconds in, 5.5 seconds out, all through the nose. This app helps you practice that, without distractions, ads, or "woo woo".</p>
      <p><em>Just set your pace, relax, and let your breath guide you.</em></p>
      <p class="about-credit">
        Made by <a href="https://danielabaron.me/" target="_blank" rel="noopener">Daniela Baron</a>
        &nbsp;·&nbsp;
        <a href="https://github.com/danielabar/just-breathe" target="_blank" rel="noopener">Source on GitHub</a>
      </p>
    </div>
  `;
}
