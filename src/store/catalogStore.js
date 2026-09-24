import AsyncStorage from '@react-native-async-storage/async-storage';
import { makeAutoObservable, runInAction } from 'mobx';
import { apiRequest } from '@/lib/api';
import { persistStore } from './persist';

function upsertById(list, incoming) {
  const byId = new Map(list.map(item => [item.id, item]));
  for (const item of incoming) byId.set(item.id, item);
  return [...byId.values()];
}

// A language switch can start a second sync while the first is still in
// flight — only the most recently started one may write its result.
let latestSyncId = 0;

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
  hasHydrated = false;
  // Recipe ids returned by the most recent NON-first sync — for showing a
  // "new" badge. Intentionally not persisted: it only describes what just
  // arrived in this sync, not a standing property of the recipe.
  newRecipeIds = [];

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
    // v2: stored rows changed shape (localized fields instead of name_ru/name_en).
    AsyncStorage.removeItem('nutriflow.catalog').catch(() => {});
    persistStore(this, 'nutriflow.catalog.v2', ['recipes', 'ingredients', 'tags', 'tagSlugs', 'lang', 'lastSyncedAt']);
  }

  isRecipeNew(id) {
    return this.newRecipeIds.includes(id);
  }

  async sync(token, lang) {
    if (!token) return;
    const isFullSync = !this.lastSyncedAt || this.lang !== lang;
    const params = new URLSearchParams({ lang });
    if (!isFullSync) params.set('since', this.lastSyncedAt);
    const syncId = ++latestSyncId;

    let data;
    let englishTags;
    try {
      [data, englishTags] = await Promise.all([
        apiRequest(`/app/sync?${params}`, { token }),
        apiRequest('/app/tags?lang=en', { token })
      ]);
    } catch {
      // No internet / request failed — change nothing and try again next launch.
      return;
    }

    runInAction(() => {
      if (syncId !== latestSyncId) return;
      this.recipes = isFullSync ? data.recipes : upsertById(this.recipes, data.recipes);
      this.ingredients = isFullSync ? data.ingredients : upsertById(this.ingredients, data.ingredients);
      this.tags = isFullSync ? data.tags : upsertById(this.tags, data.tags);
      this.tagSlugs = Object.fromEntries(englishTags.map(tag => [tag.id, tag.name.toLowerCase()]));
      // Never highlight anything on a full fetch — that's the starting catalog
      // (first launch or a language switch), not "new" relative to anything
      // the user has seen.
      this.newRecipeIds = isFullSync ? [] : data.recipes.map(recipe => recipe.id);
      this.lang = lang;
      this.lastSyncedAt = data.syncedAt;
    });
  }
}

export const catalogStore = new CatalogStore();
