/**
 * Maps backend catalog JSON (ingredient/recipe/tag rows as returned by
 * /app/sync and /app/recipes|ingredients) onto the view-model shapes the UI
 * was originally built against for the local seed data (§ src/data/seed/*).
 * Keeping that shape stable meant every screen/hook downstream of these
 * adapters needed only an import swap, not a rewrite.
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

export function adaptIngredient(raw) {
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
    name: raw.name_en,
    imageUrl: raw.image_url ?? undefined,
    categoryId: FALLBACK_INGREDIENT_CATEGORY_ID,
    subcategoryId: undefined,
    gramsPerUnit: raw.grams_per_unit || {},
    per100g: { nutrition, vitamins, minerals },
    allergens: (raw.tags || []).filter(tag => tag.type === 'allergen').map(tag => tag.name_en)
  };
}

function tagValuesByType(tags, type) {
  return (tags || []).filter(tag => tag.type === type).map(tag => tag.name_en);
}

// Backend steps are stored as "1. Do this\n2. Do that" (see RecipeService) —
// split back into the {order, instruction} rows the UI renders.
function parseSteps(stepsText) {
  if (!stepsText) return [];
  return stepsText
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)
    .map((line, index) => ({ order: index + 1, instruction: line.replace(/^\d+\.\s*/, '') }));
}

// cook_time is a free-text combined duration ("10 minutes", "1h 10m") — the
// prep/cook split from the seed data doesn't survive migration, so the whole
// duration is attributed to cookTimeMinutes (prepTimeMinutes stays 0) purely
// so `prepTimeMinutes + cookTimeMinutes` in the UI still shows the real total.
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

export function adaptRecipe(raw) {
  const tags = raw.tags || [];
  const [categoryId] = tagValuesByType(tags, 'category');

  return {
    id: raw.id,
    title: raw.name_en,
    description: raw.description_en,
    imageUrl: raw.image_url ?? undefined,
    servings: raw.servings || 1,
    categoryId,
    mealTypes: tagValuesByType(tags, 'meal_type'),
    dietaryTags: tagValuesByType(tags, 'dietary'),
    allergens: tagValuesByType(tags, 'allergen'),
    // No backend equivalent yet — undefined lets the UI's existing
    // `{recipe.difficulty && ...}` guards skip the badge instead of crashing.
    difficulty: undefined,
    rating: undefined,
    ratingCount: undefined,
    prepTimeMinutes: 0,
    cookTimeMinutes: parseCookTimeMinutes(raw.cook_time_en),
    isUserRecipe: false,
    ingredients: (raw.ingredients || [])
      .map(line => ({ ingredientId: line.ingredient?.id, quantity: Number(line.quantity), unit: line.unit }))
      .filter(line => line.ingredientId),
    steps: parseSteps(raw.steps_en)
  };
}

const CATEGORY_IMAGES = {
  breakfast: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=800',
  lunch: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800',
  dinner: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800',
  salad: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800',
  snack: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800'
};
const DEFAULT_CATEGORY_IMAGE = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800';

function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

// Recipe categories used to be a fixed seed array; now they're just the
// `category`-type tags, so a new one added from the admin panel shows up here
// automatically (with a generic fallback photo instead of a curated one).
export function adaptCategories(tags) {
  return (tags || [])
    .filter(tag => tag.type === 'category')
    .map(tag => ({
      id: tag.name_en,
      name: capitalize(tag.name_en),
      imageUrl: CATEGORY_IMAGES[tag.name_en] ?? DEFAULT_CATEGORY_IMAGE
    }));
}
