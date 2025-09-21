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
        <button class="history-entry-btn"
                data-in="${entry.inSec}"
                data-out="${entry.outSec}"
                data-duration="${entry.duration}">
          <span class="history-entry-time">${new Date(
            entry.timestamp
          ).toLocaleString()}</span>
          <span class="history-entry-details">In: ${entry.inSec}s, Out: ${
      entry.outSec
    }s, Duration: ${entry.duration} min</span>
        </button>
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
