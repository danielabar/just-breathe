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
