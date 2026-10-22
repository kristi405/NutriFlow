import AsyncStorage from '@react-native-async-storage/async-storage';
import { makeAutoObservable, runInAction } from 'mobx';
import { apiRequest } from '@/lib/api';
import { persistStore } from './persist';

function upsertById(list, incoming) {
  const byId = new Map(list.map(item => [item.id, item]));
  for (const item of incoming) byId.set(item.id, item);
  return [...byId.values()];
}

function removeByIds(list, ids) {
  if (!ids || ids.length === 0) return list;
  const idSet = new Set(ids);
  return list.filter(item => !idSet.has(item.id));
}

// A language switch can start a second sync while the first is still in
// flight — only the most recently started one may write its result.
let latestSyncId = 0;

// Silently caps how often the manual refresh button can actually fire a
// request — `isSyncing` already blocks taps while one is in flight, this
// also covers repeated taps right after a fast one just finished. No error,
// no toast: an ignored tap just does nothing, same as if it landed a moment
// too early.
const MIN_MANUAL_SYNC_INTERVAL_MS = 50000;
let lastManualSyncAt = 0;

class CatalogStore {
  recipes = [];
  ingredients = [];
  tags = [];
  // tag id -> language-independent slug ("breakfast", "gluten-free", ...).
  // Tag names come back localized, but meal-plan/category logic keys off
  // stable slugs, so they're taken from the English names once per sync.
  tagSlugs = {};
  // Language the stored catalog text is in. A different language means the
  // stored rows can't be delta-merged, so the next sync is a full fetch.
  lang = null;
  // ISO date of the last successful sync — sent back to the server as `since`
  // so it only returns rows changed after this point. null means "never
  // synced", which makes the next sync a full fetch of the whole catalog.
  lastSyncedAt = null;
  // Whether that last sync ran without a token (guest — see /app/sync's
  // optionalAuth). Guest responses have no ingredients/nutrition at all, so
  // signing in afterwards must force a full re-fetch rather than an
  // incremental one, or the catalog would stay stuck without them forever.
  lastSyncWasGuest = false;
  hasHydrated = false;
  // True while a sync request is in flight — drives the refresh button's spinner.
  isSyncing = false;
  // Recipe ids returned by the most recent NON-first sync — for showing a
  // "new" badge. Intentionally not persisted: it only describes what just
  // arrived in this sync, not a standing property of the recipe.
  newRecipeIds = [];

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
    // v2: stored rows changed shape (localized fields instead of name_ru/name_en).
    AsyncStorage.removeItem('nutriflow.catalog').catch(() => {});
    persistStore(this, 'nutriflow.catalog.v2', ['recipes', 'ingredients', 'tags', 'tagSlugs', 'lang', 'lastSyncedAt', 'lastSyncWasGuest']);
  }

  isRecipeNew(id) {
    return this.newRecipeIds.includes(id);
  }

  // This only ever touches catalogStore's own recipes/ingredients/tags; the
  // user's own recipes live entirely in myRecipesStore and are untouched.
  // `manual`: pass true from the refresh button so rapid repeat taps are
  // silently capped (see MIN_MANUAL_SYNC_INTERVAL_MS) — login/language-change
  // syncs are deliberate, rare events and are never throttled.
  // `token` can be omitted for a guest sync (see /app/sync's optionalAuth) —
  // _layout.js only calls this once it knows whether the session is a real
  // login or an explicit "continue as guest", so there's nothing to guard
  // against here.
  async sync(token, lang, { manual = false } = {}) {
    if (manual) {
      const now = Date.now();
      if (now - lastManualSyncAt < MIN_MANUAL_SYNC_INTERVAL_MS) return;
      lastManualSyncAt = now;
    }
    const isGuestNow = !token;
    // A guest response has no ingredients/nutrition — merging it as a delta
    // onto an already-authenticated catalog (or vice versa, after signing in)
    // would silently leave stale/missing data, so either transition forces a
    // full fetch instead of an incremental one.
    const isFullSync = !this.lastSyncedAt || this.lang !== lang || isGuestNow !== this.lastSyncWasGuest;
    const params = new URLSearchParams({ lang });
    if (!isFullSync) params.set('since', this.lastSyncedAt);
    const syncId = ++latestSyncId;

    runInAction(() => {
      this.isSyncing = true;
    });

    let data;
    let englishTags;
    try {
      [data, englishTags] = await Promise.all([
        apiRequest(`/app/sync?${params}`, { token }),
        apiRequest('/app/tags?lang=en', { token })
      ]);
    } catch {
      // No internet / request failed — change nothing and try again next launch.
      runInAction(() => {
        if (syncId === latestSyncId) this.isSyncing = false;
      });
      return;
    }

    runInAction(() => {
      if (syncId !== latestSyncId) return;
      this.isSyncing = false;
      // Soft-deleted rows on the backend come back as ids in `deletedIds`
      // (see NUTRIFLOW_BACKEND's tombstone scheme) rather than just being
      // absent — a plain absence from a delta response wouldn't mean
      // anything, since the delta only lists what *changed*. A full sync's
      // deletedIds is always empty, so this is a no-op there.
      const deletedIds = data.deletedIds ?? {};
      this.recipes = removeByIds(isFullSync ? data.recipes : upsertById(this.recipes, data.recipes), deletedIds.recipes);
      this.ingredients = removeByIds(isFullSync ? data.ingredients : upsertById(this.ingredients, data.ingredients), deletedIds.ingredients);
      this.tags = removeByIds(isFullSync ? data.tags : upsertById(this.tags, data.tags), deletedIds.tags);
      this.tagSlugs = Object.fromEntries(englishTags.map(tag => [tag.id, tag.name.toLowerCase()]));
      // Never highlight anything on a full fetch — that's the starting catalog
      // (first launch or a language switch), not "new" relative to anything
      // the user has seen.
      this.newRecipeIds = isFullSync ? [] : data.recipes.map(recipe => recipe.id);
      this.lang = lang;
      this.lastSyncedAt = data.syncedAt;
      this.lastSyncWasGuest = isGuestNow;
    });
  }
}

export const catalogStore = new CatalogStore();
