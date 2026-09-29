import { favoritesStore } from './favoritesStore';
import { foodLogStore } from './foodLogStore';
import { mealPlanStore } from './mealPlanStore';
import { myRecipesStore } from './myRecipesStore';
import { recentlyViewedStore } from './recentlyViewedStore';

// A user-created recipe lives only on this device — deleting it also clears
// every other place that referenced it by id, so it doesn't linger as a
// broken reference in meal plans, the food log, favorites or recently viewed.
export function deleteUserRecipe(id) {
  mealPlanStore.removeItemsForRecipe(id);
  foodLogStore.removeEntriesForRecipe(id);
  recentlyViewedStore.removeRecipe(id);
  if (favoritesStore.isFavorite(id)) favoritesStore.toggleFavorite(id);
  myRecipesStore.removeRecipe(id);
}
