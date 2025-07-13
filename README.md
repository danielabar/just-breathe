# Just Breathe: A Simple, Science-Based Meditation App

## Why This App?

Many meditation apps are filled with upsells, ads, and unnecessary complexity. "Just Breathe" is different: it’s a minimal, no-nonsense breathing app inspired by the science in James Nestor’s book [Breath: The New Science of a Lost Art](https://www.mrjamesnestor.com/breath-book/). The app is designed for people who want the health benefits of optimal breathing—without the "woo woo."

## What Does It Do?

- Guides you through simple, science-backed breathing cycles (default: 4.5 seconds in, 4.5 seconds out, all through the nose)
- Lets you customize inhale/exhale duration and total meditation time
- Uses a calming voice (via the Web Speech API) to prompt "Breathe in," "Breathe out," and "All done"
- Shows a pleasing, minimal animation during your session
- No accounts, no ads, no tracking, no upsells

## How It Works

1. **Set your preferences:**
   - Inhale seconds (default: 4.5)
   - Exhale seconds (default: 4.5)
   - Meditation duration (default: 10 minutes, or choose your own)
2. **Start your session:**
   - Find a comfortable place to sit or lie down
   - The app will guide you with audio and visuals—no need to keep watching the screen
3. **Finish:**
   - When your session is complete, you’ll hear "All done" and see a completion message
   - Option to repeat or start a new session

## Tech & Philosophy

- **Vanilla Web Technologies:**
  - Built with plain HTML, CSS, and JavaScript—no frameworks, no build tools
  - Uses hash-based routing for simple navigation (no SPA required) (WIP)
  - Responsive, mobile-first design
  - Audio prompts via the browser’s built-in Web Speech API (no audio files needed)
  - Simple DOM manipulation for UI updates and animations
- **Why Vanilla?**
  - Fast, lightweight, and easy to maintain
  - Perfect for static hosting (like GitHub Pages)
  - No dependencies, so it works everywhere

## Inspiration

[Breath: The New Science of a Lost Art](https://www.mrjamesnestor.com/breath-book/) by James Nestor

## Development

To run the app locally:

```sh
npx http-server -c-1
```

This will start a local server and disable caching (`-c-1`), so you always see your latest changes. Then open the provided URL (usually http://127.0.0.1:8080) in your browser.

No build step is required—just edit the HTML, CSS, or JS files and refresh.

## Future Ideas

- Remember your last-used settings (localStorage)
- Meditation history
- More customization options

---

**Just Breathe** is for anyone who wants the benefits of mindful breathing, without distractions. Open source, ad-free, and always simple.
