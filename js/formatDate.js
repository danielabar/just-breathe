export function formatSessionDate(timestamp) {
  const date    = new Date(timestamp);
  const now     = new Date();
  const today   = new Date(now.getFullYear(),  now.getMonth(),  now.getDate());
  const thatDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round((today - thatDay) / 86_400_000);

  const time = date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

  if (diffDays === 0) return `Today · ${time}`;
  if (diffDays === 1) return `Yesterday · ${time}`;

  const datePart = date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  return `${datePart} · ${time}`;
}
