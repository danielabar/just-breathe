import { startBreathingSession } from './session.js';

export function renderMainView(container) {
  container.innerHTML = `
    <div class="instructions">
      <strong>How it works:</strong><br>
      Set your preferred breathing pace and session length. When you start, just listen and relax. All prompts are through your device's voice.
      <br><br>
      <em>Inhale and exhale gently through your nose. No need to watch the screen.</em>
    </div>
    <form class="breath-form">
      <label>Breathe in (seconds)
        <input type="number" name="in" min="1" max="15" step="0.1" value="4.5" required>
      </label>
      <label>Breathe out (seconds)
        <input type="number" name="out" min="1" max="15" step="0.1" value="4.5" required>
      </label>
      <label>Duration (minutes)
        <select name="duration">
          <option value="5">5</option>
          <option value="10" selected>10</option>
          <option value="15">15</option>
          <option value="20">20</option>
          <option value="25">25</option>
          <option value="30">30</option>
          <option value="custom">Custom</option>
        </select>
      </label>
      <input type="number" name="customDuration" min="1" max="180" step="1" placeholder="Custom (minutes)" style="display:none;">
      <button type="submit">Start</button>
    </form>
    <div id="session-area"></div>
  `;

  const form = container.querySelector('.breath-form');
  const durationSelect = form.elements['duration'];
  const customInput = form.elements['customDuration'];

  durationSelect.addEventListener('change', () => {
    if (durationSelect.value === 'custom') {
      customInput.style.display = '';
      customInput.required = true;
    } else {
      customInput.style.display = 'none';
      customInput.required = false;
    }
  });

  form.addEventListener('submit', e => {
    e.preventDefault();
    let inSec = parseFloat(form.elements['in'].value);
    let outSec = parseFloat(form.elements['out'].value);
    let duration = durationSelect.value === 'custom' ? parseInt(customInput.value, 10) : parseInt(durationSelect.value, 10);
    if (!duration || duration < 1 || duration > 180) {
      customInput.focus();
      return;
    }
    startBreathingSession({
      inSec,
      outSec,
      durationMin: duration,
      container: container.querySelector('#session-area'),
      onDone: () => renderMainView(container)
    });
    form.style.display = 'none';
  });
}
