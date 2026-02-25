// Optionally return the utterance object for event listening
export function speak(text, returnUtterance = false) {
  if (!('speechSynthesis' in window)) return;
  const utter = new window.SpeechSynthesisUtterance(text);
  utter.rate = 0.85;
  utter.pitch = 0.9;
  utter.lang = 'en-US';
  window.speechSynthesis.cancel(); // Stop any previous utterances
  window.speechSynthesis.speak(utter);
  if (returnUtterance) return utter;
}

// Cancels any utterance currently being spoken. Safe to call when speech
// synthesis is unavailable (e.g. headless browsers, older iOS WebViews).
export function cancelVoice() {
  window.speechSynthesis?.cancel();
}
