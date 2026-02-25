import { speak, cancelVoice } from './voice.js';
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

  // Three booleans control session lifecycle. Their jobs are distinct:
  //
  //   running        — drives the requestAnimationFrame loop during the active
  //                    breathing session. Set to false to stop the loop. Also
  //                    checked at the top of updateState() as an early-exit guard.
  //
  //   aborted        — set to true the moment the user taps Stop, regardless of
  //                    whether we are still in the countdown or already breathing.
  //                    Checked at the start of each speakAndWait callback so the
  //                    countdown chain drops out immediately without speaking further.
  //                    (running alone cannot serve this role because it is only
  //                    checked inside updateState, which the countdown never enters.)
  //
  //   sessionStarted — flipped to true when the countdown reaches zero and the
  //                    breathing loop is about to begin. Used by the stop handler
  //                    to decide whether a history entry should be saved: stopping
  //                    during the countdown means no breathing happened, so no entry.
  let running = true;
  let aborted = false;
  let sessionStarted = false;
  let state;
  let breathStart;
  let breathMs;
  let sessionStart;
  container.innerHTML = `
    <div class="orb-container" id="orb-container" style="--orb-duration: ${inSec + outSec}s">
      <div class="orb-ring"></div>
      <div class="orb-core"></div>
    </div>
    <div class="breathing-state" id="breathing-state"></div>
    <div class="progress-bar"><div class="progress" id="progress"></div></div>
    <button id="stop-btn" class="btn btn--secondary">Stop</button>
  `;
  const orbContainer = container.querySelector('#orb-container');
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
      stateEl.textContent = 'breathe out';
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
        orbContainer.dataset.state = 'out';
        speak('Breathe out');
        stateEl.textContent = 'breathe out';
      } else {
        state = 'in';
        breathMs = inSec * 1000;
        orbContainer.dataset.state = 'in';
        speak('Breathe in');
        stateEl.textContent = 'breathe in';
      }
      breathStart = Date.now();
    }
    requestAnimationFrame(updateState);
  }

  // Speaks `text` and invokes `cb` after the utterance ends plus `pauseMs` delay.
  // Uses the utterance 'end' event when speech synthesis is available; falls back
  // to a plain setTimeout when it is not (e.g. headless Chromium in tests).
  // The `next` callback skips scheduling if `aborted` is true — this is how clicking
  // Stop during the countdown prevents the remaining steps from being queued.
  function speakAndWait(text, pauseMs, cb) {
    const utter = speak(text, true);
    const next = () => { if (!aborted) setTimeout(cb, pauseMs); };
    if (utter && typeof utter.addEventListener === 'function') {
      utter.addEventListener('end', next);
    } else {
      next();
    }
  }

  // Counts down from 3 to 0, speaking each number via speakAndWait().
  // When count reaches 0 the countdown is finished: mark sessionStarted, then
  // kick off the breathing loop. All earlier steps guard against aborted at
  // the top of their callbacks to drop the chain immediately when Stop is clicked.
  function startCountdown(count) {
    if (count === 0) {
      sessionStarted = true; // breathing is about to begin; stop now warrants history
      state = 'in';
      breathMs = inSec * 1000;
      sessionStart = Date.now();
      breathStart = Date.now();
      orbContainer.dataset.state = 'in';
      speak('Breathe in');
      stateEl.textContent = 'breathe in';
      requestAnimationFrame(updateState);
      return;
    }
    if (count === 3) {
      stateEl.textContent = 'Starting in 3...';
      speakAndWait('Starting in 3', COUNTDOWN_STARTING_PAUSE_MS, () => {
        if (aborted) return;
        stateEl.textContent = '2...';
        speakAndWait('2', COUNTDOWN_NUMBER_PAUSE_MS, () => {
          if (aborted) return;
          stateEl.textContent = '1...';
          speakAndWait('1', COUNTDOWN_NUMBER_PAUSE_MS, () => {
            if (aborted) return;
            startCountdown(0);
          });
        });
      });
    }
  }

  startCountdown(3);

  stopBtn.onclick = () => {
    aborted = true;  // halt countdown chain (speakAndWait callbacks become no-ops)
    running = false; // halt breathing loop (updateState early-exits on next rAF tick)
    cancelVoice(); // silence any in-flight utterance immediately
    if (sessionStarted) {
      // User stopped during active breathing — save a (partial) history entry.
      finishSession(false);
    } else {
      // User stopped during countdown — no breathing occurred, skip history.
      if (typeof onDone === 'function') onDone({ completed: false });
    }
    // Release wake lock if held
    if (wakeLock && wakeLock.release) {
      wakeLock.release();
      wakeLock = null;
    }
  };
}
