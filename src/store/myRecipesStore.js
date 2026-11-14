import AsyncStorage from '@react-native-async-storage/async-storage';
import { autorun, makeAutoObservable, runInAction } from 'mobx';
import { adaptRecipe } from '@/lib/catalogAdapter';
import { authStore } from './authStore';
import { catalogStore } from './catalogStore';

// Same key the old device-only store used — its `recipes` field is read back
// as `legacyRecipes` so nothing created by an older app version is lost.
const STORAGE_KEY = 'nutriflow.myRecipes';

/**
 * The user's own recipes.
 *
 * Own recipes now live on the server as ordinary recipe rows (user_id = me,
 * is_public = false) and arrive through /app/sync into catalogStore like the
 * rest of the catalog — `recipes` is derived from there, there's nothing to
 * sync separately. Create/update/delete go through lib/userContent.js.
 *
 * `legacyRecipes` holds recipes an older app version kept only on the device
 * (and in preferences.myRecipes). lib/legacyRecipeMigration.js moves them to
 * the server; until a recipe is moved it stays here and keeps showing up, so
 * meal-plan entries referencing it don't break.
 */
class MyRecipesStore {
  legacyRecipes = [];
  hasHydrated = false;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
    this.hydrate();
  }

  async hydrate() {
    let saved = null;
    try {
      saved = JSON.parse((await AsyncStorage.getItem(STORAGE_KEY)) ?? 'null');
    } catch {
      // corrupt entry — treat as empty
    }
    runInAction(() => {
      this.legacyRecipes = Array.isArray(saved?.recipes) ? saved.recipes : [];
      this.hasHydrated = true;
    });
    autorun(() => {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ recipes: this.legacyRecipes }));
    });
  }

  /** Own, still-private recipes from the server cache. */
  get serverRecipes() {
    const userId = authStore.currentUser?.id;
    if (!userId) return [];
    return catalogStore.recipes
      .filter(raw => raw.user_id === userId && raw.is_public === false)
      .map(raw => adaptRecipe(raw, catalogStore.tagSlugs, userId));
  }

  get recipes() {
    const legacy = this.legacyRecipes.map(recipe => ({ ...recipe, isUserRecipe: true, isLegacy: true, isOwn: true, isEditable: false }));
    return [...this.serverRecipes, ...legacy];
  }

  getById(id) {
    return this.recipes.find(recipe => recipe.id === id);
  }

  removeLegacyRecipe(id) {
    this.legacyRecipes = this.legacyRecipes.filter(recipe => recipe.id !== id);
  }

  // Called on account deletion, so this account's leftover local recipes
  // don't linger for whoever signs in next on the same device. (Server-side
  // own recipes disappear with the account; the catalog cache drops them on
  // the next user's full sync.)
  reset() {
    this.legacyRecipes = [];
  }
}

export const myRecipesStore = new MyRecipesStore();
