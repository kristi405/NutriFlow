import { toFileUrl } from './api';

// Server recipes (catalog and own) carry `imageFilename` (bare filename, same
// convention as everywhere else) and an already-resolved `imageUrl`. A legacy
// local recipe not yet migrated to the server (myRecipesStore.legacyRecipes)
// may only have a local file:// `imageUrl`. This picks whichever is displayable.
export function recipeImageUri(recipe) {
  if (!recipe) return undefined;
  return recipe.imageFilename ? toFileUrl(recipe.imageFilename) : recipe.imageUrl;
}