import { makeAutoObservable } from 'mobx';
import { persistStore } from './persist';

function normalizeSteps(steps) {
  return steps.map((instruction, index) => ({ order: index + 1, instruction }));
}

class MyRecipesStore {
  recipes = [];
  hasHydrated = false;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
    persistStore(this, 'nutriflow.myRecipes', ['recipes']);
  }

  addRecipe({ title, categoryId, imageUrl, servings, prepTimeMinutes, cookTimeMinutes, difficulty, ingredients, steps }) {
    const id = `my-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    this.recipes = [...this.recipes, {
      id,
      title,
      description: '',
      categoryId,
      imageUrl: imageUrl || undefined,
      prepTimeMinutes,
      cookTimeMinutes,
      difficulty,
      servings,
      mealTypes: [],
      dietaryTags: [],
      allergens: [],
      ingredients,
      steps: normalizeSteps(steps),
      isUserRecipe: true
    }];
    return id;
  }

  updateRecipe(id, patch) {
    const recipe = this.recipes.find(recipe => recipe.id === id);
    if (recipe) Object.assign(recipe, patch);
  }

  removeRecipe(id) {
    this.recipes = this.recipes.filter(recipe => recipe.id !== id);
  }

  getById(id) {
    return this.recipes.find(recipe => recipe.id === id);
  }
}

export const myRecipesStore = new MyRecipesStore();
