import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

/**
 * Local (on-device) notifications — scheduled by the app itself, no push
 * server involved. Each feature owns an identifier prefix ("fasting-", …) and
 * replaces all of its scheduled notifications at once (replaceScheduled), so
 * re-planning after any settings change is idempotent.
 */

const CHANNEL_ID = 'reminders';
const isSupported = Platform.OS !== 'web';

if (isSupported) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: true, shouldSetBadge: false })
  });
}

let channelReady = null;
function ensureChannel(channelName) {
  if (Platform.OS !== 'android') return Promise.resolve();
  channelReady ??= Notifications.setNotificationChannelAsync(CHANNEL_ID, {
    name: channelName,
    importance: Notifications.AndroidImportance.HIGH
  }).catch(() => {});
  return channelReady;
}

/**
 * Whether notifications may be shown. With `ask`, shows the system prompt if
 * the user hasn't decided yet — call it from a user action (e.g. turning a
 * reminder on), not at app start.
 */
export async function ensureNotificationPermission({ ask = false, channelName = 'Reminders' } = {}) {
  if (!isSupported) return false;
  await ensureChannel(channelName);
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  if (!ask || !current.canAskAgain) return false;
  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

/**
 * Cancels every scheduled notification whose identifier starts with `prefix`
 * and schedules `requests` instead: [{ id, title, body, data, trigger }], where
 * trigger is { date } (once) or { hour, minute } (daily). Ids get the prefix.
 */
export async function replaceScheduled(prefix, requests) {
  if (!isSupported) return;
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(scheduled.filter(item => item.identifier.startsWith(prefix)).map(item => Notifications.cancelScheduledNotificationAsync(item.identifier)));
  if (requests.length === 0 || !(await ensureNotificationPermission())) return;
  for (const request of requests) {
    const trigger = request.trigger.date
      ? { type: Notifications.SchedulableTriggerInputTypes.DATE, date: request.trigger.date, channelId: CHANNEL_ID }
      : { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour: request.trigger.hour, minute: request.trigger.minute, channelId: CHANNEL_ID };
    await Notifications.scheduleNotificationAsync({
      identifier: `${prefix}${request.id}`,
      content: { title: request.title, body: request.body, data: request.data ?? {} },
      trigger
    });
  }
}

/**
 * Calls `onOpen(data)` when the user taps a notification — also for the tap
 * that launched the app. Returns an unsubscribe function.
 */
// The launch response is returned again on every getLastNotificationResponseAsync
// call — each tap is handled once (identifier + delivery time).
const handledResponses = new Set();

export function onNotificationOpened(onOpen) {
  if (!isSupported) return () => {};
  const handle = response => {
    if (!response) return;
    const { request, date } = response.notification;
    const key = `${request.identifier}@${date}`;
    if (handledResponses.has(key)) return;
    handledResponses.add(key);
    onOpen(request.content.data ?? {});
  };
  Notifications.getLastNotificationResponseAsync().then(handle).catch(() => {});
  const subscription = Notifications.addNotificationResponseReceivedListener(handle);
  return () => subscription.remove();
}
