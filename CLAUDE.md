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

Views are switched by calling `showView(viewName)` which clears the `#app-view` container and renders the requested view. Navigation is handled via hamburger menu (mobile) and desktop nav buttons.

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
Styles in `styles/` directory:
- `reset.css` - Browser reset
- `variables.css` - CSS custom properties (colors, spacing)
- `fonts.css` - Font definitions
- `global.css` - Global styles (body, header, footer, menu)
- `app.css` - View cards and form styles
- `button.css` - Button component styles
- `history.css` - History view specific styles
- `index.css` - Imports all stylesheets

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
