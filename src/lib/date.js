export function toDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
export function todayKey() {
  return toDateKey(new Date());
}
export function addDays(dateKey, days) {
  const [year, month, day] = dateKey.split('-').map(Number);
  const date = new Date(year, month - 1, day + days);
  return toDateKey(date);
}
const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export function weekdayLabel(dateKey) {
  const [year, month, day] = dateKey.split('-').map(Number);
  return WEEKDAY_LABELS[new Date(year, month - 1, day).getDay()];
}

/** Monday-start week containing dateKey, as 7 DateKeys. */
export function weekContaining(dateKey) {
  const [year, month, day] = dateKey.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const isoWeekday = (date.getDay() + 6) % 7; // 0 = Monday
  const monday = addDays(dateKey, -isoWeekday);
  return Array.from({
    length: 7
  }, (_, index) => addDays(monday, index));
}
