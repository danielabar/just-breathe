export function speak(text) {
  if (!('speechSynthesis' in window)) return;
  const utter = new window.SpeechSynthesisUtterance(text);
  utter.rate = 1;
  utter.pitch = 1;
  utter.lang = 'en-US';
  window.speechSynthesis.cancel(); // Stop any previous utterances
  window.speechSynthesis.speak(utter);
}
