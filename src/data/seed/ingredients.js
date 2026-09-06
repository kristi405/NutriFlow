import { ZERO_MINERALS, ZERO_NUTRITION, ZERO_VITAMINS } from '@/models/nutrition';
/** Builds a full Ingredient from a terse input — unspecified micronutrients default to
 *  nutritionally-negligible zero rather than requiring every field to be hand-entered. */
function ing(input) {
  return {
    id: input.id,
    name: input.name,
    categoryId: input.categoryId,
    subcategoryId: input.subcategoryId,
    gramsPerUnit: input.gramsPerUnit ?? {},
    per100g: {
      nutrition: {
        ...ZERO_NUTRITION,
        ...input.nutrition
      },
      vitamins: {
        ...ZERO_VITAMINS,
        ...input.vitamins
      },
      minerals: {
        ...ZERO_MINERALS,
        ...input.minerals
      }
    },
    allergens: input.allergens ?? []
  };
}

// All values are approximate per-100g/100ml reference amounts, in the spirit of a
// standard food-composition table. Good enough for a premium product demo — not a
// substitute for a certified nutrition database.
export const INGREDIENTS = [
// ---- Protein / meat / fish ----
ing({
  id: 'egg',
  name: 'Egg',
  categoryId: 'other',
  subcategoryId: 'eggs',
  gramsPerUnit: {
    piece: 50
  },
  nutrition: {
    calories: 143,
    protein: 12.6,
    carbs: 0.7,
    fat: 9.5,
    saturatedFat: 3.1,
    cholesterol: 372,
    sodium: 142
  },
  vitamins: {
    vitaminA: 160,
    vitaminB2: 0.5,
    vitaminB12: 1.1,
    vitaminD: 2,
    vitaminB9: 47,
    vitaminB1: 0.07,
    vitaminB3: 0.1,
    vitaminB5: 1.4,
    vitaminB6: 0.1,
    vitaminE: 1,
    vitaminK: 0.3
  },
  minerals: {
    selenium: 30,
    iron: 1.8,
    phosphorus: 198,
    zinc: 1.3,
    calcium: 56,
    magnesium: 10,
    potassium: 138,
    copper: 0.01,
    manganese: 0.03,
    iodine: 24
  },
  allergens: ['egg']
}), ing({
  id: 'chicken-breast',
  name: 'Chicken breast',
  categoryId: 'meat',
  subcategoryId: 'poultry',
  nutrition: {
    calories: 165,
    protein: 31,
    carbs: 0,
    fat: 3.6,
    saturatedFat: 1,
    cholesterol: 85,
    sodium: 74
  },
  vitamins: {
    vitaminB3: 13.7,
    vitaminB6: 0.6,
    vitaminB1: 0.07,
    vitaminB2: 0.1,
    vitaminB5: 1,
    vitaminB9: 4,
    vitaminB12: 0.3,
    vitaminE: 0.3,
    vitaminK: 0.3
  },
  minerals: {
    phosphorus: 220,
    selenium: 27,
    zinc: 1,
    potassium: 256,
    calcium: 15,
    magnesium: 29,
    iron: 1
  }
}), ing({
  id: 'chicken-thigh',
  name: 'Chicken thigh',
  categoryId: 'meat',
  subcategoryId: 'poultry',
  nutrition: {
    calories: 209,
    protein: 26,
    carbs: 0,
    fat: 10.9,
    saturatedFat: 3,
    cholesterol: 95,
    sodium: 90
  },
  vitamins: {
    vitaminB3: 5.3,
    vitaminB6: 0.3,
    vitaminB1: 0.08,
    vitaminB2: 0.19,
    vitaminB5: 1.1,
    vitaminB9: 6,
    vitaminB12: 0.3,
    vitaminE: 0.3
  },
  minerals: {
    phosphorus: 180,
    zinc: 2,
    iron: 1.3,
    calcium: 12,
    magnesium: 23,
    potassium: 240,
    selenium: 18
  }
}), ing({
  id: 'ground-beef',
  name: 'Ground beef (85/15)',
  categoryId: 'meat',
  subcategoryId: 'beef',
  nutrition: {
    calories: 215,
    protein: 26,
    carbs: 0,
    fat: 12,
    saturatedFat: 4.6,
    cholesterol: 78,
    sodium: 66
  },
  vitamins: {
    vitaminB12: 2.6,
    vitaminB3: 5,
    vitaminB1: 0.05,
    vitaminB2: 0.15,
    vitaminB5: 0.5,
    vitaminB6: 0.3,
    vitaminB9: 8,
    vitaminE: 0.2,
    vitaminK: 1.6
  },
  minerals: {
    iron: 2.6,
    zinc: 4.8,
    phosphorus: 200,
    calcium: 18,
    magnesium: 20,
    potassium: 270,
    selenium: 18
  }
}), ing({
  id: 'ground-turkey',
  name: 'Ground turkey',
  categoryId: 'meat',
  subcategoryId: 'poultry',
  nutrition: {
    calories: 149,
    protein: 24,
    carbs: 0,
    fat: 5,
    saturatedFat: 1.4,
    cholesterol: 88,
    sodium: 79
  },
  vitamins: {
    vitaminB3: 6.5,
    vitaminB6: 0.5,
    vitaminB1: 0.06,
    vitaminB2: 0.18,
    vitaminB5: 0.9,
    vitaminB9: 7,
    vitaminB12: 1.6,
    vitaminE: 0.2
  },
  minerals: {
    selenium: 25,
    zinc: 2.1,
    phosphorus: 190,
    calcium: 20,
    magnesium: 22,
    potassium: 230,
    iron: 1.6
  }
}), ing({
  id: 'turkey-breast',
  name: 'Turkey breast',
  categoryId: 'meat',
  subcategoryId: 'poultry',
  nutrition: {
    calories: 135,
    protein: 30,
    carbs: 0,
    fat: 1,
    saturatedFat: 0.3,
    cholesterol: 65,
    sodium: 55
  },
  vitamins: {
    vitaminB3: 8.1,
    vitaminB6: 0.6,
    vitaminB1: 0.05,
    vitaminB2: 0.12,
    vitaminB5: 0.8,
    vitaminB9: 6,
    vitaminB12: 0.4,
    vitaminE: 0.1
  },
  minerals: {
    phosphorus: 210,
    selenium: 24,
    calcium: 14,
    magnesium: 28,
    potassium: 270,
    iron: 1,
    zinc: 1.3
  }
}), ing({
  id: 'beef-sirloin',
  name: 'Beef sirloin',
  categoryId: 'meat',
  subcategoryId: 'beef',
  nutrition: {
    calories: 183,
    protein: 27,
    carbs: 0,
    fat: 7.5,
    saturatedFat: 3,
    cholesterol: 80,
    sodium: 58
  },
  vitamins: {
    vitaminB12: 2.4,
    vitaminB3: 6,
    vitaminB1: 0.08,
    vitaminB2: 0.18,
    vitaminB5: 0.5,
    vitaminB6: 0.4,
    vitaminB9: 7,
    vitaminE: 0.2,
    vitaminK: 1.6
  },
  minerals: {
    iron: 2.3,
    zinc: 5,
    phosphorus: 210,
    calcium: 13,
    magnesium: 22,
    potassium: 315,
    selenium: 20
  }
}), ing({
  id: 'bacon',
  name: 'Bacon',
  categoryId: 'meat',
  subcategoryId: 'pork',
  gramsPerUnit: {
    slice: 8
  },
  nutrition: {
    calories: 541,
    protein: 37,
    carbs: 1.4,
    fat: 42,
    saturatedFat: 14,
    cholesterol: 110,
    sodium: 1717
  },
  vitamins: {
    vitaminB1: 0.4,
    vitaminB2: 0.15,
    vitaminB3: 6,
    vitaminB5: 0.7,
    vitaminB6: 0.4,
    vitaminB12: 0.7,
    vitaminE: 0.3
  },
  minerals: {
    phosphorus: 200,
    selenium: 20,
    calcium: 11,
    magnesium: 22,
    potassium: 565,
    iron: 1.4,
    zinc: 2.6
  },
  allergens: []
}), ing({
  id: 'canadian-bacon',
  name: 'Canadian bacon',
  categoryId: 'meat',
  subcategoryId: 'pork',
  gramsPerUnit: {
    slice: 28
  },
  nutrition: {
    calories: 145,
    protein: 21,
    carbs: 1.4,
    fat: 6,
    saturatedFat: 2,
    cholesterol: 50,
    sodium: 1350
  },
  vitamins: {
    vitaminB1: 0.7,
    vitaminB2: 0.2,
    vitaminB3: 5,
    vitaminB6: 0.4,
    vitaminB12: 0.6
  },
  minerals: {
    phosphorus: 250,
    potassium: 340,
    calcium: 8,
    magnesium: 20,
    iron: 0.8,
    zinc: 2
  }
}), ing({
  id: 'smoked-salmon',
  name: 'Smoked salmon',
  categoryId: 'fish',
  subcategoryId: 'fin-fish',
  nutrition: {
    calories: 117,
    protein: 18.3,
    carbs: 0,
    fat: 4.3,
    saturatedFat: 0.9,
    cholesterol: 23,
    sodium: 672,
    omega3: 1
  },
  vitamins: {
    vitaminD: 8,
    vitaminB12: 3.3,
    vitaminB1: 0.02,
    vitaminB2: 0.1,
    vitaminB3: 6.9,
    vitaminB6: 0.3,
    vitaminB9: 2,
    vitaminE: 1.1,
    vitaminK: 0.1
  },
  minerals: {
    selenium: 25,
    calcium: 9,
    magnesium: 18,
    potassium: 149,
    iron: 0.7,
    zinc: 0.2,
    phosphorus: 180
  },
  allergens: ['fish']
}), ing({
  id: 'salmon-fillet',
  name: 'Salmon fillet',
  categoryId: 'fish',
  subcategoryId: 'fin-fish',
  nutrition: {
    calories: 208,
    protein: 20,
    carbs: 0,
    fat: 13,
    saturatedFat: 3.1,
    cholesterol: 55,
    sodium: 59,
    omega3: 2.3
  },
  vitamins: {
    vitaminD: 11,
    vitaminB12: 3.2,
    vitaminB1: 0.2,
    vitaminB2: 0.15,
    vitaminB3: 8.5,
    vitaminB5: 1.7,
    vitaminB6: 0.6,
    vitaminB9: 26,
    vitaminE: 1.1,
    vitaminK: 0.5
  },
  minerals: {
    selenium: 36,
    potassium: 384,
    calcium: 9,
    magnesium: 27,
    iron: 0.3,
    zinc: 0.4,
    phosphorus: 240
  },
  allergens: ['fish']
}), ing({
  id: 'cod-fillet',
  name: 'Cod fillet',
  categoryId: 'fish',
  subcategoryId: 'fin-fish',
  nutrition: {
    calories: 82,
    protein: 18,
    carbs: 0,
    fat: 0.7,
    saturatedFat: 0.1,
    cholesterol: 43,
    sodium: 54,
    omega3: 0.15
  },
  vitamins: {
    vitaminB12: 0.9,
    vitaminB1: 0.08,
    vitaminB2: 0.06,
    vitaminB3: 2.1,
    vitaminB5: 0.2,
    vitaminB6: 0.2,
    vitaminB9: 7,
    vitaminE: 0.6,
    vitaminK: 0.1
  },
  minerals: {
    selenium: 33,
    phosphorus: 203,
    potassium: 413,
    calcium: 16,
    magnesium: 32,
    iron: 0.4,
    zinc: 0.5,
    copper: 0.03
  },
  allergens: ['fish']
}), ing({
  id: 'tuna-steak',
  name: 'Tuna steak',
  categoryId: 'fish',
  subcategoryId: 'fin-fish',
  nutrition: {
    calories: 144,
    protein: 23.3,
    carbs: 0,
    fat: 4.9,
    saturatedFat: 1.3,
    cholesterol: 38,
    sodium: 39,
    omega3: 1.2
  },
  vitamins: {
    vitaminB12: 2.2,
    vitaminD: 3,
    vitaminB1: 0.24,
    vitaminB2: 0.09,
    vitaminB3: 9.9,
    vitaminB5: 0.8,
    vitaminB6: 0.9,
    vitaminB9: 2,
    vitaminE: 1,
    vitaminK: 0.1
  },
  minerals: {
    selenium: 80,
    potassium: 252,
    calcium: 8,
    magnesium: 35,
    iron: 1,
    zinc: 0.6,
    phosphorus: 254
  },
  allergens: ['fish']
}), ing({
  id: 'canned-tuna',
  name: 'Canned tuna (in water)',
  categoryId: 'fish',
  subcategoryId: 'fin-fish',
  nutrition: {
    calories: 116,
    protein: 26,
    carbs: 0,
    fat: 0.8,
    saturatedFat: 0.2,
    cholesterol: 30,
    sodium: 247,
    omega3: 0.3
  },
  vitamins: {
    vitaminD: 1,
    vitaminB12: 2.5,
    vitaminB1: 0.03,
    vitaminB2: 0.06,
    vitaminB3: 11.3,
    vitaminB6: 0.35,
    vitaminB9: 2,
    vitaminE: 0.6
  },
  minerals: {
    selenium: 78,
    calcium: 11,
    magnesium: 29,
    iron: 1.3,
    zinc: 0.5,
    phosphorus: 158,
    potassium: 237
  },
  allergens: ['fish']
}), ing({
  id: 'shrimp',
  name: 'Shrimp',
  categoryId: 'fish',
  subcategoryId: 'shellfish',
  nutrition: {
    calories: 99,
    protein: 24,
    carbs: 0.2,
    fat: 0.3,
    saturatedFat: 0.1,
    cholesterol: 189,
    sodium: 111
  },
  vitamins: {
    vitaminB12: 1.1,
    vitaminB1: 0.03,
    vitaminB2: 0.03,
    vitaminB3: 2.6,
    vitaminB6: 0.1,
    vitaminB9: 3,
    vitaminE: 1.3
  },
  minerals: {
    selenium: 40,
    iodine: 35,
    calcium: 70,
    magnesium: 39,
    iron: 0.5,
    zinc: 1.3,
    phosphorus: 237,
    potassium: 259,
    copper: 0.3
  },
  allergens: ['shellfish']
}),
// ---- Dairy & eggs ----
ing({
  id: 'greek-yogurt',
  name: 'Greek yogurt (plain)',
  categoryId: 'dairy',
  subcategoryId: 'cultured',
  nutrition: {
    calories: 97,
    protein: 9,
    carbs: 3.9,
    fat: 5,
    saturatedFat: 3.2,
    cholesterol: 13,
    sodium: 36,
    sugar: 3.9
  },
  vitamins: {
    vitaminB2: 0.3,
    vitaminB12: 0.75,
    vitaminA: 27,
    vitaminB1: 0.02,
    vitaminB3: 0.1,
    vitaminB5: 0.3,
    vitaminB6: 0.06
  },
  minerals: {
    calcium: 110,
    phosphorus: 135,
    iron: 0.05,
    magnesium: 11,
    potassium: 141,
    zinc: 0.5
  },
  allergens: ['dairy']
}), ing({
  id: 'milk',
  name: 'Milk (2%)',
  categoryId: 'dairy',
  subcategoryId: 'milk',
  nutrition: {
    calories: 50,
    protein: 3.4,
    carbs: 4.9,
    fat: 2,
    saturatedFat: 1.2,
    cholesterol: 8,
    sodium: 44,
    sugar: 4.9
  },
  vitamins: {
    vitaminD: 1.3,
    vitaminB12: 0.5,
    vitaminB2: 0.18,
    vitaminA: 46,
    vitaminB1: 0.04,
    vitaminB3: 0.1,
    vitaminB5: 0.36,
    vitaminB6: 0.04
  },
  minerals: {
    calcium: 120,
    potassium: 150,
    iron: 0.03,
    magnesium: 12,
    phosphorus: 93,
    zinc: 0.4
  },
  allergens: ['dairy']
}), ing({
  id: 'almond-milk',
  name: 'Almond milk (unsweetened)',
  categoryId: 'dairy',
  subcategoryId: 'milk',
  nutrition: {
    calories: 15,
    protein: 0.6,
    carbs: 0.6,
    fat: 1.2,
    saturatedFat: 0.1,
    sodium: 63
  },
  vitamins: {
    vitaminE: 5.3,
    vitaminD: 1,
    vitaminA: 50,
    vitaminB2: 0.03
  },
  minerals: {
    calcium: 188,
    iron: 0.3,
    magnesium: 5,
    potassium: 20,
    phosphorus: 20
  },
  allergens: ['tree nuts']
}), ing({
  id: 'heavy-cream',
  name: 'Heavy cream',
  categoryId: 'dairy',
  subcategoryId: 'milk',
  nutrition: {
    calories: 340,
    protein: 2.1,
    carbs: 2.8,
    fat: 36,
    saturatedFat: 23,
    cholesterol: 110,
    sodium: 27,
    sugar: 2.9
  },
  vitamins: {
    vitaminA: 350,
    vitaminB2: 0.15,
    vitaminD: 0.5,
    vitaminK: 0.7
  },
  minerals: {
    calcium: 65,
    magnesium: 7,
    potassium: 75,
    phosphorus: 54
  },
  allergens: ['dairy']
}), ing({
  id: 'butter',
  name: 'Butter',
  categoryId: 'dairy',
  subcategoryId: 'butter',
  gramsPerUnit: {
    tbsp: 14
  },
  nutrition: {
    calories: 717,
    protein: 0.9,
    carbs: 0.1,
    fat: 81,
    saturatedFat: 51,
    cholesterol: 215,
    sodium: 11
  },
  minerals: {
    calcium: 24,
    potassium: 24,
    phosphorus: 24
  },
  vitamins: {
    vitaminA: 684,
    vitaminE: 2.3,
    vitaminB2: 0.03,
    vitaminD: 1.5,
    vitaminK: 7
  },
  allergens: ['dairy']
}), ing({
  id: 'cream-cheese',
  name: 'Cream cheese',
  categoryId: 'dairy',
  subcategoryId: 'cheese',
  gramsPerUnit: {
    tbsp: 14.5
  },
  nutrition: {
    calories: 342,
    protein: 6,
    carbs: 4.1,
    fat: 34,
    saturatedFat: 19,
    cholesterol: 101,
    sodium: 321
  },
  vitamins: {
    vitaminA: 308,
    vitaminB2: 0.15,
    vitaminD: 0.3
  },
  minerals: {
    calcium: 98,
    iron: 0.2,
    magnesium: 6,
    potassium: 138,
    phosphorus: 98,
    zinc: 0.5
  },
  allergens: ['dairy']
}), ing({
  id: 'feta-cheese',
  name: 'Feta cheese',
  categoryId: 'dairy',
  subcategoryId: 'cheese',
  nutrition: {
    calories: 264,
    protein: 14,
    carbs: 4,
    fat: 21,
    saturatedFat: 15,
    cholesterol: 89,
    sodium: 917
  },
  vitamins: {
    vitaminB2: 0.8,
    vitaminB12: 1.7,
    vitaminA: 145,
    vitaminB6: 0.4
  },
  minerals: {
    calcium: 493,
    phosphorus: 337,
    iron: 0.7,
    magnesium: 19,
    potassium: 62,
    zinc: 2.9
  },
  allergens: ['dairy']
}), ing({
  id: 'parmesan-cheese',
  name: 'Parmesan cheese',
  categoryId: 'dairy',
  subcategoryId: 'cheese',
  nutrition: {
    calories: 431,
    protein: 38,
    carbs: 4.1,
    fat: 29,
    saturatedFat: 19,
    cholesterol: 88,
    sodium: 1529
  },
  vitamins: {
    vitaminA: 220,
    vitaminB12: 1.3,
    vitaminB2: 0.4,
    vitaminB6: 0.09
  },
  minerals: {
    calcium: 1184,
    phosphorus: 694,
    zinc: 2.9,
    iron: 0.8,
    magnesium: 44,
    potassium: 92
  },
  allergens: ['dairy']
}), ing({
  id: 'cheddar-cheese',
  name: 'Cheddar cheese',
  categoryId: 'dairy',
  subcategoryId: 'cheese',
  nutrition: {
    calories: 403,
    protein: 25,
    carbs: 1.3,
    fat: 33,
    saturatedFat: 21,
    cholesterol: 105,
    sodium: 653
  },
  vitamins: {
    vitaminA: 265,
    vitaminB12: 0.8,
    vitaminB2: 0.4,
    vitaminB6: 0.07,
    vitaminK: 2.4
  },
  minerals: {
    calcium: 721,
    zinc: 3.1,
    iron: 0.7,
    magnesium: 28,
    potassium: 98,
    phosphorus: 512
  },
  allergens: ['dairy']
}), ing({
  id: 'mozzarella-fresh',
  name: 'Fresh mozzarella',
  categoryId: 'dairy',
  subcategoryId: 'cheese',
  nutrition: {
    calories: 280,
    protein: 22,
    carbs: 2.2,
    fat: 21,
    saturatedFat: 13,
    cholesterol: 79,
    sodium: 373
  },
  vitamins: {
    vitaminA: 179,
    vitaminB2: 0.3,
    vitaminB12: 1.2
  },
  minerals: {
    calcium: 505,
    phosphorus: 354,
    iron: 0.4,
    magnesium: 20,
    potassium: 76,
    zinc: 2.9
  },
  allergens: ['dairy']
}), ing({
  id: 'ricotta-cheese',
  name: 'Ricotta cheese',
  categoryId: 'dairy',
  subcategoryId: 'cheese',
  nutrition: {
    calories: 174,
    protein: 11.3,
    carbs: 3,
    fat: 13,
    saturatedFat: 8,
    cholesterol: 51,
    sodium: 84
  },
  vitamins: {
    vitaminA: 120,
    vitaminB2: 0.2,
    vitaminB12: 0.34
  },
  minerals: {
    calcium: 207,
    phosphorus: 158,
    iron: 0.4,
    magnesium: 11,
    potassium: 105,
    zinc: 1.2
  },
  allergens: ['dairy']
}), ing({
  id: 'cottage-cheese',
  name: 'Cottage cheese',
  categoryId: 'dairy',
  subcategoryId: 'cheese',
  nutrition: {
    calories: 98,
    protein: 11,
    carbs: 3.4,
    fat: 4.3,
    saturatedFat: 2.7,
    cholesterol: 17,
    sodium: 364,
    sugar: 2.7
  },
  vitamins: {
    vitaminA: 37,
    vitaminB2: 0.2,
    vitaminB12: 0.4
  },
  minerals: {
    calcium: 83,
    phosphorus: 159,
    selenium: 12,
    iron: 0.1,
    magnesium: 8,
    potassium: 104,
    zinc: 0.4
  },
  allergens: ['dairy']
}), ing({
  id: 'sour-cream',
  name: 'Sour cream',
  categoryId: 'dairy',
  subcategoryId: 'cultured',
  nutrition: {
    calories: 198,
    protein: 2.4,
    carbs: 4.6,
    fat: 19.4,
    saturatedFat: 12,
    cholesterol: 59,
    sodium: 42,
    sugar: 3.5
  },
  vitamins: {
    vitaminA: 187,
    vitaminB2: 0.2,
    vitaminB12: 0.2
  },
  minerals: {
    calcium: 96,
    iron: 0.1,
    magnesium: 8,
    potassium: 141,
    phosphorus: 75
  },
  allergens: ['dairy']
}),
// ---- Grains / bread / pasta ----
ing({
  id: 'sourdough-bread',
  name: 'Sourdough bread',
  categoryId: 'bakery',
  subcategoryId: 'bread',
  gramsPerUnit: {
    slice: 30
  },
  nutrition: {
    calories: 273,
    protein: 10.8,
    carbs: 53,
    fat: 1.3,
    fiber: 2.4,
    sugar: 2.5,
    sodium: 526
  },
  vitamins: {
    vitaminB1: 0.4,
    vitaminB2: 0.2,
    vitaminB3: 3.6,
    vitaminB9: 60
  },
  minerals: {
    iron: 3.5,
    magnesium: 30,
    calcium: 47
  },
  allergens: ['gluten']
}), ing({
  id: 'bread',
  name: 'Sandwich bread',
  categoryId: 'bakery',
  subcategoryId: 'bread',
  gramsPerUnit: {
    slice: 30
  },
  nutrition: {
    calories: 266,
    protein: 9,
    carbs: 49,
    fat: 3.3,
    fiber: 2.7,
    sugar: 5,
    sodium: 490
  },
  vitamins: {
    vitaminB1: 0.4,
    vitaminB2: 0.3,
    vitaminB3: 4.6,
    vitaminB9: 130
  },
  minerals: {
    iron: 3.6,
    calcium: 151,
    magnesium: 23
  },
  allergens: ['gluten']
}), ing({
  id: 'baguette',
  name: 'Baguette',
  categoryId: 'bakery',
  subcategoryId: 'bread',
  gramsPerUnit: {
    slice: 25
  },
  nutrition: {
    calories: 274,
    protein: 9,
    carbs: 55,
    fat: 1.7,
    fiber: 2.4,
    sugar: 3.5,
    sodium: 550
  },
  minerals: {
    calcium: 60,
    magnesium: 22,
    iron: 3
  },
  vitamins: {
    vitaminB1: 0.4,
    vitaminB2: 0.25,
    vitaminB3: 3.9,
    vitaminB9: 100
  },
  allergens: ['gluten']
}), ing({
  id: 'bagel',
  name: 'Bagel',
  categoryId: 'bakery',
  subcategoryId: 'bread',
  gramsPerUnit: {
    piece: 95
  },
  nutrition: {
    calories: 257,
    protein: 10,
    carbs: 50,
    fat: 1.5,
    fiber: 2.1,
    sugar: 5.5,
    sodium: 460
  },
  vitamins: {
    vitaminB1: 0.4,
    vitaminB2: 0.25,
    vitaminB3: 3.9,
    vitaminB9: 110
  },
  minerals: {
    iron: 2.9,
    calcium: 60,
    magnesium: 23
  },
  allergens: ['gluten']
}), ing({
  id: 'english-muffin',
  name: 'English muffin',
  categoryId: 'bakery',
  subcategoryId: 'bread',
  gramsPerUnit: {
    piece: 57
  },
  nutrition: {
    calories: 227,
    protein: 8.2,
    carbs: 44,
    fat: 1.6,
    fiber: 2.6,
    sugar: 2.5,
    sodium: 393
  },
  minerals: {
    calcium: 150,
    magnesium: 17,
    iron: 2.2
  },
  vitamins: {
    vitaminB1: 0.3,
    vitaminB2: 0.2,
    vitaminB3: 3,
    vitaminB9: 90
  },
  allergens: ['gluten']
}), ing({
  id: 'tortilla-wrap',
  name: 'Flour tortilla wrap',
  categoryId: 'bakery',
  subcategoryId: 'tortillas',
  gramsPerUnit: {
    piece: 45
  },
  nutrition: {
    calories: 289,
    protein: 7.8,
    carbs: 48,
    fat: 6.4,
    fiber: 2.6,
    sugar: 2,
    sodium: 590
  },
  minerals: {
    calcium: 120,
    magnesium: 20,
    iron: 2
  },
  vitamins: {
    vitaminB1: 0.3,
    vitaminB2: 0.2,
    vitaminB3: 2.5,
    vitaminB9: 80
  },
  allergens: ['gluten']
}), ing({
  id: 'corn-tortilla',
  name: 'Corn tortilla',
  categoryId: 'bakery',
  subcategoryId: 'tortillas',
  gramsPerUnit: {
    piece: 24
  },
  nutrition: {
    calories: 218,
    protein: 5.7,
    carbs: 44.6,
    fat: 2.9,
    fiber: 6.4,
    sugar: 0.9,
    sodium: 12
  },
  minerals: {
    calcium: 81,
    magnesium: 35,
    iron: 0.6
  },
  vitamins: {
    vitaminB1: 0.05,
    vitaminB2: 0.04,
    vitaminB3: 0.9,
    vitaminB9: 6
  }
}), ing({
  id: 'rolled-oats',
  name: 'Rolled oats',
  categoryId: 'pantry',
  subcategoryId: 'grains',
  gramsPerUnit: {
    cup: 90
  },
  nutrition: {
    calories: 379,
    protein: 13.2,
    carbs: 67.7,
    fat: 6.5,
    fiber: 10.1,
    sugar: 1
  },
  vitamins: {
    vitaminB1: 0.76,
    vitaminB5: 1.3,
    vitaminB6: 0.1,
    vitaminB9: 32,
    vitaminE: 0.7
  },
  minerals: {
    magnesium: 177,
    manganese: 4.9,
    iron: 4.7,
    calcium: 52,
    phosphorus: 410,
    potassium: 429,
    zinc: 4
  },
  allergens: ['gluten']
}), ing({
  id: 'white-rice-dry',
  name: 'White rice (uncooked)',
  categoryId: 'pantry',
  subcategoryId: 'grains',
  gramsPerUnit: {
    cup: 185
  },
  nutrition: {
    calories: 365,
    protein: 7.1,
    carbs: 80,
    fat: 0.7,
    fiber: 1.3,
    sugar: 0.1
  },
  vitamins: {
    vitaminB1: 0.07,
    vitaminB2: 0.05,
    vitaminB3: 1.6,
    vitaminB6: 0.16,
    vitaminB9: 8
  },
  minerals: {
    manganese: 1.1,
    phosphorus: 115,
    calcium: 28,
    magnesium: 25,
    potassium: 115,
    iron: 0.8,
    zinc: 1.1
  }
}), ing({
  id: 'quinoa-dry',
  name: 'Quinoa (uncooked)',
  categoryId: 'pantry',
  subcategoryId: 'grains',
  gramsPerUnit: {
    cup: 170
  },
  nutrition: {
    calories: 368,
    protein: 14.1,
    carbs: 64,
    fat: 6.1,
    fiber: 7,
    sugar: 0
  },
  vitamins: {
    vitaminB9: 184,
    vitaminB1: 0.36,
    vitaminB2: 0.32,
    vitaminB3: 1.5,
    vitaminB6: 0.5,
    vitaminE: 2.4
  },
  minerals: {
    magnesium: 197,
    iron: 4.6,
    manganese: 2.6,
    potassium: 563,
    calcium: 47,
    zinc: 3.1,
    phosphorus: 457,
    copper: 0.6
  }
}), ing({
  id: 'pasta-dry',
  name: 'Pasta (uncooked)',
  categoryId: 'pantry',
  subcategoryId: 'grains',
  nutrition: {
    calories: 371,
    protein: 13,
    carbs: 74.7,
    fat: 1.5,
    fiber: 3.2,
    sugar: 2.7
  },
  vitamins: {
    vitaminB1: 0.15,
    vitaminB2: 0.07,
    vitaminB3: 2,
    vitaminB9: 18
  },
  minerals: {
    manganese: 1.3,
    selenium: 60,
    calcium: 21,
    magnesium: 53,
    potassium: 223,
    iron: 3.3,
    zinc: 1.5
  },
  allergens: ['gluten']
}), ing({
  id: 'egg-noodles-dry',
  name: 'Egg noodles (uncooked)',
  categoryId: 'pantry',
  subcategoryId: 'grains',
  nutrition: {
    calories: 384,
    protein: 14,
    carbs: 71,
    fat: 4.5,
    fiber: 3.2,
    sugar: 1.8,
    cholesterol: 95
  },
  minerals: {
    calcium: 19,
    magnesium: 33,
    potassium: 172,
    iron: 1.9,
    zinc: 1
  },
  vitamins: {
    vitaminB1: 0.3,
    vitaminB2: 0.2,
    vitaminB3: 3.4,
    vitaminB9: 100
  },
  allergens: ['gluten', 'egg']
}), ing({
  id: 'breadcrumbs',
  name: 'Breadcrumbs',
  categoryId: 'pantry',
  subcategoryId: 'bread',
  gramsPerUnit: {
    cup: 108
  },
  nutrition: {
    calories: 395,
    protein: 13,
    carbs: 72,
    fat: 5.3,
    fiber: 4.9,
    sugar: 6.2,
    sodium: 732
  },
  minerals: {
    calcium: 83,
    magnesium: 33,
    iron: 4.1
  },
  vitamins: {
    vitaminB1: 0.4,
    vitaminB2: 0.3,
    vitaminB3: 4.9,
    vitaminB9: 130
  },
  allergens: ['gluten']
}), ing({
  id: 'flour',
  name: 'All-purpose flour',
  categoryId: 'pantry',
  subcategoryId: 'grains',
  nutrition: {
    calories: 364,
    protein: 10.3,
    carbs: 76.3,
    fat: 1,
    fiber: 2.7,
    sugar: 0.3
  },
  vitamins: {
    vitaminB1: 0.5,
    vitaminB2: 0.3,
    vitaminB3: 5,
    vitaminB9: 183
  },
  minerals: {
    iron: 4.6,
    calcium: 15,
    magnesium: 22,
    potassium: 107,
    zinc: 0.7
  },
  allergens: ['gluten']
}), ing({
  id: 'granola',
  name: 'Granola',
  categoryId: 'pantry',
  subcategoryId: 'grains',
  gramsPerUnit: {
    cup: 100
  },
  nutrition: {
    calories: 471,
    protein: 10,
    carbs: 64,
    fat: 20,
    fiber: 7,
    sugar: 24,
    saturatedFat: 3
  },
  vitamins: {
    vitaminB1: 0.2,
    vitaminB2: 0.1,
    vitaminB6: 0.1,
    vitaminE: 2
  },
  minerals: {
    magnesium: 120,
    iron: 2.8,
    calcium: 60,
    potassium: 300,
    zinc: 2
  },
  allergens: ['gluten', 'tree nuts']
}), ing({
  id: 'croutons',
  name: 'Croutons',
  categoryId: 'pantry',
  subcategoryId: 'bread',
  nutrition: {
    calories: 407,
    protein: 10,
    carbs: 66,
    fat: 11,
    fiber: 4.9,
    sugar: 4.4,
    sodium: 900
  },
  minerals: {
    calcium: 70,
    magnesium: 20,
    iron: 3
  },
  vitamins: {
    vitaminB1: 0.3,
    vitaminB2: 0.2,
    vitaminB3: 4,
    vitaminB9: 100
  },
  allergens: ['gluten']
}),
// ---- Legumes & pantry staples ----
ing({
  id: 'chickpeas-canned',
  name: 'Chickpeas (canned)',
  categoryId: 'pantry',
  subcategoryId: 'legumes',
  nutrition: {
    calories: 139,
    protein: 7.5,
    carbs: 22.5,
    fat: 2.6,
    fiber: 6.3,
    sugar: 3.9,
    sodium: 240
  },
  vitamins: {
    vitaminB9: 65,
    vitaminB1: 0.06,
    vitaminB6: 0.1,
    vitaminK: 4
  },
  minerals: {
    iron: 1.6,
    magnesium: 33,
    potassium: 210,
    calcium: 49,
    zinc: 1.5,
    phosphorus: 109
  }
}), ing({
  id: 'red-lentils-dry',
  name: 'Red lentils (uncooked)',
  categoryId: 'pantry',
  subcategoryId: 'legumes',
  nutrition: {
    calories: 352,
    protein: 24.6,
    carbs: 63.4,
    fat: 1.1,
    fiber: 10.7,
    sugar: 2
  },
  vitamins: {
    vitaminB9: 479,
    vitaminB1: 0.87,
    vitaminB2: 0.21,
    vitaminB3: 2.6,
    vitaminB6: 0.5,
    vitaminE: 0.5
  },
  minerals: {
    iron: 6.5,
    magnesium: 122,
    potassium: 955,
    calcium: 56,
    zinc: 4.8,
    phosphorus: 454,
    copper: 0.9,
    manganese: 1.4
  }
}), ing({
  id: 'honey',
  name: 'Honey',
  categoryId: 'pantry',
  subcategoryId: 'oils-condiments',
  gramsPerUnit: {
    tbsp: 21,
    tsp: 7
  },
  nutrition: {
    calories: 304,
    protein: 0.3,
    carbs: 82.4,
    fat: 0,
    sugar: 82.1
  },
  vitamins: {
    vitaminC: 0.5,
    vitaminB2: 0.04,
    vitaminB3: 0.1,
    vitaminB6: 0.02
  },
  minerals: {
    potassium: 52,
    calcium: 6,
    magnesium: 2,
    phosphorus: 4,
    zinc: 0.2
  }
}), ing({
  id: 'peanut-butter',
  name: 'Peanut butter',
  categoryId: 'pantry',
  subcategoryId: 'nuts-seeds',
  gramsPerUnit: {
    tbsp: 16
  },
  nutrition: {
    calories: 588,
    protein: 25,
    carbs: 20,
    fat: 50,
    saturatedFat: 10,
    fiber: 6,
    sugar: 9
  },
  vitamins: {
    vitaminE: 9.4,
    vitaminB3: 13.5,
    vitaminB1: 0.1,
    vitaminB2: 0.1,
    vitaminB6: 0.5,
    vitaminB9: 87
  },
  minerals: {
    magnesium: 168,
    potassium: 649,
    calcium: 43,
    iron: 1.9,
    zinc: 2.9,
    copper: 0.4,
    manganese: 1.7
  },
  allergens: ['peanuts']
}), ing({
  id: 'dark-chocolate',
  name: 'Dark chocolate (70%)',
  categoryId: 'pantry',
  subcategoryId: 'other',
  nutrition: {
    calories: 598,
    protein: 7.8,
    carbs: 45.9,
    fat: 42.6,
    saturatedFat: 24.5,
    fiber: 11,
    sugar: 24
  },
  vitamins: {
    vitaminB2: 0.1,
    vitaminE: 0.6,
    vitaminK: 6
  },
  minerals: {
    iron: 11.9,
    magnesium: 228,
    copper: 1.8,
    calcium: 73,
    zinc: 3.3,
    phosphorus: 308,
    potassium: 715
  }
}), ing({
  id: 'chia-seeds',
  name: 'Chia seeds',
  categoryId: 'pantry',
  subcategoryId: 'nuts-seeds',
  gramsPerUnit: {
    tbsp: 12
  },
  nutrition: {
    calories: 486,
    protein: 16.5,
    carbs: 42.1,
    fat: 30.7,
    fiber: 34.4,
    sugar: 0,
    omega3: 17.8
  },
  vitamins: {
    vitaminB1: 0.6,
    vitaminB2: 0.17,
    vitaminB3: 8.8,
    vitaminB9: 49
  },
  minerals: {
    calcium: 631,
    magnesium: 335,
    iron: 7.7,
    potassium: 407,
    zinc: 4.6,
    phosphorus: 860,
    copper: 0.9,
    manganese: 2.7
  }
}), ing({
  id: 'walnuts',
  name: 'Walnuts',
  categoryId: 'pantry',
  subcategoryId: 'nuts-seeds',
  nutrition: {
    calories: 654,
    protein: 15.2,
    carbs: 13.7,
    fat: 65.2,
    saturatedFat: 6.1,
    fiber: 6.7,
    sugar: 2.6,
    omega3: 9.1,
    omega6: 38.1
  },
  vitamins: {
    vitaminE: 0.7,
    vitaminB6: 0.5,
    vitaminB1: 0.34,
    vitaminB9: 98,
    vitaminK: 2.7
  },
  minerals: {
    magnesium: 158,
    copper: 1.6,
    manganese: 3.4,
    calcium: 98,
    iron: 2.9,
    zinc: 3.1,
    phosphorus: 346,
    potassium: 441
  },
  allergens: ['tree nuts']
}), ing({
  id: 'pine-nuts',
  name: 'Pine nuts',
  categoryId: 'pantry',
  subcategoryId: 'nuts-seeds',
  nutrition: {
    calories: 673,
    protein: 13.7,
    carbs: 13.1,
    fat: 68.4,
    saturatedFat: 4.9,
    fiber: 3.7,
    sugar: 3.6,
    omega6: 33.2
  },
  vitamins: {
    vitaminE: 9.3,
    vitaminK: 53.9,
    vitaminB1: 0.36,
    vitaminB2: 0.23,
    vitaminB3: 4.4,
    vitaminB6: 0.09,
    vitaminB9: 34
  },
  minerals: {
    manganese: 8.8,
    zinc: 6.5,
    calcium: 16,
    iron: 5.5,
    magnesium: 251,
    phosphorus: 575,
    potassium: 597,
    copper: 1.3
  },
  allergens: ['tree nuts']
}), ing({
  id: 'sesame-seeds',
  name: 'Sesame seeds',
  categoryId: 'pantry',
  subcategoryId: 'nuts-seeds',
  nutrition: {
    calories: 573,
    protein: 17.7,
    carbs: 23.4,
    fat: 49.7,
    saturatedFat: 7,
    fiber: 11.8,
    sugar: 0.3
  },
  vitamins: {
    vitaminB1: 0.79,
    vitaminB2: 0.25,
    vitaminB3: 4.5,
    vitaminB6: 0.79,
    vitaminB9: 97,
    vitaminE: 0.25
  },
  minerals: {
    calcium: 975,
    iron: 14.6,
    magnesium: 351,
    zinc: 7.8,
    phosphorus: 629,
    potassium: 468,
    copper: 4.1,
    manganese: 2.5
  },
  allergens: ['sesame']
}), ing({
  id: 'baking-powder',
  name: 'Baking powder',
  categoryId: 'pantry',
  subcategoryId: 'spices',
  gramsPerUnit: {
    tsp: 4.6
  },
  nutrition: {
    calories: 53,
    protein: 0,
    carbs: 27.7,
    fat: 0,
    sodium: 10600
  },
  minerals: {
    calcium: 5876,
    phosphorus: 7069
  }
}), ing({
  id: 'soy-sauce',
  name: 'Soy sauce',
  categoryId: 'pantry',
  subcategoryId: 'oils-condiments',
  gramsPerUnit: {
    tbsp: 18
  },
  nutrition: {
    calories: 53,
    protein: 8,
    carbs: 4.9,
    fat: 0.6,
    sodium: 5493,
    sugar: 0.4
  },
  minerals: {
    potassium: 379,
    magnesium: 52,
    phosphorus: 170,
    manganese: 0.6
  },
  vitamins: {
    vitaminB3: 1.6,
    vitaminB6: 0.2,
    vitaminB9: 32
  }
}), ing({
  id: 'balsamic-vinegar',
  name: 'Balsamic vinegar',
  categoryId: 'pantry',
  subcategoryId: 'oils-condiments',
  gramsPerUnit: {
    tbsp: 16
  },
  nutrition: {
    calories: 88,
    protein: 0.5,
    carbs: 17,
    fat: 0,
    sugar: 15
  },
  minerals: {
    potassium: 112,
    calcium: 27,
    iron: 0.7
  }
}), ing({
  id: 'olive-oil',
  name: 'Olive oil',
  categoryId: 'pantry',
  subcategoryId: 'oils-condiments',
  gramsPerUnit: {
    tbsp: 13.5,
    tsp: 4.5
  },
  nutrition: {
    calories: 884,
    protein: 0,
    carbs: 0,
    fat: 100,
    saturatedFat: 13.8,
    omega6: 9.8
  },
  vitamins: {
    vitaminE: 14.4,
    vitaminK: 60.2
  }
}), ing({
  id: 'sesame-oil',
  name: 'Sesame oil',
  categoryId: 'pantry',
  subcategoryId: 'oils-condiments',
  gramsPerUnit: {
    tsp: 4.5
  },
  nutrition: {
    calories: 884,
    protein: 0,
    carbs: 0,
    fat: 100,
    saturatedFat: 14.2,
    omega6: 41.3,
    omega3: 0.3
  },
  vitamins: {
    vitaminE: 1.4,
    vitaminK: 13.6
  }
}), ing({
  id: 'mayonnaise',
  name: 'Mayonnaise',
  categoryId: 'pantry',
  subcategoryId: 'oils-condiments',
  gramsPerUnit: {
    tbsp: 13
  },
  nutrition: {
    calories: 680,
    protein: 1,
    carbs: 0.6,
    fat: 75,
    saturatedFat: 11.8,
    cholesterol: 42,
    sodium: 635
  },
  minerals: {
    potassium: 20
  },
  vitamins: {
    vitaminE: 16
  },
  allergens: ['egg']
}), ing({
  id: 'caesar-dressing',
  name: 'Caesar dressing',
  categoryId: 'pantry',
  subcategoryId: 'oils-condiments',
  gramsPerUnit: {
    tbsp: 15
  },
  nutrition: {
    calories: 467,
    protein: 2.2,
    carbs: 6,
    fat: 49,
    saturatedFat: 7.5,
    cholesterol: 30,
    sodium: 1050
  },
  minerals: {
    calcium: 20
  },
  vitamins: {
    vitaminE: 8
  },
  allergens: ['egg', 'dairy']
}), ing({
  id: 'curry-powder',
  name: 'Curry powder',
  categoryId: 'pantry',
  subcategoryId: 'spices',
  gramsPerUnit: {
    tsp: 2,
    tbsp: 6
  },
  nutrition: {
    calories: 325,
    protein: 12.7,
    carbs: 55.8,
    fat: 14,
    fiber: 33.2,
    sugar: 2.8
  },
  vitamins: {
    vitaminA: 1350,
    vitaminC: 11,
    vitaminE: 21,
    vitaminK: 1
  },
  minerals: {
    iron: 29.6,
    manganese: 7.6,
    calcium: 478,
    magnesium: 281,
    potassium: 1543,
    zinc: 4.3,
    copper: 1.3
  }
}), ing({
  id: 'cumin',
  name: 'Cumin',
  categoryId: 'pantry',
  subcategoryId: 'spices',
  gramsPerUnit: {
    tsp: 2
  },
  nutrition: {
    calories: 375,
    protein: 17.8,
    carbs: 44.2,
    fat: 22.3,
    fiber: 10.5,
    sugar: 2.3
  },
  vitamins: {
    vitaminA: 1270,
    vitaminC: 7.7,
    vitaminE: 3.3,
    vitaminK: 5.4
  },
  minerals: {
    iron: 66.4,
    magnesium: 366,
    calcium: 931,
    phosphorus: 499,
    potassium: 1788,
    zinc: 4.8,
    copper: 0.9
  }
}), ing({
  id: 'cinnamon',
  name: 'Cinnamon',
  categoryId: 'pantry',
  subcategoryId: 'spices',
  gramsPerUnit: {
    tsp: 2.6
  },
  nutrition: {
    calories: 247,
    protein: 4,
    carbs: 80.6,
    fat: 1.2,
    fiber: 53.1,
    sugar: 2.2
  },
  vitamins: {
    vitaminA: 15,
    vitaminC: 3.8,
    vitaminK: 31
  },
  minerals: {
    calcium: 1002,
    manganese: 17.5,
    iron: 8.3,
    potassium: 431,
    zinc: 1.8,
    copper: 0.34
  }
}), ing({
  id: 'nutmeg',
  name: 'Nutmeg',
  categoryId: 'pantry',
  subcategoryId: 'spices',
  gramsPerUnit: {
    tsp: 2.2
  },
  nutrition: {
    calories: 525,
    protein: 5.8,
    carbs: 49.3,
    fat: 36.3,
    fiber: 20.8,
    sugar: 2.9
  },
  vitamins: {
    vitaminA: 102,
    vitaminC: 3,
    vitaminB1: 0.35,
    vitaminB6: 0.16
  },
  minerals: {
    manganese: 2.9,
    magnesium: 183,
    calcium: 184,
    iron: 3,
    potassium: 350,
    zinc: 2.2,
    copper: 1.02
  }
}), ing({
  id: 'chili-flakes',
  name: 'Chili flakes',
  categoryId: 'pantry',
  subcategoryId: 'spices',
  gramsPerUnit: {
    tsp: 1.8
  },
  nutrition: {
    calories: 282,
    protein: 12,
    carbs: 50,
    fat: 14.3,
    fiber: 27.2,
    sugar: 10
  },
  minerals: {
    calcium: 148,
    iron: 7.8,
    magnesium: 152,
    potassium: 2014,
    zinc: 2.5
  },
  vitamins: {
    vitaminA: 41610,
    vitaminC: 76.4,
    vitaminB6: 2.45,
    vitaminE: 29.8,
    vitaminK: 80
  }
}), ing({
  id: 'matcha-powder',
  name: 'Matcha powder',
  categoryId: 'pantry',
  subcategoryId: 'other',
  gramsPerUnit: {
    tsp: 2
  },
  nutrition: {
    calories: 324,
    protein: 30,
    carbs: 39,
    fat: 5,
    fiber: 38
  },
  vitamins: {
    vitaminA: 2200,
    vitaminC: 8,
    vitaminE: 20,
    vitaminK: 700
  },
  minerals: {
    potassium: 2500,
    calcium: 420,
    iron: 35,
    magnesium: 230,
    phosphorus: 190
  }
}), ing({
  id: 'coconut-milk',
  name: 'Coconut milk (canned)',
  categoryId: 'pantry',
  subcategoryId: 'canned-broths',
  nutrition: {
    calories: 230,
    protein: 2.3,
    carbs: 5.5,
    fat: 24,
    saturatedFat: 21,
    sugar: 3.3
  },
  vitamins: {
    vitaminC: 2.8,
    vitaminE: 0.2
  },
  minerals: {
    magnesium: 37,
    manganese: 0.9,
    potassium: 263,
    calcium: 18,
    iron: 1.6,
    phosphorus: 100,
    zinc: 0.7,
    copper: 0.3
  }
}), ing({
  id: 'vegetable-broth',
  name: 'Vegetable broth',
  categoryId: 'pantry',
  subcategoryId: 'canned-broths',
  nutrition: {
    calories: 5,
    protein: 0.3,
    carbs: 0.9,
    fat: 0.1,
    sodium: 340
  },
  minerals: {
    potassium: 180,
    calcium: 9
  }
}), ing({
  id: 'chicken-broth',
  name: 'Chicken broth',
  categoryId: 'pantry',
  subcategoryId: 'canned-broths',
  nutrition: {
    calories: 8,
    protein: 1.2,
    carbs: 0.5,
    fat: 0.3,
    sodium: 343
  },
  minerals: {
    potassium: 130,
    phosphorus: 56
  }
}), ing({
  id: 'tomato-canned',
  name: 'Canned tomatoes',
  categoryId: 'pantry',
  subcategoryId: 'canned-broths',
  nutrition: {
    calories: 24,
    protein: 1.1,
    carbs: 5.3,
    fat: 0.2,
    fiber: 1.4,
    sugar: 3.2,
    sodium: 186
  },
  vitamins: {
    vitaminC: 13,
    vitaminA: 42,
    vitaminB9: 9,
    vitaminK: 4,
    vitaminE: 0.5
  },
  minerals: {
    potassium: 218,
    calcium: 24,
    iron: 1.2,
    magnesium: 15
  }
}), ing({
  id: 'tomato-sauce',
  name: 'Tomato sauce',
  categoryId: 'pantry',
  subcategoryId: 'canned-broths',
  nutrition: {
    calories: 29,
    protein: 1.3,
    carbs: 6.6,
    fat: 0.2,
    fiber: 1.6,
    sugar: 4.1,
    sodium: 383
  },
  vitamins: {
    vitaminC: 9,
    vitaminA: 38,
    vitaminB9: 12,
    vitaminK: 5,
    vitaminE: 0.7
  },
  minerals: {
    potassium: 297,
    calcium: 20,
    iron: 1,
    magnesium: 20
  }
}),
// ---- Produce ----
ing({
  id: 'avocado',
  name: 'Avocado',
  categoryId: 'produce',
  subcategoryId: 'vegetables',
  gramsPerUnit: {
    piece: 150
  },
  nutrition: {
    calories: 160,
    protein: 2,
    carbs: 8.5,
    fat: 14.7,
    saturatedFat: 2.1,
    fiber: 6.7,
    sugar: 0.7
  },
  vitamins: {
    vitaminE: 2.1,
    vitaminK: 21,
    vitaminB9: 81,
    vitaminC: 10,
    vitaminB1: 0.07,
    vitaminB2: 0.13,
    vitaminB3: 1.7,
    vitaminB5: 1.4,
    vitaminB6: 0.3
  },
  minerals: {
    potassium: 485,
    magnesium: 29,
    calcium: 12,
    iron: 0.6,
    zinc: 0.6,
    phosphorus: 52
  }
}), ing({
  id: 'lemon',
  name: 'Lemon',
  categoryId: 'produce',
  subcategoryId: 'fruits',
  gramsPerUnit: {
    piece: 58
  },
  nutrition: {
    calories: 29,
    protein: 1.1,
    carbs: 9.3,
    fat: 0.3,
    fiber: 2.8,
    sugar: 2.5
  },
  vitamins: {
    vitaminC: 53,
    vitaminB1: 0.04,
    vitaminB6: 0.08,
    vitaminB9: 11,
    vitaminE: 0.15
  },
  minerals: {
    potassium: 138,
    calcium: 26,
    magnesium: 8,
    phosphorus: 16
  }
}), ing({
  id: 'lemon-juice',
  name: 'Lemon juice',
  categoryId: 'produce',
  subcategoryId: 'fruits',
  gramsPerUnit: {
    tbsp: 15,
    tsp: 5
  },
  nutrition: {
    calories: 22,
    protein: 0.4,
    carbs: 6.9,
    fat: 0.2,
    sugar: 2.5
  },
  minerals: {
    calcium: 6,
    potassium: 103,
    phosphorus: 8
  },
  vitamins: {
    vitaminC: 39,
    vitaminB6: 0.05
  }
}), ing({
  id: 'lime',
  name: 'Lime',
  categoryId: 'produce',
  subcategoryId: 'fruits',
  gramsPerUnit: {
    piece: 67
  },
  nutrition: {
    calories: 30,
    protein: 0.7,
    carbs: 10.5,
    fat: 0.2,
    fiber: 2.8,
    sugar: 1.7
  },
  minerals: {
    calcium: 33,
    magnesium: 6,
    phosphorus: 18
  },
  vitamins: {
    vitaminC: 29,
    vitaminB6: 0.05,
    vitaminB9: 8
  }
}), ing({
  id: 'tomato',
  name: 'Tomato',
  categoryId: 'produce',
  subcategoryId: 'vegetables',
  gramsPerUnit: {
    piece: 123
  },
  nutrition: {
    calories: 18,
    protein: 0.9,
    carbs: 3.9,
    fat: 0.2,
    fiber: 1.2,
    sugar: 2.6
  },
  vitamins: {
    vitaminC: 14,
    vitaminA: 42,
    vitaminK: 7.9,
    vitaminB1: 0.04,
    vitaminB6: 0.08,
    vitaminB9: 15,
    vitaminE: 0.5
  },
  minerals: {
    potassium: 237,
    calcium: 10,
    magnesium: 11,
    iron: 0.3
  }
}), ing({
  id: 'cherry-tomato',
  name: 'Cherry tomatoes',
  categoryId: 'produce',
  subcategoryId: 'vegetables',
  nutrition: {
    calories: 18,
    protein: 0.9,
    carbs: 3.9,
    fat: 0.2,
    fiber: 1.2,
    sugar: 2.6
  },
  vitamins: {
    vitaminC: 14,
    vitaminA: 42,
    vitaminB6: 0.08,
    vitaminB9: 15,
    vitaminE: 0.5
  },
  minerals: {
    potassium: 237,
    calcium: 10,
    magnesium: 11,
    iron: 0.3
  }
}), ing({
  id: 'cucumber',
  name: 'Cucumber',
  categoryId: 'produce',
  subcategoryId: 'vegetables',
  gramsPerUnit: {
    piece: 200
  },
  nutrition: {
    calories: 15,
    protein: 0.7,
    carbs: 3.6,
    fat: 0.1,
    fiber: 0.5,
    sugar: 1.7
  },
  vitamins: {
    vitaminK: 16.4,
    vitaminC: 2.8,
    vitaminB6: 0.04,
    vitaminB9: 7
  },
  minerals: {
    potassium: 147,
    calcium: 16,
    magnesium: 13,
    iron: 0.3
  }
}), ing({
  id: 'red-onion',
  name: 'Red onion',
  categoryId: 'produce',
  subcategoryId: 'vegetables',
  gramsPerUnit: {
    piece: 110
  },
  nutrition: {
    calories: 40,
    protein: 1.1,
    carbs: 9.3,
    fat: 0.1,
    fiber: 1.7,
    sugar: 4.2
  },
  vitamins: {
    vitaminC: 7.4,
    vitaminB9: 19,
    vitaminB1: 0.05,
    vitaminB6: 0.12
  },
  minerals: {
    potassium: 146,
    calcium: 23,
    magnesium: 10,
    iron: 0.2
  }
}), ing({
  id: 'onion',
  name: 'Onion',
  categoryId: 'produce',
  subcategoryId: 'vegetables',
  gramsPerUnit: {
    piece: 110
  },
  nutrition: {
    calories: 40,
    protein: 1.1,
    carbs: 9.3,
    fat: 0.1,
    fiber: 1.7,
    sugar: 4.2
  },
  vitamins: {
    vitaminC: 7.4,
    vitaminB9: 19,
    vitaminB1: 0.05,
    vitaminB6: 0.12
  },
  minerals: {
    potassium: 146,
    calcium: 23,
    magnesium: 10,
    iron: 0.2
  }
}), ing({
  id: 'garlic',
  name: 'Garlic',
  categoryId: 'produce',
  subcategoryId: 'vegetables',
  gramsPerUnit: {
    clove: 3
  },
  nutrition: {
    calories: 149,
    protein: 6.4,
    carbs: 33.1,
    fat: 0.5,
    fiber: 2.1,
    sugar: 1
  },
  vitamins: {
    vitaminC: 31,
    vitaminB6: 1.2,
    vitaminB1: 0.2,
    vitaminB9: 3
  },
  minerals: {
    manganese: 1.7,
    selenium: 14.2,
    calcium: 181,
    magnesium: 25,
    phosphorus: 153
  }
}), ing({
  id: 'ginger',
  name: 'Ginger',
  categoryId: 'produce',
  subcategoryId: 'herbs',
  nutrition: {
    calories: 80,
    protein: 1.8,
    carbs: 17.8,
    fat: 0.8,
    fiber: 2,
    sugar: 1.7
  },
  vitamins: {
    vitaminC: 5,
    vitaminB6: 0.2,
    vitaminB1: 0.03,
    vitaminB2: 0.03,
    vitaminB3: 0.75
  },
  minerals: {
    magnesium: 43,
    potassium: 415,
    manganese: 0.2,
    calcium: 16,
    iron: 0.6,
    zinc: 0.3
  }
}), ing({
  id: 'spinach',
  name: 'Spinach',
  categoryId: 'produce',
  subcategoryId: 'vegetables',
  gramsPerUnit: {
    cup: 30
  },
  nutrition: {
    calories: 23,
    protein: 2.9,
    carbs: 3.6,
    fat: 0.4,
    fiber: 2.2,
    sugar: 0.4
  },
  vitamins: {
    vitaminA: 469,
    vitaminK: 483,
    vitaminC: 28,
    vitaminB9: 194,
    vitaminB1: 0.08,
    vitaminB2: 0.19,
    vitaminB3: 0.7,
    vitaminB6: 0.2,
    vitaminE: 2
  },
  minerals: {
    iron: 2.7,
    magnesium: 79,
    potassium: 558,
    calcium: 99,
    zinc: 0.5,
    phosphorus: 49
  }
}), ing({
  id: 'romaine-lettuce',
  name: 'Romaine lettuce',
  categoryId: 'produce',
  subcategoryId: 'vegetables',
  nutrition: {
    calories: 17,
    protein: 1.2,
    carbs: 3.3,
    fat: 0.3,
    fiber: 2.1,
    sugar: 1.2
  },
  vitamins: {
    vitaminA: 436,
    vitaminK: 103,
    vitaminC: 4,
    vitaminB1: 0.06,
    vitaminB9: 136
  },
  minerals: {
    potassium: 247,
    calcium: 33,
    magnesium: 14,
    iron: 1
  }
}), ing({
  id: 'mixed-greens',
  name: 'Mixed greens',
  categoryId: 'produce',
  subcategoryId: 'vegetables',
  gramsPerUnit: {
    cup: 30
  },
  nutrition: {
    calories: 20,
    protein: 1.8,
    carbs: 3.3,
    fat: 0.3,
    fiber: 1.8,
    sugar: 1
  },
  vitamins: {
    vitaminA: 400,
    vitaminK: 200,
    vitaminC: 15,
    vitaminB9: 120
  },
  minerals: {
    potassium: 250,
    calcium: 40,
    magnesium: 15,
    iron: 1
  }
}), ing({
  id: 'broccoli',
  name: 'Broccoli',
  categoryId: 'produce',
  subcategoryId: 'vegetables',
  nutrition: {
    calories: 34,
    protein: 2.8,
    carbs: 6.6,
    fat: 0.4,
    fiber: 2.6,
    sugar: 1.7
  },
  vitamins: {
    vitaminC: 89,
    vitaminK: 102,
    vitaminB9: 63,
    vitaminA: 31,
    vitaminB1: 0.07,
    vitaminB2: 0.12,
    vitaminE: 0.8
  },
  minerals: {
    potassium: 316,
    calcium: 47,
    magnesium: 21,
    iron: 0.7,
    zinc: 0.4
  }
}), ing({
  id: 'asparagus',
  name: 'Asparagus',
  categoryId: 'produce',
  subcategoryId: 'vegetables',
  nutrition: {
    calories: 20,
    protein: 2.2,
    carbs: 3.9,
    fat: 0.1,
    fiber: 2.1,
    sugar: 1.9
  },
  vitamins: {
    vitaminK: 41.6,
    vitaminB9: 52,
    vitaminC: 5.6,
    vitaminA: 38,
    vitaminB1: 0.14,
    vitaminB2: 0.14,
    vitaminE: 1.1
  },
  minerals: {
    potassium: 202,
    calcium: 24,
    magnesium: 14,
    iron: 2.1,
    zinc: 0.5
  }
}), ing({
  id: 'bell-pepper',
  name: 'Bell pepper',
  categoryId: 'produce',
  subcategoryId: 'vegetables',
  gramsPerUnit: {
    piece: 119
  },
  nutrition: {
    calories: 31,
    protein: 1,
    carbs: 6,
    fat: 0.3,
    fiber: 2.1,
    sugar: 4.2
  },
  vitamins: {
    vitaminC: 128,
    vitaminA: 157,
    vitaminB6: 0.29,
    vitaminB9: 46,
    vitaminE: 1.6,
    vitaminK: 4.9
  },
  minerals: {
    potassium: 211,
    calcium: 7,
    magnesium: 12,
    iron: 0.4
  }
}), ing({
  id: 'carrot',
  name: 'Carrot',
  categoryId: 'produce',
  subcategoryId: 'vegetables',
  gramsPerUnit: {
    piece: 61
  },
  nutrition: {
    calories: 41,
    protein: 0.9,
    carbs: 9.6,
    fat: 0.2,
    fiber: 2.8,
    sugar: 4.7
  },
  vitamins: {
    vitaminA: 835,
    vitaminK: 13.2,
    vitaminC: 5.9,
    vitaminB6: 0.14,
    vitaminB9: 19,
    vitaminE: 0.66
  },
  minerals: {
    potassium: 320,
    calcium: 33,
    magnesium: 12,
    iron: 0.3
  }
}), ing({
  id: 'celery',
  name: 'Celery',
  categoryId: 'produce',
  subcategoryId: 'vegetables',
  gramsPerUnit: {
    piece: 40
  },
  nutrition: {
    calories: 16,
    protein: 0.7,
    carbs: 3,
    fat: 0.2,
    fiber: 1.6,
    sugar: 1.3
  },
  vitamins: {
    vitaminK: 29.3,
    vitaminC: 3.1,
    vitaminA: 22,
    vitaminB9: 36
  },
  minerals: {
    potassium: 260,
    calcium: 40,
    magnesium: 11,
    iron: 0.2
  }
}), ing({
  id: 'mushroom',
  name: 'Mushroom',
  categoryId: 'produce',
  subcategoryId: 'vegetables',
  nutrition: {
    calories: 22,
    protein: 3.1,
    carbs: 3.3,
    fat: 0.3,
    fiber: 1,
    sugar: 2
  },
  vitamins: {
    vitaminB2: 0.4,
    vitaminB3: 3.6,
    vitaminB1: 0.08,
    vitaminB5: 1.5,
    vitaminB9: 17,
    vitaminD: 0.2
  },
  minerals: {
    selenium: 9.3,
    potassium: 318,
    copper: 0.3,
    calcium: 3,
    iron: 0.5,
    magnesium: 9,
    zinc: 0.5,
    phosphorus: 86
  }
}), ing({
  id: 'portobello-mushroom',
  name: 'Portobello mushroom',
  categoryId: 'produce',
  subcategoryId: 'vegetables',
  gramsPerUnit: {
    piece: 84
  },
  nutrition: {
    calories: 22,
    protein: 2.5,
    carbs: 4.1,
    fat: 0.4,
    fiber: 1.5,
    sugar: 2
  },
  vitamins: {
    vitaminB2: 0.2,
    vitaminB3: 4.9,
    vitaminB1: 0.06,
    vitaminB5: 1.4,
    vitaminB9: 16,
    vitaminD: 0.2
  },
  minerals: {
    selenium: 9,
    potassium: 364,
    copper: 0.4,
    calcium: 3,
    iron: 0.4,
    magnesium: 9,
    zinc: 0.5,
    phosphorus: 90
  }
}), ing({
  id: 'kalamata-olives',
  name: 'Kalamata olives',
  categoryId: 'produce',
  subcategoryId: 'vegetables',
  nutrition: {
    calories: 115,
    protein: 0.8,
    carbs: 6.3,
    fat: 10.7,
    saturatedFat: 1.4,
    fiber: 3.2,
    sugar: 0,
    sodium: 1556
  },
  minerals: {
    calcium: 88,
    iron: 3.3,
    magnesium: 22,
    copper: 0.14
  },
  vitamins: {
    vitaminE: 1.7,
    vitaminA: 17
  }
}), ing({
  id: 'basil',
  name: 'Basil',
  categoryId: 'produce',
  subcategoryId: 'herbs',
  nutrition: {
    calories: 23,
    protein: 3.2,
    carbs: 2.7,
    fat: 0.6,
    fiber: 1.6,
    sugar: 0.3
  },
  vitamins: {
    vitaminK: 415,
    vitaminA: 264,
    vitaminC: 18,
    vitaminB1: 0.03,
    vitaminB2: 0.08,
    vitaminB6: 0.16,
    vitaminB9: 68,
    vitaminE: 0.8
  },
  minerals: {
    calcium: 177,
    iron: 3.2,
    manganese: 1.1,
    magnesium: 64,
    potassium: 295,
    zinc: 0.8
  }
}), ing({
  id: 'parsley',
  name: 'Parsley',
  categoryId: 'produce',
  subcategoryId: 'herbs',
  nutrition: {
    calories: 36,
    protein: 3,
    carbs: 6.3,
    fat: 0.8,
    fiber: 3.3,
    sugar: 0.9
  },
  vitamins: {
    vitaminK: 1640,
    vitaminC: 133,
    vitaminA: 421,
    vitaminB1: 0.09,
    vitaminB2: 0.1,
    vitaminB9: 152,
    vitaminE: 0.75
  },
  minerals: {
    iron: 6.2,
    calcium: 138,
    magnesium: 50,
    potassium: 554
  }
}), ing({
  id: 'dill',
  name: 'Dill',
  categoryId: 'produce',
  subcategoryId: 'herbs',
  nutrition: {
    calories: 43,
    protein: 3.5,
    carbs: 7,
    fat: 1.1,
    fiber: 2.1,
    sugar: 0
  },
  vitamins: {
    vitaminC: 85,
    vitaminA: 386,
    vitaminB1: 0.06,
    vitaminB2: 0.3,
    vitaminB9: 150
  },
  minerals: {
    calcium: 208,
    iron: 6.6,
    magnesium: 55,
    potassium: 738,
    manganese: 1.3
  }
}), ing({
  id: 'chives',
  name: 'Chives',
  categoryId: 'produce',
  subcategoryId: 'herbs',
  nutrition: {
    calories: 30,
    protein: 3.3,
    carbs: 4.4,
    fat: 0.7,
    fiber: 2.5,
    sugar: 1.9
  },
  minerals: {
    calcium: 92,
    magnesium: 42,
    iron: 1.6,
    potassium: 296
  },
  vitamins: {
    vitaminK: 213,
    vitaminA: 218,
    vitaminC: 58.1,
    vitaminB1: 0.08,
    vitaminB2: 0.11,
    vitaminB9: 105
  }
}), ing({
  id: 'cilantro',
  name: 'Cilantro',
  categoryId: 'produce',
  subcategoryId: 'herbs',
  nutrition: {
    calories: 23,
    protein: 2.1,
    carbs: 3.7,
    fat: 0.5,
    fiber: 2.8,
    sugar: 0.9
  },
  minerals: {
    calcium: 67,
    magnesium: 26,
    iron: 1.8,
    potassium: 521
  },
  vitamins: {
    vitaminK: 310,
    vitaminA: 337,
    vitaminC: 27,
    vitaminB1: 0.07,
    vitaminB2: 0.16,
    vitaminB9: 62
  }
}), ing({
  id: 'spring-onion',
  name: 'Spring onion',
  categoryId: 'produce',
  subcategoryId: 'vegetables',
  nutrition: {
    calories: 32,
    protein: 1.8,
    carbs: 7.3,
    fat: 0.2,
    fiber: 2.6,
    sugar: 2.3
  },
  minerals: {
    calcium: 72,
    magnesium: 20,
    iron: 1.5,
    potassium: 276
  },
  vitamins: {
    vitaminK: 207,
    vitaminC: 18.8,
    vitaminA: 386,
    vitaminB1: 0.06,
    vitaminB2: 0.08,
    vitaminB9: 64
  }
}), ing({
  id: 'banana',
  name: 'Banana',
  categoryId: 'produce',
  subcategoryId: 'fruits',
  gramsPerUnit: {
    piece: 118
  },
  nutrition: {
    calories: 89,
    protein: 1.1,
    carbs: 22.8,
    fat: 0.3,
    fiber: 2.6,
    sugar: 12.2
  },
  vitamins: {
    vitaminB6: 0.4,
    vitaminC: 8.7,
    vitaminB1: 0.03,
    vitaminB2: 0.07,
    vitaminB3: 0.7,
    vitaminB9: 20
  },
  minerals: {
    potassium: 358,
    calcium: 5,
    magnesium: 27,
    iron: 0.3
  }
}), ing({
  id: 'mixed-berries',
  name: 'Mixed berries',
  categoryId: 'produce',
  subcategoryId: 'berries',
  gramsPerUnit: {
    cup: 150
  },
  nutrition: {
    calories: 50,
    protein: 0.8,
    carbs: 12,
    fat: 0.4,
    fiber: 3.5,
    sugar: 7.5
  },
  vitamins: {
    vitaminC: 30,
    vitaminB9: 20,
    vitaminE: 0.6,
    vitaminK: 15
  },
  minerals: {
    potassium: 130,
    calcium: 20,
    magnesium: 15,
    iron: 0.5
  }
}), ing({
  id: 'blueberry',
  name: 'Blueberries',
  categoryId: 'produce',
  subcategoryId: 'berries',
  gramsPerUnit: {
    cup: 148
  },
  nutrition: {
    calories: 57,
    protein: 0.7,
    carbs: 14.5,
    fat: 0.3,
    fiber: 2.4,
    sugar: 10
  },
  vitamins: {
    vitaminC: 9.7,
    vitaminK: 19.3,
    vitaminB6: 0.05,
    vitaminE: 0.6
  },
  minerals: {
    manganese: 0.3,
    calcium: 6,
    magnesium: 6,
    iron: 0.3,
    potassium: 77
  }
}), ing({
  id: 'strawberry',
  name: 'Strawberries',
  categoryId: 'produce',
  subcategoryId: 'berries',
  gramsPerUnit: {
    cup: 152
  },
  nutrition: {
    calories: 32,
    protein: 0.7,
    carbs: 7.7,
    fat: 0.3,
    fiber: 2,
    sugar: 4.9
  },
  vitamins: {
    vitaminC: 59,
    vitaminB9: 24,
    vitaminK: 2.2,
    vitaminE: 0.3
  },
  minerals: {
    potassium: 153,
    calcium: 16,
    magnesium: 13,
    iron: 0.4
  }
}), ing({
  id: 'apple',
  name: 'Apple',
  categoryId: 'produce',
  subcategoryId: 'fruits',
  gramsPerUnit: {
    piece: 182
  },
  nutrition: {
    calories: 52,
    protein: 0.3,
    carbs: 13.8,
    fat: 0.2,
    fiber: 2.4,
    sugar: 10.4
  },
  vitamins: {
    vitaminC: 4.6,
    vitaminB6: 0.04,
    vitaminK: 2.2
  },
  minerals: {
    potassium: 107,
    calcium: 6,
    magnesium: 5,
    iron: 0.1
  }
}), ing({
  id: 'mango',
  name: 'Mango',
  categoryId: 'produce',
  subcategoryId: 'fruits',
  gramsPerUnit: {
    piece: 200
  },
  nutrition: {
    calories: 60,
    protein: 0.8,
    carbs: 15,
    fat: 0.4,
    fiber: 1.6,
    sugar: 13.7
  },
  vitamins: {
    vitaminC: 36.4,
    vitaminA: 54,
    vitaminB6: 0.12,
    vitaminB9: 43,
    vitaminE: 0.9,
    vitaminK: 4.2
  },
  minerals: {
    potassium: 168,
    calcium: 11,
    magnesium: 10,
    iron: 0.2
  }
}), ing({
  id: 'pumpkin',
  name: 'Pumpkin',
  categoryId: 'produce',
  subcategoryId: 'vegetables',
  nutrition: {
    calories: 26,
    protein: 1,
    carbs: 6.5,
    fat: 0.1,
    fiber: 0.5,
    sugar: 2.8
  },
  vitamins: {
    vitaminA: 8513,
    vitaminC: 9,
    vitaminE: 1.1,
    vitaminK: 1.1,
    vitaminB9: 16
  },
  minerals: {
    potassium: 340,
    calcium: 21,
    magnesium: 12,
    iron: 0.8
  }
}), ing({
  id: 'cabbage',
  name: 'Cabbage',
  categoryId: 'produce',
  subcategoryId: 'vegetables',
  nutrition: {
    calories: 25,
    protein: 1.3,
    carbs: 5.8,
    fat: 0.1,
    fiber: 2.5,
    sugar: 3.2
  },
  vitamins: {
    vitaminK: 76,
    vitaminC: 36.6,
    vitaminB6: 0.12,
    vitaminB9: 43
  },
  minerals: {
    potassium: 170,
    calcium: 40,
    magnesium: 12,
    iron: 0.5
  }
}), ing({
  id: 'capers',
  name: 'Capers',
  categoryId: 'produce',
  subcategoryId: 'vegetables',
  gramsPerUnit: {
    tsp: 4
  },
  nutrition: {
    calories: 23,
    protein: 2.4,
    carbs: 4.9,
    fat: 0.9,
    fiber: 3.2,
    sugar: 0.4,
    sodium: 2960
  },
  minerals: {
    calcium: 40,
    magnesium: 33,
    iron: 1.7
  },
  vitamins: {
    vitaminK: 24.6,
    vitaminC: 4
  }
})];
const INGREDIENT_INDEX = new Map(INGREDIENTS.map(item => [item.id, item]));
export function getIngredientById(id) {
  return INGREDIENT_INDEX.get(id);
}