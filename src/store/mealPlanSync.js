import { reaction, runInAction } from 'mobx';
import { apiRequest } from '@/lib/api';
import { authStore } from './authStore';
import { mealPlanStore } from './mealPlanStore';

/**
 * Syncs the generated/edited meal plan to preferences.mealPlan on the server —
 * same reconcile-or-push approach as peopleSync.js for familyMembers, so the
 * plan survives a reinstall or shows up on another device on the same account.
 */

const PUSH_DELAY_MS = 1500;

let lastSyncedSnapshot = null;
let pushTimer = null;

async function pushItems() {
  if (!authStore.token) return false;
  const payload = mealPlanStore.items;
  try {
    await apiRequest('/app/users/me', { method: 'PUT', token: authStore.token, body: { preferences: { mealPlan: payload } } });
    runInAction(() => {
      lastSyncedSnapshot = JSON.stringify(payload);
      mealPlanStore.needsPush = false;
      mealPlanStore.hasSyncedOnce = true;
    });
    return true;
  } catch {
    return false;
  }
}

function applyServerItems(serverItems) {
  lastSyncedSnapshot = JSON.stringify(serverItems);
  runInAction(() => {
    mealPlanStore.items = serverItems;
    mealPlanStore.hasSyncedOnce = true;
  });
}

/** Reconcile with the server: upload pending local changes, otherwise take the server's list. */
export async function syncMealPlan() {
  if (!authStore.token) return;
  let me;
  try {
    me = await apiRequest('/app/users/me', { token: authStore.token });
  } catch {
    return; // offline — try again next launch
  }
  const serverItems = Array.isArray(me?.preferences?.mealPlan) ? me.preferences.mealPlan : [];
  // Plans created before the server supported this are uploaded once instead
  // of being wiped by the (empty) server list.
  const isFirstUpload = !mealPlanStore.hasSyncedOnce && serverItems.length === 0 && mealPlanStore.items.length > 0;
  if (mealPlanStore.needsPush || isFirstUpload) {
    await pushItems();
  } else {
    applyServerItems(serverItems);
  }
}

reaction(() => JSON.stringify(mealPlanStore.items), snapshot => {
  if (snapshot === lastSyncedSnapshot) return;
  mealPlanStore.needsPush = true;
  clearTimeout(pushTimer);
  pushTimer = setTimeout(() => {
    pushItems();
  }, PUSH_DELAY_MS);
});
