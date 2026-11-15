import { router } from 'expo-router';

// The push animation takes a moment, so quick repeated taps on the same button
// would each push another copy of the screen onto the stack. Any push within
// this window after the previous one is ignored.
const PUSH_COOLDOWN_MS = 800;
let lastPushAt = 0;

/** router.push that ignores repeated taps (see PUSH_COOLDOWN_MS). Returns whether it navigated. */
export function pushOnce(href) {
  const now = Date.now();
  if (now - lastPushAt < PUSH_COOLDOWN_MS) return false;
  lastPushAt = now;
  router.push(href);
  return true;
}
