// Single place every screen reads a recipe's displayable image URI from,
// instead of touching `recipe.imageUrl` directly. Catalog recipes already
// carry a fully-resolved URL (see catalogAdapter's toFileUrl call) and user
// recipes carry a local file:// URI (see add-recipe.js) — both are already
// ready to hand to <Image>, so this is a passthrough today. Centralizing it
// here means a future fallback (e.g. a per-category placeholder when a
// recipe has no photo) only needs to change in one place.
export function recipeImageUri(recipe) {
  return recipe?.imageUrl || undefined;
}
