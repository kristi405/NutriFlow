import { toFileUrl } from './api';

// Catalog recipes already resolve `imageUrl` to a full backend URL (see
// catalogAdapter). A user's own recipe (myRecipesStore) may instead carry
// `imageFilename` (uploaded to the backend by myRecipesSync, bare filename —
// same convention as everywhere else) or a local file:// `imageUrl` for a
// photo not yet synced. This picks whichever is actually displayable.
export function recipeImageUri(recipe) {
  if (!recipe) return undefined;
  return recipe.imageFilename ? toFileUrl(recipe.imageFilename) : recipe.imageUrl;
}