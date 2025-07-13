export function speak(text) {
  if (!('speechSynthesis' in window)) return;
  const utter = new window.SpeechSynthesisUtterance(text);
  utter.rate = 0.85;
  utter.pitch = 0.9;
  utter.lang = 'en-US';
  window.speechSynthesis.cancel(); // Stop any previous utterances
  window.speechSynthesis.speak(utter);
}
