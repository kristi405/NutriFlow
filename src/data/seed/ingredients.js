import { ZERO_MINERALS, ZERO_NUTRITION, ZERO_VITAMINS } from '@/models/nutrition';
/** Builds a full Ingredient from a terse input — unspecified micronutrients default to
 *  nutritionally-negligible zero rather than requiring every field to be hand-entered. */
function ing(input) {
  return {
    id: input.id,
    name: input.name,
    category: input.category,
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
  category: 'other',
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
    vitaminB9: 47
  },
  minerals: {
    selenium: 30,
    iron: 1.8,
    phosphorus: 198,
    zinc: 1.3
  },
  allergens: ['egg']
}), ing({
  id: 'chicken-breast',
  name: 'Chicken breast',
  category: 'meat',
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
    vitaminB6: 0.6
  },
  minerals: {
    phosphorus: 220,
    selenium: 27,
    zinc: 1,
    potassium: 256
  }
}), ing({
  id: 'chicken-thigh',
  name: 'Chicken thigh',
  category: 'meat',
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
    vitaminB6: 0.3
  },
  minerals: {
    phosphorus: 180,
    zinc: 2,
    iron: 1.3
  }
}), ing({
  id: 'ground-beef',
  name: 'Ground beef (85/15)',
  category: 'meat',
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
    vitaminB3: 5
  },
  minerals: {
    iron: 2.6,
    zinc: 4.8,
    phosphorus: 200
  }
}), ing({
  id: 'ground-turkey',
  name: 'Ground turkey',
  category: 'meat',
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
    vitaminB6: 0.5
  },
  minerals: {
    selenium: 25,
    zinc: 2.1,
    phosphorus: 190
  }
}), ing({
  id: 'turkey-breast',
  name: 'Turkey breast',
  category: 'meat',
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
    vitaminB6: 0.6
  },
  minerals: {
    phosphorus: 210,
    selenium: 24
  }
}), ing({
  id: 'beef-sirloin',
  name: 'Beef sirloin',
  category: 'meat',
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
    vitaminB3: 6
  },
  minerals: {
    iron: 2.3,
    zinc: 5,
    phosphorus: 210
  }
}), ing({
  id: 'bacon',
  name: 'Bacon',
  category: 'meat',
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
  minerals: {
    phosphorus: 200,
    selenium: 20
  },
  allergens: []
}), ing({
  id: 'canadian-bacon',
  name: 'Canadian bacon',
  category: 'meat',
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
  minerals: {
    phosphorus: 250,
    potassium: 340
  }
}), ing({
  id: 'smoked-salmon',
  name: 'Smoked salmon',
  category: 'fish',
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
    vitaminB12: 3.3
  },
  minerals: {
    selenium: 25
  },
  allergens: ['fish']
}), ing({
  id: 'salmon-fillet',
  name: 'Salmon fillet',
  category: 'fish',
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
    vitaminB12: 3.2
  },
  minerals: {
    selenium: 36,
    potassium: 384
  },
  allergens: ['fish']
}), ing({
  id: 'cod-fillet',
  name: 'Cod fillet',
  category: 'fish',
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
    vitaminB12: 0.9
  },
  minerals: {
    selenium: 33,
    phosphorus: 203,
    potassium: 413
  },
  allergens: ['fish']
}), ing({
  id: 'tuna-steak',
  name: 'Tuna steak',
  category: 'fish',
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
    vitaminD: 3
  },
  minerals: {
    selenium: 80,
    potassium: 252
  },
  allergens: ['fish']
}), ing({
  id: 'canned-tuna',
  name: 'Canned tuna (in water)',
  category: 'fish',
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
    vitaminB12: 2.5
  },
  minerals: {
    selenium: 78
  },
  allergens: ['fish']
}), ing({
  id: 'shrimp',
  name: 'Shrimp',
  category: 'fish',
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
    vitaminB12: 1.1
  },
  minerals: {
    selenium: 40,
    iodine: 35
  },
  allergens: ['shellfish']
}),
// ---- Dairy & eggs ----
ing({
  id: 'greek-yogurt',
  name: 'Greek yogurt (plain)',
  category: 'dairy',
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
    vitaminB12: 0.75
  },
  minerals: {
    calcium: 110,
    phosphorus: 135
  },
  allergens: ['dairy']
}), ing({
  id: 'milk',
  name: 'Milk (2%)',
  category: 'dairy',
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
    vitaminB2: 0.18
  },
  minerals: {
    calcium: 120,
    potassium: 150
  },
  allergens: ['dairy']
}), ing({
  id: 'almond-milk',
  name: 'Almond milk (unsweetened)',
  category: 'dairy',
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
    vitaminD: 1
  },
  minerals: {
    calcium: 188
  },
  allergens: ['tree nuts']
}), ing({
  id: 'heavy-cream',
  name: 'Heavy cream',
  category: 'dairy',
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
    vitaminA: 350
  },
  minerals: {
    calcium: 65
  },
  allergens: ['dairy']
}), ing({
  id: 'butter',
  name: 'Butter',
  category: 'dairy',
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
  vitamins: {
    vitaminA: 684,
    vitaminE: 2.3
  },
  allergens: ['dairy']
}), ing({
  id: 'cream-cheese',
  name: 'Cream cheese',
  category: 'dairy',
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
    vitaminA: 308
  },
  minerals: {
    calcium: 98
  },
  allergens: ['dairy']
}), ing({
  id: 'feta-cheese',
  name: 'Feta cheese',
  category: 'dairy',
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
    vitaminB12: 1.7
  },
  minerals: {
    calcium: 493,
    phosphorus: 337
  },
  allergens: ['dairy']
}), ing({
  id: 'parmesan-cheese',
  name: 'Parmesan cheese',
  category: 'dairy',
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
    vitaminB12: 1.3
  },
  minerals: {
    calcium: 1184,
    phosphorus: 694,
    zinc: 2.9
  },
  allergens: ['dairy']
}), ing({
  id: 'cheddar-cheese',
  name: 'Cheddar cheese',
  category: 'dairy',
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
    vitaminB12: 0.8
  },
  minerals: {
    calcium: 721,
    zinc: 3.1
  },
  allergens: ['dairy']
}), ing({
  id: 'mozzarella-fresh',
  name: 'Fresh mozzarella',
  category: 'dairy',
  nutrition: {
    calories: 280,
    protein: 22,
    carbs: 2.2,
    fat: 21,
    saturatedFat: 13,
    cholesterol: 79,
    sodium: 373
  },
  minerals: {
    calcium: 505,
    phosphorus: 354
  },
  allergens: ['dairy']
}), ing({
  id: 'ricotta-cheese',
  name: 'Ricotta cheese',
  category: 'dairy',
  nutrition: {
    calories: 174,
    protein: 11.3,
    carbs: 3,
    fat: 13,
    saturatedFat: 8,
    cholesterol: 51,
    sodium: 84
  },
  minerals: {
    calcium: 207,
    phosphorus: 158
  },
  allergens: ['dairy']
}), ing({
  id: 'cottage-cheese',
  name: 'Cottage cheese',
  category: 'dairy',
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
  minerals: {
    calcium: 83,
    phosphorus: 159,
    selenium: 12
  },
  allergens: ['dairy']
}), ing({
  id: 'sour-cream',
  name: 'Sour cream',
  category: 'dairy',
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
  minerals: {
    calcium: 96
  },
  allergens: ['dairy']
}),
// ---- Grains / bread / pasta ----
ing({
  id: 'sourdough-bread',
  name: 'Sourdough bread',
  category: 'bakery',
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
  minerals: {
    iron: 3.5,
    magnesium: 30
  },
  allergens: ['gluten']
}), ing({
  id: 'bread',
  name: 'Sandwich bread',
  category: 'bakery',
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
  minerals: {
    iron: 3.6
  },
  allergens: ['gluten']
}), ing({
  id: 'baguette',
  name: 'Baguette',
  category: 'bakery',
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
  allergens: ['gluten']
}), ing({
  id: 'bagel',
  name: 'Bagel',
  category: 'bakery',
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
  minerals: {
    iron: 2.9
  },
  allergens: ['gluten']
}), ing({
  id: 'english-muffin',
  name: 'English muffin',
  category: 'bakery',
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
  allergens: ['gluten']
}), ing({
  id: 'tortilla-wrap',
  name: 'Flour tortilla wrap',
  category: 'bakery',
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
  allergens: ['gluten']
}), ing({
  id: 'corn-tortilla',
  name: 'Corn tortilla',
  category: 'bakery',
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
  }
}), ing({
  id: 'rolled-oats',
  name: 'Rolled oats',
  category: 'pantry',
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
    vitaminB1: 0.76
  },
  minerals: {
    magnesium: 177,
    manganese: 4.9,
    iron: 4.7
  },
  allergens: ['gluten']
}), ing({
  id: 'white-rice-dry',
  name: 'White rice (uncooked)',
  category: 'pantry',
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
  minerals: {
    manganese: 1.1,
    phosphorus: 115
  }
}), ing({
  id: 'quinoa-dry',
  name: 'Quinoa (uncooked)',
  category: 'pantry',
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
    vitaminB9: 184
  },
  minerals: {
    magnesium: 197,
    iron: 4.6,
    manganese: 2.6,
    potassium: 563
  }
}), ing({
  id: 'pasta-dry',
  name: 'Pasta (uncooked)',
  category: 'pantry',
  nutrition: {
    calories: 371,
    protein: 13,
    carbs: 74.7,
    fat: 1.5,
    fiber: 3.2,
    sugar: 2.7
  },
  minerals: {
    manganese: 1.3,
    selenium: 60
  },
  allergens: ['gluten']
}), ing({
  id: 'egg-noodles-dry',
  name: 'Egg noodles (uncooked)',
  category: 'pantry',
  nutrition: {
    calories: 384,
    protein: 14,
    carbs: 71,
    fat: 4.5,
    fiber: 3.2,
    sugar: 1.8,
    cholesterol: 95
  },
  allergens: ['gluten', 'egg']
}), ing({
  id: 'breadcrumbs',
  name: 'Breadcrumbs',
  category: 'pantry',
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
  allergens: ['gluten']
}), ing({
  id: 'flour',
  name: 'All-purpose flour',
  category: 'pantry',
  nutrition: {
    calories: 364,
    protein: 10.3,
    carbs: 76.3,
    fat: 1,
    fiber: 2.7,
    sugar: 0.3
  },
  minerals: {
    iron: 4.6
  },
  allergens: ['gluten']
}), ing({
  id: 'granola',
  name: 'Granola',
  category: 'pantry',
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
  minerals: {
    magnesium: 120,
    iron: 2.8
  },
  allergens: ['gluten', 'tree nuts']
}), ing({
  id: 'croutons',
  name: 'Croutons',
  category: 'pantry',
  nutrition: {
    calories: 407,
    protein: 10,
    carbs: 66,
    fat: 11,
    fiber: 4.9,
    sugar: 4.4,
    sodium: 900
  },
  allergens: ['gluten']
}),
// ---- Legumes & pantry staples ----
ing({
  id: 'chickpeas-canned',
  name: 'Chickpeas (canned)',
  category: 'pantry',
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
    vitaminB9: 65
  },
  minerals: {
    iron: 1.6,
    magnesium: 33,
    potassium: 210
  }
}), ing({
  id: 'red-lentils-dry',
  name: 'Red lentils (uncooked)',
  category: 'pantry',
  nutrition: {
    calories: 352,
    protein: 24.6,
    carbs: 63.4,
    fat: 1.1,
    fiber: 10.7,
    sugar: 2
  },
  vitamins: {
    vitaminB9: 479
  },
  minerals: {
    iron: 6.5,
    magnesium: 122,
    potassium: 955
  }
}), ing({
  id: 'honey',
  name: 'Honey',
  category: 'pantry',
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
  minerals: {
    potassium: 52
  }
}), ing({
  id: 'peanut-butter',
  name: 'Peanut butter',
  category: 'pantry',
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
    vitaminB3: 13.5
  },
  minerals: {
    magnesium: 168,
    potassium: 649
  },
  allergens: ['peanuts']
}), ing({
  id: 'dark-chocolate',
  name: 'Dark chocolate (70%)',
  category: 'pantry',
  nutrition: {
    calories: 598,
    protein: 7.8,
    carbs: 45.9,
    fat: 42.6,
    saturatedFat: 24.5,
    fiber: 11,
    sugar: 24
  },
  minerals: {
    iron: 11.9,
    magnesium: 228,
    copper: 1.8
  }
}), ing({
  id: 'chia-seeds',
  name: 'Chia seeds',
  category: 'pantry',
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
  minerals: {
    calcium: 631,
    magnesium: 335,
    iron: 7.7
  }
}), ing({
  id: 'walnuts',
  name: 'Walnuts',
  category: 'pantry',
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
    vitaminB6: 0.5
  },
  minerals: {
    magnesium: 158,
    copper: 1.6,
    manganese: 3.4
  },
  allergens: ['tree nuts']
}), ing({
  id: 'pine-nuts',
  name: 'Pine nuts',
  category: 'pantry',
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
    vitaminK: 53.9
  },
  minerals: {
    manganese: 8.8,
    zinc: 6.5
  },
  allergens: ['tree nuts']
}), ing({
  id: 'sesame-seeds',
  name: 'Sesame seeds',
  category: 'pantry',
  nutrition: {
    calories: 573,
    protein: 17.7,
    carbs: 23.4,
    fat: 49.7,
    saturatedFat: 7,
    fiber: 11.8,
    sugar: 0.3
  },
  minerals: {
    calcium: 975,
    iron: 14.6,
    magnesium: 351
  },
  allergens: ['sesame']
}), ing({
  id: 'baking-powder',
  name: 'Baking powder',
  category: 'pantry',
  gramsPerUnit: {
    tsp: 4.6
  },
  nutrition: {
    calories: 53,
    protein: 0,
    carbs: 27.7,
    fat: 0,
    sodium: 10600
  }
}), ing({
  id: 'soy-sauce',
  name: 'Soy sauce',
  category: 'pantry',
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
  }
}), ing({
  id: 'balsamic-vinegar',
  name: 'Balsamic vinegar',
  category: 'pantry',
  gramsPerUnit: {
    tbsp: 16
  },
  nutrition: {
    calories: 88,
    protein: 0.5,
    carbs: 17,
    fat: 0,
    sugar: 15
  }
}), ing({
  id: 'olive-oil',
  name: 'Olive oil',
  category: 'pantry',
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
  category: 'pantry',
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
  category: 'pantry',
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
  allergens: ['egg']
}), ing({
  id: 'caesar-dressing',
  name: 'Caesar dressing',
  category: 'pantry',
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
  allergens: ['egg', 'dairy']
}), ing({
  id: 'curry-powder',
  name: 'Curry powder',
  category: 'pantry',
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
  minerals: {
    iron: 29.6,
    manganese: 7.6
  }
}), ing({
  id: 'cumin',
  name: 'Cumin',
  category: 'pantry',
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
  minerals: {
    iron: 66.4,
    magnesium: 366
  }
}), ing({
  id: 'cinnamon',
  name: 'Cinnamon',
  category: 'pantry',
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
  minerals: {
    calcium: 1002,
    manganese: 17.5
  }
}), ing({
  id: 'nutmeg',
  name: 'Nutmeg',
  category: 'pantry',
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
  minerals: {
    manganese: 2.9,
    magnesium: 183
  }
}), ing({
  id: 'chili-flakes',
  name: 'Chili flakes',
  category: 'pantry',
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
  vitamins: {
    vitaminA: 41610,
    vitaminC: 76.4
  }
}), ing({
  id: 'matcha-powder',
  name: 'Matcha powder',
  category: 'pantry',
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
    vitaminC: 8
  },
  minerals: {
    potassium: 2500
  }
}), ing({
  id: 'coconut-milk',
  name: 'Coconut milk (canned)',
  category: 'pantry',
  nutrition: {
    calories: 230,
    protein: 2.3,
    carbs: 5.5,
    fat: 24,
    saturatedFat: 21,
    sugar: 3.3
  },
  minerals: {
    magnesium: 37,
    manganese: 0.9,
    potassium: 263
  }
}), ing({
  id: 'vegetable-broth',
  name: 'Vegetable broth',
  category: 'pantry',
  nutrition: {
    calories: 5,
    protein: 0.3,
    carbs: 0.9,
    fat: 0.1,
    sodium: 340
  }
}), ing({
  id: 'chicken-broth',
  name: 'Chicken broth',
  category: 'pantry',
  nutrition: {
    calories: 8,
    protein: 1.2,
    carbs: 0.5,
    fat: 0.3,
    sodium: 343
  }
}), ing({
  id: 'tomato-canned',
  name: 'Canned tomatoes',
  category: 'pantry',
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
    vitaminA: 42
  },
  minerals: {
    potassium: 218
  }
}), ing({
  id: 'tomato-sauce',
  name: 'Tomato sauce',
  category: 'pantry',
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
    vitaminA: 38
  },
  minerals: {
    potassium: 297
  }
}),
// ---- Produce ----
ing({
  id: 'avocado',
  name: 'Avocado',
  category: 'produce',
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
    vitaminC: 10
  },
  minerals: {
    potassium: 485,
    magnesium: 29
  }
}), ing({
  id: 'lemon',
  name: 'Lemon',
  category: 'produce',
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
    vitaminC: 53
  },
  minerals: {
    potassium: 138
  }
}), ing({
  id: 'lemon-juice',
  name: 'Lemon juice',
  category: 'produce',
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
  vitamins: {
    vitaminC: 39
  }
}), ing({
  id: 'lime',
  name: 'Lime',
  category: 'produce',
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
  vitamins: {
    vitaminC: 29
  }
}), ing({
  id: 'tomato',
  name: 'Tomato',
  category: 'produce',
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
    vitaminK: 7.9
  },
  minerals: {
    potassium: 237
  }
}), ing({
  id: 'cherry-tomato',
  name: 'Cherry tomatoes',
  category: 'produce',
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
    vitaminA: 42
  },
  minerals: {
    potassium: 237
  }
}), ing({
  id: 'cucumber',
  name: 'Cucumber',
  category: 'produce',
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
    vitaminC: 2.8
  },
  minerals: {
    potassium: 147
  }
}), ing({
  id: 'red-onion',
  name: 'Red onion',
  category: 'produce',
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
    vitaminB9: 19
  },
  minerals: {
    potassium: 146
  }
}), ing({
  id: 'onion',
  name: 'Onion',
  category: 'produce',
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
    vitaminB9: 19
  },
  minerals: {
    potassium: 146
  }
}), ing({
  id: 'garlic',
  name: 'Garlic',
  category: 'produce',
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
    vitaminB6: 1.2
  },
  minerals: {
    manganese: 1.7,
    selenium: 14.2
  }
}), ing({
  id: 'ginger',
  name: 'Ginger',
  category: 'produce',
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
    vitaminB6: 0.2
  },
  minerals: {
    magnesium: 43,
    potassium: 415,
    manganese: 0.2
  }
}), ing({
  id: 'spinach',
  name: 'Spinach',
  category: 'produce',
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
    vitaminB9: 194
  },
  minerals: {
    iron: 2.7,
    magnesium: 79,
    potassium: 558,
    calcium: 99
  }
}), ing({
  id: 'romaine-lettuce',
  name: 'Romaine lettuce',
  category: 'produce',
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
    vitaminC: 4
  },
  minerals: {
    potassium: 247
  }
}), ing({
  id: 'mixed-greens',
  name: 'Mixed greens',
  category: 'produce',
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
    vitaminC: 15
  },
  minerals: {
    potassium: 250
  }
}), ing({
  id: 'broccoli',
  name: 'Broccoli',
  category: 'produce',
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
    vitaminB9: 63
  },
  minerals: {
    potassium: 316,
    calcium: 47
  }
}), ing({
  id: 'asparagus',
  name: 'Asparagus',
  category: 'produce',
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
    vitaminC: 5.6
  },
  minerals: {
    potassium: 202
  }
}), ing({
  id: 'bell-pepper',
  name: 'Bell pepper',
  category: 'produce',
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
    vitaminA: 157
  },
  minerals: {
    potassium: 211
  }
}), ing({
  id: 'carrot',
  name: 'Carrot',
  category: 'produce',
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
    vitaminC: 5.9
  },
  minerals: {
    potassium: 320
  }
}), ing({
  id: 'celery',
  name: 'Celery',
  category: 'produce',
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
    vitaminC: 3.1
  },
  minerals: {
    potassium: 260
  }
}), ing({
  id: 'mushroom',
  name: 'Mushroom',
  category: 'produce',
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
    vitaminB3: 3.6
  },
  minerals: {
    selenium: 9.3,
    potassium: 318,
    copper: 0.3
  }
}), ing({
  id: 'portobello-mushroom',
  name: 'Portobello mushroom',
  category: 'produce',
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
    vitaminB3: 4.9
  },
  minerals: {
    selenium: 9,
    potassium: 364,
    copper: 0.4
  }
}), ing({
  id: 'kalamata-olives',
  name: 'Kalamata olives',
  category: 'produce',
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
  vitamins: {
    vitaminE: 1.7
  }
}), ing({
  id: 'basil',
  name: 'Basil',
  category: 'produce',
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
    vitaminC: 18
  },
  minerals: {
    calcium: 177,
    iron: 3.2,
    manganese: 1.1
  }
}), ing({
  id: 'parsley',
  name: 'Parsley',
  category: 'produce',
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
    vitaminA: 421
  },
  minerals: {
    iron: 6.2
  }
}), ing({
  id: 'dill',
  name: 'Dill',
  category: 'produce',
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
    vitaminA: 386
  },
  minerals: {
    calcium: 208,
    iron: 6.6
  }
}), ing({
  id: 'chives',
  name: 'Chives',
  category: 'produce',
  nutrition: {
    calories: 30,
    protein: 3.3,
    carbs: 4.4,
    fat: 0.7,
    fiber: 2.5,
    sugar: 1.9
  },
  vitamins: {
    vitaminK: 213,
    vitaminA: 218,
    vitaminC: 58.1
  }
}), ing({
  id: 'cilantro',
  name: 'Cilantro',
  category: 'produce',
  nutrition: {
    calories: 23,
    protein: 2.1,
    carbs: 3.7,
    fat: 0.5,
    fiber: 2.8,
    sugar: 0.9
  },
  vitamins: {
    vitaminK: 310,
    vitaminA: 337,
    vitaminC: 27
  }
}), ing({
  id: 'spring-onion',
  name: 'Spring onion',
  category: 'produce',
  nutrition: {
    calories: 32,
    protein: 1.8,
    carbs: 7.3,
    fat: 0.2,
    fiber: 2.6,
    sugar: 2.3
  },
  vitamins: {
    vitaminK: 207,
    vitaminC: 18.8,
    vitaminA: 386
  }
}), ing({
  id: 'banana',
  name: 'Banana',
  category: 'produce',
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
    vitaminC: 8.7
  },
  minerals: {
    potassium: 358
  }
}), ing({
  id: 'mixed-berries',
  name: 'Mixed berries',
  category: 'produce',
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
    vitaminC: 30
  },
  minerals: {
    potassium: 130
  }
}), ing({
  id: 'blueberry',
  name: 'Blueberries',
  category: 'produce',
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
    vitaminK: 19.3
  },
  minerals: {
    manganese: 0.3
  }
}), ing({
  id: 'strawberry',
  name: 'Strawberries',
  category: 'produce',
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
    vitaminC: 59
  },
  minerals: {
    potassium: 153
  }
}), ing({
  id: 'apple',
  name: 'Apple',
  category: 'produce',
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
    vitaminC: 4.6
  },
  minerals: {
    potassium: 107
  }
}), ing({
  id: 'mango',
  name: 'Mango',
  category: 'produce',
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
    vitaminA: 54
  },
  minerals: {
    potassium: 168
  }
}), ing({
  id: 'pumpkin',
  name: 'Pumpkin',
  category: 'produce',
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
    vitaminC: 9
  },
  minerals: {
    potassium: 340
  }
}), ing({
  id: 'cabbage',
  name: 'Cabbage',
  category: 'produce',
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
    vitaminC: 36.6
  },
  minerals: {
    potassium: 170
  }
}), ing({
  id: 'capers',
  name: 'Capers',
  category: 'produce',
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
  vitamins: {
    vitaminK: 24.6
  }
})];
const INGREDIENT_INDEX = new Map(INGREDIENTS.map(item => [item.id, item]));
export function getIngredientById(id) {
  return INGREDIENT_INDEX.get(id);
}
