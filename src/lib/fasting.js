import { FASTING_STAGES, fastingStore, parseTime } from '@/store/fastingStore';

const HOUR_MS = 3600000;

/** "HH:MM:SS" for a duration in ms (hours may exceed 24). */
export function formatClock(ms) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [hours, minutes, seconds].map(part => String(part).padStart(2, '0')).join(':');
}

/** Hours with one decimal at most: 16, 15.5. */
export function formatHours(hours) {
  return String(Math.round(hours * 10) / 10);
}

/** Local "HH:MM" of a Date. */
export function timeOf(date) {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

/** Progress of a running fast at `now`. */
export function fastProgress(fast, now) {
  const startedAt = new Date(fast.startedAt);
  const elapsedMs = now - startedAt;
  const goalAt = new Date(startedAt.getTime() + fast.targetHours * HOUR_MS);
  return {
    elapsedMs,
    elapsedHours: elapsedMs / HOUR_MS,
    remainingMs: goalAt - now,
    goalAt,
    progress: elapsedMs / (fast.targetHours * HOUR_MS),
    isGoalReached: now >= goalAt
  };
}

export function stageFor(elapsedHours) {
  return [...FASTING_STAGES].reverse().find(stage => elapsedHours >= stage.fromHours) ?? FASTING_STAGES[0];
}

/** Next occurrence (after `now`) of a daily "HH:MM". */
export function nextOccurrence(timeText, now) {
  const { hours, minutes } = parseTime(timeText);
  const next = new Date(now);
  next.setHours(hours, minutes, 0, 0);
  if (next <= now) next.setDate(next.getDate() + 1);
  return next;
}

/**
 * What the schedule says when no fast is running: inside the eating window →
 * when it closes; outside it → the user is "late" to start the fast and since when.
 */
export function scheduleStatus(now) {
  if (fastingStore.isInEatingWindow(now)) {
    const closesAt = nextOccurrence(fastingStore.eatingEnd, now);
    return { phase: 'eating', closesAt, remainingMs: closesAt - now };
  }
  const opensAt = nextOccurrence(fastingStore.settings.eatingStart, now);
  return { phase: 'fasting', opensAt, remainingMs: opensAt - now };
}
