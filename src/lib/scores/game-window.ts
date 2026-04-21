export function isWithinGameWindow(now: Date = new Date()): boolean {
  const day = now.getDay();
  if (![1, 2, 3, 5].includes(day)) return false;

  const totalMinutes = now.getHours() * 60 + now.getMinutes();
  return totalMinutes >= 16 * 60 + 30 && totalMinutes <= 23 * 60 + 30;
}
