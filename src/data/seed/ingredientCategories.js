// Each top-level ingredient category can carry finer subcategories (e.g. Meat -> Poultry/Beef/Pork)
// so ingredients can be grouped broadly or precisely depending on where the UI needs it.
export const INGREDIENT_CATEGORIES = [{
  id: 'meat',
  name: 'Meat',
  subcategories: [{ id: 'poultry', name: 'Poultry' }, { id: 'beef', name: 'Beef' }, { id: 'pork', name: 'Pork & Bacon' }]
}, {
  id: 'fish',
  name: 'Seafood',
  subcategories: [{ id: 'fin-fish', name: 'Fish' }, { id: 'shellfish', name: 'Shellfish' }]
}, {
  id: 'dairy',
  name: 'Dairy',
  subcategories: [{ id: 'milk', name: 'Milk & Cream' }, { id: 'cheese', name: 'Cheese' }, { id: 'cultured', name: 'Yogurt & Cultured' }, { id: 'butter', name: 'Butter' }]
}, {
  id: 'bakery',
  name: 'Bread & Baking',
  subcategories: [{ id: 'bread', name: 'Bread' }, { id: 'tortillas', name: 'Tortillas & Wraps' }]
}, {
  id: 'pantry',
  name: 'Pantry',
  subcategories: [{ id: 'grains', name: 'Grains & Sides' }, { id: 'legumes', name: 'Legumes' }, { id: 'nuts-seeds', name: 'Nuts & Seeds' }, { id: 'oils-condiments', name: 'Oils & Condiments' }, { id: 'spices', name: 'Spices' }, { id: 'canned-broths', name: 'Canned & Broths' }, { id: 'other', name: 'Other' }]
}, {
  id: 'produce',
  name: 'Produce',
  subcategories: [{ id: 'vegetables', name: 'Vegetables' }, { id: 'fruits', name: 'Fruits' }, { id: 'berries', name: 'Berries' }, { id: 'herbs', name: 'Herbs' }]
}, {
  id: 'other',
  name: 'Other',
  subcategories: [{ id: 'eggs', name: 'Eggs' }]
}];

const INGREDIENT_CATEGORY_INDEX = new Map(INGREDIENT_CATEGORIES.map(item => [item.id, item]));
export function getIngredientCategoryById(id) {
  return INGREDIENT_CATEGORY_INDEX.get(id);
}

export function getIngredientSubcategoryById(categoryId, subcategoryId) {
  return getIngredientCategoryById(categoryId)?.subcategories.find(item => item.id === subcategoryId);
}
