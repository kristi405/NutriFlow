import { makeAutoObservable, runInAction } from 'mobx';
import { apiRequest } from '@/lib/api';
import { persistStore } from './persist';

function upsertById(list, incoming) {
  const byId = new Map(list.map(item => [item.id, item]));
  for (const item of incoming) byId.set(item.id, item);
  return [...byId.values()];
}

class CatalogStore {
  recipes = [];
  ingredients = [];
  tags = [];
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
    persistStore(this, 'nutriflow.catalog', ['recipes', 'ingredients', 'tags', 'lastSyncedAt']);
  }

  isRecipeNew(id) {
    return this.newRecipeIds.includes(id);
  }

  async sync(token) {
    if (!token) return;
    const isFirstSync = !this.lastSyncedAt;
    const query = this.lastSyncedAt ? `?since=${encodeURIComponent(this.lastSyncedAt)}` : '';

    let data;
    try {
      data = await apiRequest(`/app/sync${query}`, { token });
    } catch {
      // No internet / request failed — change nothing and try again next launch.
      return;
    }

    runInAction(() => {
      this.recipes = upsertById(this.recipes, data.recipes);
      this.ingredients = upsertById(this.ingredients, data.ingredients);
      this.tags = upsertById(this.tags, data.tags);
      // Never highlight anything on the very first sync — that's just the
      // starting catalog, not "new" relative to anything the user has seen.
      this.newRecipeIds = isFirstSync ? [] : data.recipes.map(recipe => recipe.id);
      this.lastSyncedAt = data.syncedAt;
    });
  }
}

export const catalogStore = new CatalogStore();
