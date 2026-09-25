// Helpers for recipe-ingredient quantities, which can be in g, kg, ml, l,
// piece, tbsp, tsp, cup, slice or clove (an ingredient's `defaultUnit`).

export function formatUnit(t, unit) {
  return t(`units.${unit}`, { defaultValue: unit });
}

/** Starting amount when an ingredient is added to a recipe: 100 for weights/volumes, 1 for counted units. */
export function defaultQuantityFor(unit) {
  return unit === 'g' || unit === 'ml' ? '100' : '1';
}

/** Reads a typed quantity ("1,5" or "1.5"); anything not a positive number falls back to 1. */
export function parseQuantity(value) {
  const number = Number(String(value).replace(',', '.'));
  return Number.isFinite(number) && number > 0 ? number : 1;
}

export function formatQuantity(quantity) {
  return String(Math.round(Number(quantity) * 100) / 100);
}
