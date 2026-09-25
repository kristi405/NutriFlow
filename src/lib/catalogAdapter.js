/**
 * Maps backend catalog JSON (ingredient/recipe/tag rows as returned by
 * /app/sync and /app/recipes|ingredients) onto the view-model shapes the UI
 * was originally built against for the local seed data (§ src/data/seed/*).
 * Keeping that shape stable meant every screen/hook downstream of these
 * adapters needed only an import swap, not a rewrite.
 *
 * Text fields (name, description, cook_time, steps) arrive already resolved
 * to the requested language by the server (?lang=), so they're used as-is.
 * Tags are different: the app's logic keys off stable ids like "breakfast" or
 * "gluten-free", which the localized `name` can't provide — `slugs` maps each
 * tag id to its slug (see catalogStore.tagSlugs).
 */

const NUTRITION_KEY_MAP = {
  calories: 'calories',
  protein: 'protein',
  carbs: 'carbs',
  fat: 'fat',
  fiber: 'fiber',
  sugar: 'sugar',
  saturated_fat: 'saturatedFat',
  cholesterol: 'cholesterol',
  sodium: 'sodium',
  omega_3: 'omega3',
  omega_6: 'omega6'
};

const VITAMIN_KEY_MAP = {
  vitamin_a: 'vitaminA',
  vitamin_b1: 'vitaminB1',
  vitamin_b2: 'vitaminB2',
  vitamin_b3: 'vitaminB3',
  vitamin_b5: 'vitaminB5',
  vitamin_b6: 'vitaminB6',
  vitamin_b7: 'vitaminB7',
  vitamin_b9: 'vitaminB9',
  vitamin_b12: 'vitaminB12',
  vitamin_c: 'vitaminC',
  vitamin_d: 'vitaminD',
  vitamin_e: 'vitaminE',
  vitamin_k: 'vitaminK'
};

const MINERAL_KEYS = ['calcium', 'iron', 'magnesium', 'phosphorus', 'potassium', 'zinc', 'copper', 'manganese', 'selenium', 'iodine'];

// The backend has no ingredient-category taxonomy (meat/fish/dairy/...) — that
// grouping only exists client-side (§ src/data/seed/ingredientCategories.js)
// for shopping-list grouping and ingredient-swap candidates. Every migrated
// ingredient gets the catch-all bucket; swap suggestions simply won't offer
// alternatives for them and the shopping list groups them under "Other".
const FALLBACK_INGREDIENT_CATEGORY_ID = 'other';

function slugOf(tag, slugs) {
  return slugs?.[tag.id] ?? tag.name.toLowerCase();
}

export function adaptIngredient(raw, slugs) {
  const nutrition = {};
  for (const [dbKey, appKey] of Object.entries(NUTRITION_KEY_MAP)) {
    nutrition[appKey] = Number(raw[dbKey] ?? 0);
  }
  const vitamins = {};
  for (const [dbKey, appKey] of Object.entries(VITAMIN_KEY_MAP)) {
    vitamins[appKey] = Number(raw[dbKey] ?? 0);
  }
  const minerals = {};
  for (const key of MINERAL_KEYS) {
    minerals[key] = Number(raw[key] ?? 0);
  }
  // The DB has a single `sodium` column shared between the macro table and the
  // mineral table (see NUTRIFLOW_BACKEND's mapNutrients) — mirrored into both
  // here since the app reads it as nutrition.sodium, not minerals.sodium.
  minerals.sodium = nutrition.sodium;

  return {
    id: raw.id,
    name: raw.name,
    imageUrl: raw.image_url ?? undefined,
    categoryId: FALLBACK_INGREDIENT_CATEGORY_ID,
    subcategoryId: undefined,
    // The unit this ingredient is normally measured in (g, piece, tbsp, ...).
    defaultUnit: raw.default_unit || 'g',
    gramsPerUnit: raw.grams_per_unit || {},
    per100g: { nutrition, vitamins, minerals },
    allergens: tagValuesByType(raw.tags, 'allergen', slugs)
  };
}

function tagValuesByType(tags, type, slugs) {
  return (tags || []).filter(tag => tag.type === type).map(tag => slugOf(tag, slugs));
}

// Steps arrive as one "1. Do this\n2. Do that" string — split back into the
// {order, instruction} rows the UI renders.
function parseSteps(stepsText) {
  if (!stepsText) return [];
  return stepsText
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)
    .map((line, index) => ({ order: index + 1, instruction: line.replace(/^\d+\.\s*/, '') }));
}

// cook_time is free text in the requested language ("10 minutes", "1 ч 10 мин")
// so the UI shows it verbatim (cookTimeText). The numeric value is only a
// best-effort guess for logic that needs minutes — it can't reliably parse
// every language's units.
function parseCookTimeMinutes(cookTimeText) {
  if (!cookTimeText) return 0;
  const hourMatch = cookTimeText.match(/(\d+)\s*h/i);
  const minuteMatch = cookTimeText.match(/(\d+)\s*m/i);
  if (hourMatch || minuteMatch) {
    return (hourMatch ? Number(hourMatch[1]) * 60 : 0) + (minuteMatch ? Number(minuteMatch[1]) : 0);
  }
  const plainMatch = cookTimeText.match(/(\d+)/);
  return plainMatch ? Number(plainMatch[1]) : 0;
}

export function adaptRecipe(raw, slugs) {
  const tags = raw.tags || [];
  const [categoryId] = tagValuesByType(tags, 'category', slugs);

  return {
    id: raw.id,
    title: raw.name,
    description: raw.description,
    imageUrl: raw.image_url ?? undefined,
    servings: raw.servings || 1,
    categoryId,
    mealTypes: tagValuesByType(tags, 'meal_type', slugs),
    dietaryTags: tagValuesByType(tags, 'dietary', slugs),
    allergens: tagValuesByType(tags, 'allergen', slugs),
    // No backend equivalent yet — undefined lets the UI's existing
    // `{recipe.difficulty && ...}` guards skip the badge instead of crashing.
    difficulty: undefined,
    rating: undefined,
    ratingCount: undefined,
    prepTimeMinutes: 0,
    cookTimeText: raw.cook_time || undefined,
    cookTimeMinutes: parseCookTimeMinutes(raw.cook_time),
    isUserRecipe: false,
    ingredients: (raw.ingredients || [])
      .map(line => ({ ingredientId: line.ingredient?.id, quantity: Number(line.quantity), unit: line.unit }))
      .filter(line => line.ingredientId),
    steps: parseSteps(raw.steps)
  };
}

const CATEGORY_IMAGES = {
  breakfast: 'https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?w=800',
  lunch: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800',
  dinner: 'https://images.unsplash.com/photo-1529042410759-befb1204b468?w=800',
  salad: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=800',
  snack: 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=800',
  fruits: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=800',
  fruit: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=800'
};
const DEFAULT_CATEGORY_IMAGE = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800';

// Recipe categories used to be a fixed seed array; now they're just the
// `category`-type tags, so a new one added from the admin panel shows up here
// automatically (with a generic fallback photo instead of a curated one). The
// id stays the language-independent slug; the label is the localized name.
export function adaptCategories(tags, slugs) {
  return (tags || [])
    .filter(tag => tag.type === 'category')
    .map(tag => {
      const slug = slugOf(tag, slugs);
      return { id: slug, name: tag.name, imageUrl: CATEGORY_IMAGES[slug] ?? DEFAULT_CATEGORY_IMAGE };
    });
}
