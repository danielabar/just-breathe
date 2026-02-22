# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

"Just Breathe" is a minimal breathing meditation web app built with vanilla JavaScript, HTML, and CSS. No frameworks, no build tools, no dependencies in production. The app uses browser APIs (Web Speech API for voice guidance, Wake Lock API to prevent screen sleep, LocalStorage for persistence) to provide guided breathing sessions.

## Development Commands

**Run dev server:**
```bash
npm run dev
```
Starts http-server on port 8080 with caching disabled (`-c-1`) for development.

**Run tests:**
```bash
npm test              # Run all tests once
npm run test:watch    # Run tests in watch mode
npm run test:cov      # Run tests with coverage and open report
```

Tests use Vitest with jsdom environment. All JS modules in `js/` directory have corresponding `.test.js` files.

**Deploy:**
```bash
npm run deploy
```
Deploys to GitHub Pages using gh-pages package (deploys current directory as-is).

## Architecture

### View-Based Routing
The app uses a simple view system managed by `js/index.js`:
- **Main view** (`main.js`): Breathing session configuration form and session area
- **History view** (`history.js`): Display of past 10 sessions with ability to restart
- **About view** (`about.js`): Static informational content

Views are switched by calling `showView(viewName)` which clears the `#app-view` container and renders the requested view. Navigation is handled via a fixed bottom tab bar (`.tab-bar` / `.tab-btn` in `styles/tab-bar.css`).

### Session Flow
1. User configures breathing parameters (inhale/exhale seconds, duration) in main view
2. `startBreathingSession()` in `session.js` initiates countdown (3, 2, 1)
3. Session alternates between "in" and "out" states, synchronized with speech synthesis
4. Progress bar updates via requestAnimationFrame
5. On completion, session data is saved to history (max 10 entries)
6. Session can be stopped early via Stop button

### State Management & Persistence
- **User preferences**: Stored in LocalStorage under `justBreathe:prefs` key
  - Includes: `inSec`, `outSec`, `duration`
  - Managed by `userPrefs.js` (save/load/validate)
- **Session history**: Stored in LocalStorage under `justBreathe:history` key
  - Array of up to 10 session objects with timestamp
  - Managed by `historyStorage.js`

### Key Browser APIs
- **Web Speech API** (`voice.js`): Text-to-speech for "Breathe in", "Breathe out", countdown, "All done"
- **Wake Lock API** (`session.js`): Prevents screen from sleeping during active sessions
- Both APIs gracefully degrade if unavailable

### Module Structure
All JavaScript is in `js/` directory as ES6 modules:
- `index.js` - Entry point, view routing, menu handling
- `main.js` - Main view rendering and form handling
- `session.js` - Breathing session logic (countdown, state loop, progress)
- `history.js` - History view rendering
- `about.js` - About view rendering
- `userPrefs.js` - User preference storage/loading with validation
- `historyStorage.js` - Session history storage (max 10 entries)
- `voice.js` - Web Speech API wrapper
- `constants.js` - Shared localStorage keys and namespace

### Styling

Full architecture documented in `docs/css-architecture.md`. Key rules to follow:

**File inventory** (`styles/` directory):
- `index.css` — entry point: layer declaration + imports only, no rules
- `fonts.css` — `@font-face` declarations, outside layers
- `variables.css` — all CSS custom properties (`--color-*`, `--font-*`), outside layers
- `reset.css` — browser normalisation (`@layer reset`)
- `layout.css` — `html`, `body`, `header`, `main`, `footer`, `#app-view` (`@layer base`)
- `global.css` — form container alignment (`@layer components`)
- `app.css` — view cards, form inputs, progress bar, about view (`@layer components`)
- `button.css` — `.btn` base class + all `.btn--*` variants (`@layer components`)
- `history.css` — history entries, replay button, empty state (`@layer components`)
- `tab-bar.css` — bottom tab navigation (`@layer components`)
- `session.css` — orb animation, session screen layout (`@layer components`)

**Layer priority** (lowest → highest): `reset` → `base` → `components` → `utilities`

**Rules — always follow these:**
1. **No hardcoded colors.** Every color value must use `var(--color-*)` from `variables.css`. Add a new token there before using it anywhere else.
2. **All buttons use `.btn`.** Every button in HTML/JS must have the `btn` class. New button styles are `.btn--variant` classes added to `button.css` only — never style a button from scratch in a component file.
3. **New view or widget → new file.** Create `styles/my-component.css`, wrap content in `@layer components { }`, add one `@import` line to `index.css`. Do not add component styles to existing files that own a different concern.
4. **`index.css` contains no rules.** It only declares layers and imports other files.
5. **`variables.css` contains no rules.** Only `:root { }` custom property declarations.
6. **Wrap all new component CSS in `@layer components { }`.** The only exceptions are `@font-face` (stays outside layers) and `@keyframes` (must be outside layers for browser compatibility — see `session.css`).

## Testing Conventions

- Every `.js` module has a corresponding `.test.js` file
- Tests use Vitest with jsdom for DOM testing
- Mock localStorage in tests as needed
- Mock Web Speech API and Wake Lock API in session tests
- Coverage reports generated in `coverage/` directory

## Important Implementation Details

### Countdown Timing
The countdown before sessions uses speech synthesis event listeners to synchronize timing:
- `speakAndWait()` helper waits for speech to finish before proceeding
- Pause after "Starting in 3..." is 1000ms (COUNTDOWN_STARTING_PAUSE_MS)
- Pause after each number (2, 1) is 1000ms (COUNTDOWN_NUMBER_PAUSE_MS)
- This ensures countdown aligns with voice on iOS and other platforms

### Session Timing Precision
- Session uses `Date.now()` timestamps rather than cumulative intervals to avoid drift
- requestAnimationFrame drives the state loop
- Progress bar percentage calculated from elapsed time vs total duration

### History Feature
- Sessions automatically saved when finished (completed or stopped early)
- Limited to 10 most recent sessions (newest first)
- History view allows clicking a session to prefill main view and restart with those settings
- Clear all history button available in history view
