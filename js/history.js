import { getSessionHistory } from "./historyStorage.js";

export function renderHistoryView(container) {
  const history = getSessionHistory();
  const content =
    history.length === 0 ? renderEmptyState() : renderHistoryList(history);

  container.innerHTML = `
    <section class="history-view">
      <h2>History</h2>
      ${content}
    </section>
  `;

  // Add event listener for start button if no history
  const startBtn = container.querySelector("#history-start-btn");
  if (startBtn) {
    startBtn.addEventListener("click", () => {
      import("./index.js").then((mod) => mod.showView("main"));
    });
  }

  // TODO: Add click listeners for history entries in next step
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
          <div class="history-entry-header-row">
            <span class="history-entry-time">
              ${new Date(entry.timestamp).toLocaleString()}
            </span>
            <button class="history-replay-btn app-button--secondary" title="Replay session" tabindex="-1">
              <svg width="18" height="18" viewBox="0 0 22 22" aria-hidden="true" style="vertical-align:middle; margin-right:4px;"><path d="M11 3a8 8 0 1 1-7.5 5.5" stroke="#3a7c7c" stroke-width="2" fill="none"/><path d="M3 3v5h5" stroke="#3a7c7c" stroke-width="2" fill="none" stroke-linecap="round"/></svg>
              <span class="history-replay-label">Replay</span>
            </button>
          </div>
          <div class="history-entry-details-row">
            <span class="history-inout">
              <svg width="16" height="16" viewBox="0 0 18 18" aria-hidden="true" style="vertical-align:middle; margin-right:2px;"><path d="M9 2v14M9 2l-4 4M9 2l4 4" stroke="#3a7c7c" stroke-width="2" fill="none" stroke-linecap="round"/></svg>
              Inhale <strong>${entry.inSec}s</strong>
              <svg width="16" height="16" viewBox="0 0 18 18" aria-hidden="true" style="vertical-align:middle; margin-left:10px; margin-right:2px;"><path d="M9 16V2M9 16l-4-4M9 16l4-4" stroke="#3a7c7c" stroke-width="2" fill="none" stroke-linecap="round"/></svg>
              Exhale <strong>${entry.outSec}s</strong>
              <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true" style="vertical-align:middle; margin-left:10px; margin-right:2px;"><circle cx="8" cy="8" r="7" stroke="#3a7c7c" stroke-width="2" fill="none"/><path d="M8 4v4l3 3" stroke="#3a7c7c" stroke-width="2" fill="none" stroke-linecap="round"/></svg>
              <strong>${entry.duration} min</strong>
            </span>
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
      <button class="app-button" id="history-start-btn">Start a session</button>
    </div>
  `;
}
