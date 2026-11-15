import { toFileUrl, toThumbUrl } from './api';

// Server recipes (catalog and own) carry `imageFilename` (bare filename, same
// convention as everywhere else) and an already-resolved `imageUrl`. A legacy
// local recipe not yet migrated to the server (myRecipesStore.legacyRecipes)
// may only have a local file:// `imageUrl`. This picks whichever is displayable.
export function recipeImageUri(recipe) {
  if (!recipe) return undefined;
  return recipe.imageFilename ? toFileUrl(recipe.imageFilename) : recipe.imageUrl;
}

/** Small preview for lists/cards (falls back to the original for local photos). Pair with recipeImageUri as the fallback. */
export function recipeThumbUri(recipe) {
  if (!recipe) return undefined;
  return toThumbUrl(recipe.imageFilename) ?? recipeImageUri(recipe);
}

/** Avatar sources for a profile: { uri: preview, fallbackUri: original } (local photoUri has no preview). */
export function avatarSources(profile) {
  if (profile?.photoUrl) return { uri: toThumbUrl(profile.photoUrl) ?? toFileUrl(profile.photoUrl), fallbackUri: toFileUrl(profile.photoUrl) };
  return { uri: profile?.photoUri ?? undefined, fallbackUri: undefined };
}
