import { reaction, runInAction, when } from 'mobx';
import { apiRequest } from '@/lib/api';
import { authStore } from './authStore';
import { purgePersonData } from './peopleActions';
import { peopleStore } from './peopleStore';
import { profileStore } from './profileStore';
import { weightLogStore } from './weightLogStore';

/**
 * Keeps family members in step with the server, where they live in
 * `preferences.familyMembers` on the user (PUT/GET /app/users/me).
 *
 * Only profiles are stored server-side; each person's logged meals, plans
 * and water stay on this device. Weight is the exception: the server records
 * every profile weight change, and that history is merged back into the
 * local weight log here (so the chart survives a reinstall). A member's `photoUri` is a path on
 * this phone, so it is neither uploaded nor overwritten by a pull.
 */

const PUSH_DELAY_MS = 1500;

// Snapshot of what the server is known to hold, to tell real edits from echoes.
let lastSyncedSnapshot = null;
let pushTimer = null;

function serialize(members) {
  return members.map(({ id, profile }) => {
    const { photoUri, ...rest } = profile; // eslint-disable-line no-unused-vars
    return { id, profile: rest };
  });
}

async function pushMembers() {
  const me = profileStore.profile;
  if (!authStore.token || !me) return false;
  const familyMembers = serialize(peopleStore.members);
  const snapshot = JSON.stringify(familyMembers);
  const ok = await authStore.syncProfile(me, familyMembers);
  if (ok) {
    runInAction(() => {
      lastSyncedSnapshot = snapshot;
      peopleStore.needsPush = false;
      peopleStore.hasSyncedMembers = true;
    });
  }
  return ok;
}

function applyServerMembers(serverMembers) {
  const localById = new Map(peopleStore.members.map(member => [member.id, member]));
  const next = serverMembers.filter(member => member && typeof member.id === 'string' && member.profile).map(member => {
    const photoUri = localById.get(member.id)?.profile.photoUri;
    return { id: member.id, profile: photoUri ? { ...member.profile, photoUri } : member.profile };
  });
  const keptIds = new Set(next.map(member => member.id));
  lastSyncedSnapshot = JSON.stringify(serialize(next));
  runInAction(() => {
    // Members removed on another device leave orphaned local data behind.
    for (const member of peopleStore.members) {
      if (!keptIds.has(member.id)) purgePersonData(member.id);
    }
    peopleStore.replaceMembers(next);
    peopleStore.hasSyncedMembers = true;
  });
}

/** Reconcile with the server: upload pending local changes, otherwise take the server's list. */
export async function syncFamilyMembers() {
  if (!authStore.token) return;
  let me;
  try {
    me = await apiRequest('/app/users/me', { token: authStore.token });
  } catch {
    return; // offline — try again next launch
  }
  const serverMembers = Array.isArray(me?.preferences?.familyMembers) ? me.preferences.familyMembers : [];
  // Members created before the server supported them are uploaded once
  // instead of being wiped by the (empty) server list.
  const isFirstUpload = !peopleStore.hasSyncedMembers && serverMembers.length === 0 && peopleStore.members.length > 0;
  if (peopleStore.needsPush || isFirstUpload) {
    await pushMembers();
  } else {
    applyServerMembers(serverMembers);
  }

  // Weight history: the owner's is preferences.history.weight_kg, a member's
  // is familyMembers[].history.weightKg (both [{ value, ctime }], kept by the
  // server). Merged only after the local log has loaded from AsyncStorage —
  // hydration replaces `entries` and would drop anything merged before it.
  when(() => weightLogStore.hasHydrated, () => {
    weightLogStore.mergeServerHistory(null, me?.preferences?.history?.weight_kg);
    const memberIds = new Set(peopleStore.members.map(member => member.id));
    for (const member of serverMembers) {
      if (memberIds.has(member?.id)) weightLogStore.mergeServerHistory(member.id, member.history?.weightKg);
    }
  });

  // The "me" avatar is uploaded straight to the server (see profile.js), so the
  // server is always authoritative for it — just mirror it locally so it shows
  // up after a reinstall or on another device logged into the same account.
  if (profileStore.profile && (me?.photo_url ?? null) !== (profileStore.profile.photoUrl ?? null)) {
    runInAction(() => {
      profileStore.profile = { ...profileStore.profile, photoUrl: me?.photo_url ?? null };
    });
  }
}

// The owner's own profile (weight, goals, …) is pushed the same way. Besides
// keeping the server copy current, this is what makes the server record the
// weight history (it logs each real change of weight_kg) that
// mergeServerHistory restores above. Without familyMembers in the body the
// server keeps the members as they are; history/mealPlan/terms are kept too.
let ownerPushTimer = null;
reaction(() => {
  const profile = profileStore.profile;
  if (!profile) return null;
  const { photoUri, photoUrl, ...rest } = profile;
  return JSON.stringify(rest);
}, snapshot => {
  if (!snapshot || !authStore.token || !profileStore.hasOnboarded) return;
  clearTimeout(ownerPushTimer);
  ownerPushTimer = setTimeout(() => {
    if (profileStore.profile) authStore.syncProfile(profileStore.profile);
  }, PUSH_DELAY_MS);
});

reaction(() => JSON.stringify(serialize(peopleStore.members)), snapshot => {
  if (snapshot === lastSyncedSnapshot) return;
  peopleStore.needsPush = true;
  clearTimeout(pushTimer);
  pushTimer = setTimeout(() => {
    pushMembers();
  }, PUSH_DELAY_MS);
});
