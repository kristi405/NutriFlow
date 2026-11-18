import { AppState } from 'react-native';
import { makeAutoObservable, reaction, runInAction, when } from 'mobx';
import { apiRequest } from '@/lib/api';
import { toDateKey } from '@/lib/date';
import { authStore } from './authStore';
import { favoritesStore } from './favoritesStore';
import { DEFAULT_FASTING_SETTINGS, fastingStore } from './fastingStore';
import { foodLogStore } from './foodLogStore';
import { persistStore } from './persist';
import { waterStore } from './waterStore';

/**
 * Keeps the food log, water log, favorite recipes and intermittent fasting
 * (fasts + settings) on the server
 * (GET /app/user-data?since=, POST /app/user-data/batch — NUTRIFLOW_BACKEND
 * table user_entry), so they survive a reinstall or a new phone.
 *
 * The stores themselves are unchanged: this module compares what they hold
 * with what was last confirmed by the server (a hash per record in `synced`)
 * and derives the changes — a new or edited record is an upsert, a record
 * that was synced but is gone locally is a delete. So every existing call
 * site (logMeal, addWater, toggleFavorite, purgePersonData, …) is covered.
 *
 * One sync = pull (server changes since lastSyncedAt) then push (local
 * pending changes). On pull a record with a pending local change is left
 * alone — the push that follows sends the local version.
 *
 * Accounts: data that was on the device before this feature existed is
 * uploaded into the first account that syncs. Signing in to a *different*
 * account replaces the local records with that account's server data, so
 * one account's diary never ends up in another.
 */

const PUSH_DELAY_MS = 3000;
const MAX_BATCH = 500;

// Per kind: where the records live and how one maps to a server record
// ({ id, personId, date, data }) and back. `data` is stored by the server as is.
const KINDS = {
  food_log: {
    get: () => foodLogStore.entries,
    set: items => { foodLogStore.entries = items; },
    toServer: ({ id, personId, date, ...data }) => ({ id, personId: personId ?? null, date: date ?? null, data }),
    fromServer: ({ id, personId, date, data }) => ({ ...data, id, ...(date ? { date } : {}), ...(personId ? { personId } : {}) })
  },
  water: {
    get: () => waterStore.entries,
    set: items => { waterStore.entries = items; },
    toServer: ({ id, personId, date, ...data }) => ({ id, personId: personId ?? null, date: date ?? null, data }),
    fromServer: ({ id, personId, date, data }) => ({ ...data, id, ...(date ? { date } : {}), ...(personId ? { personId } : {}) })
  },
  favorite: {
    get: () => favoritesStore.favorites,
    set: items => { favoritesStore.favorites = items; },
    toServer: ({ recipeId, ...data }) => ({ id: recipeId, personId: null, date: null, data }),
    fromServer: ({ id, data }) => ({ ...data, recipeId: id })
  },
  fast: {
    get: () => fastingStore.fasts,
    set: items => { fastingStore.fasts = items; },
    toServer: ({ id, ...data }) => ({ id, personId: null, date: data.startedAt ? toDateKey(new Date(data.startedAt)) : null, data }),
    fromServer: ({ id, data }) => ({ ...data, id })
  },
  // A single record (id "fasting"). Untouched defaults (no updatedAt) aren't
  // listed, so they're neither uploaded nor allowed to override the server's.
  setting: {
    get: () => fastingStore.settings.updatedAt ? [{ ...fastingStore.settings, id: 'fasting' }] : [],
    set: items => {
      const { id: _id, ...saved } = items.find(item => item.id === 'fasting') ?? {};
      fastingStore.settings = { ...DEFAULT_FASTING_SETTINGS, ...saved };
    },
    toServer: ({ id, ...data }) => ({ id, personId: null, date: null, data }),
    fromServer: ({ id, data }) => ({ ...data, id })
  }
};
const KIND_NAMES = Object.keys(KINDS);

