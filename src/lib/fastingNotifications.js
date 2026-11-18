import { reaction } from 'mobx';
import i18next from '@/i18n';
import { replaceScheduled } from '@/lib/notifications';
import { fastingStore, parseTime } from '@/store/fastingStore';
import { localeStore } from '@/store/localeStore';
import { notificationsStore } from '@/store/notificationsStore';

/**
 * Fasting reminders, re-planned whenever the fasting settings, the running
 * fast, the master "Notifications" switch or the language change:
 * - daily when the eating window ends → time to start the fast;
 * - daily when the eating window opens → the fast can be ended;
 * - once, when the running fast reaches its goal.
 * Tapping any of them opens the fasting screen (data.url).
 */

const PREFIX = 'fasting-';
const URL = '/fasting';

function buildRequests() {
  const { settings, activeFast } = fastingStore;
  if (!settings.isEnabled || !notificationsStore.isEnabled) return [];
  const t = i18next.t.bind(i18next);
  const requests = [];
  if (settings.notifyFastStart) {
    requests.push({
      id: 'start',
      title: t('fasting.notifications.startTitle'),
      body: t('fasting.notifications.startBody', { hours: settings.fastingHours, time: settings.eatingStart }),
      data: { url: URL },
      trigger: parseTime(fastingStore.eatingEnd)
    });
  }
  if (settings.notifyFastEnd) {
    requests.push({
      id: 'end',
      title: t('fasting.notifications.endTitle'),
      body: t('fasting.notifications.endBody', { time: fastingStore.eatingEnd }),
      data: { url: URL },
      trigger: parseTime(settings.eatingStart)
    });
  }
  if (settings.notifyGoal && activeFast) {
    const goalAt = new Date(new Date(activeFast.startedAt).getTime() + activeFast.targetHours * 3600000);
    if (goalAt.getTime() > Date.now()) {
      requests.push({
        id: 'goal',
        title: t('fasting.notifications.goalTitle'),
        body: t('fasting.notifications.goalBody', { hours: activeFast.targetHours }),
        data: { url: URL },
        trigger: { date: goalAt }
      });
    }
  }
  return requests.map(request => ({ ...request, trigger: request.trigger.date ? request.trigger : { hour: request.trigger.hours, minute: request.trigger.minutes } }));
}

let timer = null;
function schedule() {
  clearTimeout(timer);
  timer = setTimeout(() => {
    replaceScheduled(PREFIX, buildRequests()).catch(error => {
      if (__DEV__) console.warn(`[fastingNotifications] ${error.message}`);
    });
  }, 500);
}

/** Starts keeping the fasting reminders in step with the app state. Call once. */
export function startFastingNotifications() {
  reaction(() => JSON.stringify([fastingStore.hasHydrated, fastingStore.settings, fastingStore.activeFast, notificationsStore.isEnabled, localeStore.language]), () => {
    if (fastingStore.hasHydrated) schedule();
  }, { fireImmediately: true });
}
