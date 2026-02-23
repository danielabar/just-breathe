import { getSessionHistory } from "./historyStorage.js";
import { showView } from "./index.js";
import { formatSessionDate } from "./formatDate.js";

export function renderHistoryView(container) {
  const history = getSessionHistory();
  const content =
    history.length === 0 ? renderEmptyState() : renderHistoryList(history);

  container.innerHTML = `
    <section class="history-view">
      <h2>Sessions</h2>
      ${content}
    </section>
  `;

  // Add event listener for start button if no history
  const startBtn = container.querySelector("#history-start-btn");
  if (startBtn) {
    startBtn.addEventListener("click", () => {
      showView("main");
    });
  }

  // Add click listeners for replay buttons
  const replayButtons = container.querySelectorAll('.history-replay-btn');
  replayButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      const card = button.closest('.history-entry-card');
      if (!card) return;

      const sessionData = {
        inSec: parseFloat(card.dataset.in),
        outSec: parseFloat(card.dataset.out),
        duration: parseInt(card.dataset.duration, 10)
      };

      showView("main", sessionData);
      e.stopPropagation();
    });
  });
}

function renderHistoryList(history) {
  let html = '<ul class="history-list">';
  for (const entry of history) {
    html += `
      <li class="history-entry">
        <div class="history-entry-card"
             data-in="${entry.inSec}"
             data-out="${entry.outSec}"
             data-duration="${entry.duration}">
          <div class="history-card-band">
            <span class="history-entry-time">${formatSessionDate(entry.timestamp)}</span>
            <button class="btn btn--replay-pill history-replay-btn" title="Replay session">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true"><path d="M2 1.5L8.5 5L2 8.5V1.5Z" fill="currentColor"/></svg>
              Replay
            </button>
          </div>
          <div class="history-card-stats">
            <div class="history-stat">
              <span class="history-stat-icon">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true"><path d="M9 14V4M9 4L5.5 7.5M9 4L12.5 7.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </span>
              <span class="history-stat-value">${entry.inSec}<span class="history-stat-unit">s</span></span>
              <span class="history-stat-label">Inhale</span>
            </div>
            <div class="history-stat">
              <span class="history-stat-icon">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true"><path d="M9 4V14M9 14L5.5 10.5M9 14L12.5 10.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </span>
              <span class="history-stat-value">${entry.outSec}<span class="history-stat-unit">s</span></span>
              <span class="history-stat-label">Exhale</span>
            </div>
            <div class="history-stat">
              <span class="history-stat-icon" style="color: var(--color-text-dim)">
                <svg width="16" height="18" viewBox="0 0 16 18" fill="none" aria-hidden="true"><path d="M2 1.5h12M2 16.5h12M3.5 1.5C3.5 7 8 9 8 9S12.5 11 12.5 16.5M12.5 1.5C12.5 7 8 9 8 9S3.5 11 3.5 16.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </span>
              <span class="history-stat-value">${entry.duration}<span class="history-stat-unit">m</span></span>
              <span class="history-stat-label">Duration</span>
            </div>
          </div>
        </div>
      </li>
    `;
  }
  html += "</ul>";
  return html;
}

function renderEmptyState() {
  return `
    <div class="history-empty">
      <p>No sessions yet. Your completed sessions will appear here.</p>
      <button class="btn btn--primary" id="history-start-btn">Start a session</button>
    </div>
  `;
}