// JSON with sorted keys — Postgres jsonb returns keys in its own order, and
// the same record must hash the same whichever side it came from.
function stableStringify(value) {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value).filter(key => value[key] !== undefined).sort().map(key => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(',')}}`;
  }
  return JSON.stringify(value ?? null);
}

// Short fingerprint of a server-shaped record — enough to notice an edit.
function hashOf(serverRecord) {
  const text = stableStringify(serverRecord);
  let hash = 5381;
  for (let index = 0; index < text.length; index += 1) hash = ((hash << 5) + hash + text.charCodeAt(index)) | 0;
  return `${text.length}:${hash >>> 0}`;
}

class UserDataSyncState {
  // Account the local records were last synced with (null — never synced on this device).
  syncedUserId = null;
  lastSyncedAt = null;
  // { [kind]: { [id]: hash } } — what the server is known to hold.
  synced = {};
  hasHydrated = false;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
    persistStore(this, 'nutriflow.user-data-sync', ['syncedUserId', 'lastSyncedAt', 'synced']);
  }

  // Account deletion: the server data is gone, start from scratch.
  reset() {
    this.syncedUserId = null;
    this.lastSyncedAt = null;
    this.synced = {};
  }
}

export const userDataSyncState = new UserDataSyncState();

const allHydrated = () => userDataSyncState.hasHydrated && foodLogStore.hasHydrated && waterStore.hasHydrated && favoritesStore.hasHydrated && fastingStore.hasHydrated;

function isPending(kind, serverRecord) {
  return userDataSyncState.synced[kind]?.[serverRecord.id] !== hashOf(serverRecord);
}

// A pending local edit normally wins over the server. Records that carry
// updatedAt (fasts, settings) compare it instead: a newer edit from another
// device wins over an older local one.
function keepsLocal(kind, local, serverEntry) {
  if (!isPending(kind, KINDS[kind].toServer(local))) return false;
  const serverUpdatedAt = serverEntry?.data?.updatedAt;
  return !(serverUpdatedAt && (!local.updatedAt || serverUpdatedAt > local.updatedAt));
}

function applyPull(response) {
  runInAction(() => {
    const synced = { ...userDataSyncState.synced };
    for (const kind of KIND_NAMES) {
      const config = KINDS[kind];
      const known = { ...(synced[kind] ?? {}) };
      const localById = new Map(config.get().map(item => [config.toServer(item).id, item]));
      let changed = false;

      for (const ref of response.deleted ?? []) {
        if (ref.kind !== kind) continue;
        const local = localById.get(ref.id);
        // A local edit made after the last sync wins over the remote delete.
        if (local && keepsLocal(kind, local, null)) continue;
        if (local) {
          localById.delete(ref.id);
          changed = true;
        }
        delete known[ref.id];
      }

      for (const entry of response.entries ?? []) {
        if (entry.kind !== kind) continue;
        const local = localById.get(entry.id);
        if (local && keepsLocal(kind, local, entry)) continue; // local edit pending and not older
        if (!local && known[entry.id]) continue; // deleted locally, delete pending
        const item = config.fromServer(entry);
        localById.set(entry.id, item);
        known[entry.id] = hashOf(config.toServer(item));
        changed = true;
      }

      if (changed) config.set([...localById.values()]);
      synced[kind] = known;
    }
    userDataSyncState.synced = synced;
    userDataSyncState.lastSyncedAt = response.syncedAt;
  });
}

function pendingChanges() {
  const upserts = [];
  const deletes = [];
  for (const kind of KIND_NAMES) {
    const config = KINDS[kind];
    const known = userDataSyncState.synced[kind] ?? {};
    const localIds = new Set();
    for (const item of config.get()) {
      const record = config.toServer(item);
      if (!record.id) continue;
      localIds.add(record.id);
      if (known[record.id] !== hashOf(record)) upserts.push({ kind, ...record });
    }
    for (const id of Object.keys(known)) {
      if (!localIds.has(id)) deletes.push({ kind, id });
    }
  }
  return { upserts, deletes };
}

async function push(token) {
  const { upserts, deletes } = pendingChanges();
  const items = [...upserts.map(item => ({ type: 'upsert', item })), ...deletes.map(item => ({ type: 'delete', item }))];
  for (let start = 0; start < items.length; start += MAX_BATCH) {
    const chunk = items.slice(start, start + MAX_BATCH);
    const body = {
      upserts: chunk.filter(entry => entry.type === 'upsert').map(entry => entry.item),
      deletes: chunk.filter(entry => entry.type === 'delete').map(entry => entry.item)
    };
    await apiRequest('/app/user-data/batch', { method: 'POST', token, body });
    runInAction(() => {
      const synced = { ...userDataSyncState.synced };
      for (const { kind, id, personId, date, data } of body.upserts) {
        synced[kind] = { ...(synced[kind] ?? {}), [id]: hashOf({ id, personId, date, data }) };
      }
      for (const { kind, id } of body.deletes) {
        if (!synced[kind]) continue;
        const { [id]: _removed, ...rest } = synced[kind];
        synced[kind] = rest;
      }
      userDataSyncState.synced = synced;
    });
  }
}

let isSyncing = false;
let syncAgain = false;

/** Pull server changes, then push local ones. Safe to call often; offline is a no-op. */
export async function syncUserData() {
  const token = authStore.token;
  const userId = authStore.currentUser?.id;
  if (!token || !userId || authStore.isGuest) return;
  if (isSyncing) {
    syncAgain = true;
    return;
  }
  isSyncing = true;
  try {
    await when(allHydrated);
    if (userDataSyncState.syncedUserId && userDataSyncState.syncedUserId !== userId) {
      // Another account signed in on this device: its data comes from the server.
      runInAction(() => {
        for (const kind of KIND_NAMES) KINDS[kind].set([]);
        userDataSyncState.reset();
      });
    }
    const since = userDataSyncState.syncedUserId === userId ? userDataSyncState.lastSyncedAt : null;
    const query = since ? `?since=${encodeURIComponent(since)}` : '';
    const response = await apiRequest(`/app/user-data${query}`, { token });
    if (authStore.currentUser?.id !== userId) return; // account changed mid-request
    applyPull(response);
    runInAction(() => {
      userDataSyncState.syncedUserId = userId;
    });
    await push(token);
  } catch (error) {
    if (__DEV__) console.warn(`[userDataSync] ${error.message}`);
  } finally {
    isSyncing = false;
    if (syncAgain) {
      syncAgain = false;
      syncUserData();
    }
  }
}

// Local edits are pushed shortly after they happen (a pull that changed
// nothing pending pushes nothing). Only after the first sync for this
// account — before that, the pull must run first.
let pushTimer = null;
reaction(() => KIND_NAMES.map(kind => JSON.stringify(KINDS[kind].get())).join('|'), () => {
  if (!authStore.token || authStore.isGuest || userDataSyncState.syncedUserId !== authStore.currentUser?.id) return;
  clearTimeout(pushTimer);
  pushTimer = setTimeout(syncUserData, PUSH_DELAY_MS);
});

// Coming back to the app picks up what another device changed meanwhile.
AppState.addEventListener('change', state => {
  if (state === 'active') syncUserData();
});
