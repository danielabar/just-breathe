import { speak } from './voice.js';

export function startBreathingSession({ inSec, outSec, durationMin, container, onDone }) {
  let totalMs = durationMin * 60 * 1000;
  let elapsed = 0;
  let running = true;
  let state;
  let breathStart;
  let breathMs;
  let sessionStart;
  container.innerHTML = `
    <div class="breathing-state" id="breathing-state"></div>
    <div class="progress-bar"><div class="progress" id="progress"></div></div>
    <button id="stop-btn" style="width:100%;margin-top:1.5rem;">Stop</button>
  `;
  const stateEl = container.querySelector('#breathing-state');
  const progressEl = container.querySelector('#progress');
  const stopBtn = container.querySelector('#stop-btn');

  function updateState() {
    if (!running) return;
    elapsed = Date.now() - sessionStart;
    let percent = Math.min(1, elapsed / totalMs);
    progressEl.style.width = (percent * 100) + '%';
    if (elapsed >= totalMs && state === 'in') {
      // let user finish last out-breath
      state = 'out';
      breathStart = Date.now();
      breathMs = outSec * 1000;
      speak('Breathe out');
      stateEl.textContent = 'Breathe out';
    }
    if (elapsed >= totalMs && state === 'out') {
      running = false;
      setTimeout(() => {
        stateEl.textContent = 'All done!';
        speak('All done');
        progressEl.style.width = '100%';
        stopBtn.textContent = 'Restart';
        stopBtn.onclick = onDone;
      }, outSec * 1000);
      return;
    }
    // Animate breath in/out
    let breathElapsed = Date.now() - breathStart;
    if (breathElapsed >= breathMs) {
      // Switch state
      if (state === 'in') {
        state = 'out';
        breathMs = outSec * 1000;
        speak('Breathe out');
        stateEl.textContent = 'Breathe out';
      } else {
        state = 'in';
        breathMs = inSec * 1000;
        speak('Breathe in');
        stateEl.textContent = 'Breathe in';
      }
      breathStart = Date.now();
    }
    requestAnimationFrame(updateState);
  }

  // Countdown before starting session
  function startCountdown(count) {
    if (count === 0) {
      // Start session after countdown
      state = 'in';
      breathMs = inSec * 1000;
      sessionStart = Date.now();
      breathStart = Date.now();
      speak('Breathe in');
      stateEl.textContent = 'Breathe in';
      requestAnimationFrame(updateState);
      return;
    }
    if (count === 3) {
      stateEl.textContent = 'Starting in 3...';
      speak('Starting in 3');
      // Add a slightly longer pause after 'Starting in 3...'
      setTimeout(() => startCountdown(count - 1), 1500);
    } else {
      stateEl.textContent = count + '...';
      speak(String(count));
      setTimeout(() => startCountdown(count - 1), 1000);
    }
  }

  startCountdown(3);

  stopBtn.onclick = () => {
    running = false;
    onDone();
  };
}
