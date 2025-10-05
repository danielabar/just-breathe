import { speak } from './voice.js';
import { saveSessionToHistory } from './historyStorage.js';

// Wake Lock API support
let wakeLock = null;
async function requestWakeLock() {
  try {
    if ('wakeLock' in navigator) {
      wakeLock = await navigator.wakeLock.request('screen');
      wakeLock.addEventListener('release', () => {
        wakeLock = null;
      });
    }
  } catch (err) {
    // Wake Lock request failed - ignore
  }
}

export function startBreathingSession({ inSec, outSec, durationMin, container, onDone }) {
  // Helper to call onDone with completed status
  function finishSession(completed) {
    saveSessionToHistory({
      inSec,
      outSec,
      duration: durationMin
    });
    if (typeof onDone === 'function') {
      // TODO: `completed` is not needed by onDone function but might be useful in saveSessionToHistory
      onDone({ completed });
    }
  }
  // Countdown timing constants
  // const COUNTDOWN_STARTING_PAUSE_MS = 1800; // Pause after "Starting in 3..."
  const COUNTDOWN_STARTING_PAUSE_MS = 1000; // Pause after "Starting in 3..."
  const COUNTDOWN_NUMBER_PAUSE_MS = 1000;   // Pause after each countdown number (2, 1)
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
    <button id="stop-btn" class="app-button app-button--secondary">Stop</button>
  `;
  const stateEl = container.querySelector('#breathing-state');
  const progressEl = container.querySelector('#progress');
  const stopBtn = container.querySelector('#stop-btn');

  // Try to keep the screen awake
  requestWakeLock();

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
        finishSession(true);
        stopBtn.textContent = "Restart";
        stopBtn.onclick = () => {
          // Optionally restart session here, but do not call finishSession again
        };
        // Release wake lock if held
        if (wakeLock && wakeLock.release) {
          wakeLock.release();
          wakeLock = null;
        }
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
  // Helper to speak and wait for speech to finish, then call callback
  function speakAndWait(text, pauseMs, cb) {
    const utter = speak(text, true); // pass true to get utterance object
    if (utter && typeof utter.addEventListener === 'function') {
      utter.addEventListener('end', () => {
        setTimeout(cb, pauseMs);
      });
    } else {
      // fallback: just wait
      setTimeout(cb, pauseMs);
    }
  }

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
      speakAndWait('Starting in 3', COUNTDOWN_STARTING_PAUSE_MS, () => {
        stateEl.textContent = '2...';
        speakAndWait('2', COUNTDOWN_NUMBER_PAUSE_MS, () => {
          stateEl.textContent = '1...';
          speakAndWait('1', COUNTDOWN_NUMBER_PAUSE_MS, () => startCountdown(0));
        });
      });
    }
    // No else needed, as 2 and 1 are handled above
  }

  startCountdown(3);

  stopBtn.onclick = () => {
    running = false;
    finishSession(false);
    // Release wake lock if held
    if (wakeLock && wakeLock.release) {
      wakeLock.release();
      wakeLock = null;
    }
  };
}
