import { LocalRecipeRepository } from './localRecipeRepository';
// Single seam to swap for a Supabase-backed implementation later — nothing above
// this module should import LocalRecipeRepository directly.
export const recipeRepository = new LocalRecipeRepository();
