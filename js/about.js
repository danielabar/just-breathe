export function renderAboutView(container) {
  container.innerHTML = `
    <h2>About</h2>
    <div class="instructions">
      <strong>Why Breathe Easy?</strong><br>
      This app is inspired by the science in <a href="https://www.mrjamesnestor.com/breath-book/" target="_blank" rel="noopener">James Nestor's book <em>Breath: The New Science of a Lost Art</em></a>.
      <br><br>
      The optimal breathing pattern for health is about 4.5 seconds in, 4.5 seconds out, all through the nose. This app helps you practice that, without distractions, ads, or "woo woo".
      <br><br>
      <em>Just set your pace, relax, and let your breath guide you.</em>
    </div>
  `;
}
