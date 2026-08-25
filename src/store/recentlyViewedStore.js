import { makeAutoObservable } from 'mobx';
import { persistStore } from './persist';

const MAX_ENTRIES = 10;

class RecentlyViewedStore {
  recipeIds = [];
  hasHydrated = false;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
    persistStore(this, 'nutriflow.recently-viewed', ['recipeIds']);
  }

  recordView(recipeId) {
    this.recipeIds = [recipeId, ...this.recipeIds.filter(id => id !== recipeId)].slice(0, MAX_ENTRIES);
  }

  clear() {
    this.recipeIds = [];
  }
}

export const recentlyViewedStore = new RecentlyViewedStore();
