import { makeAutoObservable } from 'mobx';
import { persistStore } from './persist';

class FavoritesStore {
  favorites = [];
  hasHydrated = false;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
    persistStore(this, 'nutriflow.favorites', ['favorites']);
  }

  isFavorite(recipeId) {
    return this.favorites.some(favorite => favorite.recipeId === recipeId);
  }

  toggleFavorite(recipeId, collection = 'favorites') {
    const exists = this.favorites.some(favorite => favorite.recipeId === recipeId);
    if (exists) {
      this.favorites = this.favorites.filter(favorite => favorite.recipeId !== recipeId);
    } else {
      this.favorites.push({ recipeId, collection, savedAt: new Date().toISOString() });
    }
  }
}

export const favoritesStore = new FavoritesStore();
