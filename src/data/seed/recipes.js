import { myRecipesStore } from '@/store/myRecipesStore';

function i(ingredientId, quantity, unit, substituteIds) {
  return {
    ingredientId,
    quantity,
    unit,
    substituteIds
  };
}
function recipe(input) {
  const steps = input.steps.map((step, index) => typeof step === 'string' ? {
    order: index + 1,
    instruction: step
  } : {
    order: index + 1,
    instruction: step.instruction,
    timerSeconds: step.timerSeconds
  });
  return {
    id: input.id,
    title: input.title,
    description: input.description,
    categoryId: input.categoryId,
    imageUrl: input.imageUrl,
    rating: input.rating,
    ratingCount: input.ratingCount,
    prepTimeMinutes: input.prepTimeMinutes,
    cookTimeMinutes: input.cookTimeMinutes,
    difficulty: input.difficulty,
    servings: input.servings,
    mealTypes: input.mealTypes,
    dietaryTags: input.dietaryTags ?? [],
    allergens: input.allergens ?? [],
    ingredients: input.ingredients,
    steps
  };
}
export const RECIPES = [
// ---------------- Breakfast ----------------
recipe({
  id: 'avocado-toast-with-egg',
  title: 'Avocado Toast with Egg',
  description: 'Creamy smashed avocado on toasted sourdough, topped with a soft fried egg and chili flakes.',
  categoryId: 'breakfast',
  imageUrl: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=1200',
  rating: 4.7,
  ratingCount: 812,
  prepTimeMinutes: 5,
  cookTimeMinutes: 5,
  difficulty: 'easy',
  servings: 1,
  mealTypes: ['breakfast'],
  dietaryTags: ['vegetarian', 'quick-easy'],
  allergens: ['egg', 'gluten'],
  ingredients: [i('sourdough-bread', 2, 'slice'), i('avocado', 1, 'piece'), i('egg', 1, 'piece'), i('lemon-juice', 1, 'tsp'), i('chili-flakes', 0.5, 'tsp'), i('olive-oil', 1, 'tsp')],
  steps: ['Toast the sourdough slices until golden and crisp.', 'Mash the avocado with lemon juice, salt and pepper.', {
    instruction: 'Fry the egg in olive oil over medium heat until the white is set.',
    timerSeconds: 180
  }, 'Spread avocado over the toast, top with the fried egg and chili flakes.']
}), recipe({
  id: 'greek-yogurt-with-berries',
  title: 'Greek Yogurt with Berries',
  description: 'Thick Greek yogurt layered with mixed berries, honey and crunchy granola.',
  categoryId: 'breakfast',
  imageUrl: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=1200',
  rating: 4.6,
  ratingCount: 654,
  prepTimeMinutes: 5,
  cookTimeMinutes: 0,
  difficulty: 'easy',
  servings: 1,
  mealTypes: ['breakfast', 'snack'],
  dietaryTags: ['vegetarian', 'high-protein', 'quick-easy'],
  allergens: ['dairy', 'gluten'],
  ingredients: [i('greek-yogurt', 200, 'g'), i('mixed-berries', 1, 'cup'), i('honey', 1, 'tbsp'), i('granola', 0.25, 'cup')],
  steps: ['Spoon the Greek yogurt into a bowl.', 'Top with mixed berries and a drizzle of honey.', 'Finish with a sprinkle of granola.']
}), recipe({
  id: 'banana-oatmeal',
  title: 'Banana Oatmeal',
  description: 'Warm rolled oats simmered with milk, mashed banana, cinnamon and toasted walnuts.',
  categoryId: 'breakfast',
  imageUrl: 'https://images.unsplash.com/photo-1517673400267-0251440c45dc?w=1200',
  rating: 4.5,
  ratingCount: 421,
  prepTimeMinutes: 5,
  cookTimeMinutes: 10,
  difficulty: 'easy',
  servings: 1,
  mealTypes: ['breakfast'],
  dietaryTags: ['vegetarian', 'quick-easy'],
  allergens: ['gluten', 'dairy', 'tree nuts'],
  ingredients: [i('rolled-oats', 0.5, 'cup'), i('milk', 200, 'ml', ['almond-milk']), i('banana', 1, 'piece'), i('cinnamon', 0.5, 'tsp'), i('honey', 1, 'tsp'), i('walnuts', 15, 'g')],
  steps: [{
    instruction: 'Simmer oats in milk over medium-low heat, stirring occasionally.',
    timerSeconds: 480
  }, 'Mash half the banana into the oats; slice the rest for topping.', 'Spoon into a bowl, top with banana slices, cinnamon, honey and walnuts.']
}), recipe({
  id: 'spinach-omelette',
  title: 'Spinach Omelette',
  description: 'Fluffy three-egg omelette folded with wilted spinach and crumbled feta.',
  categoryId: 'breakfast',
  imageUrl: 'https://images.unsplash.com/photo-1510693206972-df098062cb71?w=1200',
  rating: 4.6,
  ratingCount: 388,
  prepTimeMinutes: 5,
  cookTimeMinutes: 8,
  difficulty: 'easy',
  servings: 1,
  mealTypes: ['breakfast'],
  dietaryTags: ['vegetarian', 'high-protein', 'low-carb', 'quick-easy'],
  allergens: ['egg', 'dairy'],
  ingredients: [i('egg', 3, 'piece'), i('spinach', 1, 'cup'), i('feta-cheese', 30, 'g'), i('olive-oil', 1, 'tsp')],
  steps: ['Whisk the eggs with a pinch of salt and pepper.', 'Wilt the spinach in olive oil over medium heat, about 1 minute.', {
    instruction: 'Pour in the eggs and cook until mostly set.',
    timerSeconds: 150
  }, 'Sprinkle with feta, fold in half and slide onto a plate.']
}), recipe({
  id: 'cottage-cheese-pancakes',
  title: 'Cottage Cheese Pancakes',
  description: 'High-protein pancakes made with cottage cheese, oats and banana — no flour needed.',
  categoryId: 'breakfast',
  imageUrl: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=1200',
  rating: 4.4,
  ratingCount: 297,
  prepTimeMinutes: 10,
  cookTimeMinutes: 10,
  difficulty: 'medium',
  servings: 2,
  mealTypes: ['breakfast'],
  dietaryTags: ['vegetarian', 'high-protein'],
  allergens: ['egg', 'dairy', 'gluten'],
  ingredients: [i('cottage-cheese', 200, 'g'), i('egg', 2, 'piece'), i('rolled-oats', 0.5, 'cup'), i('banana', 1, 'piece'), i('baking-powder', 0.5, 'tsp'), i('butter', 1, 'tbsp')],
  steps: ['Blend the cottage cheese, eggs, oats, half the banana and baking powder until smooth.', {
    instruction: 'Rest the batter for 5 minutes.',
    timerSeconds: 300
  }, 'Melt butter in a nonstick pan and pour small rounds of batter.', {
    instruction: 'Cook each side until golden.',
    timerSeconds: 120
  }, 'Serve stacked with the remaining banana sliced on top.']
}),
// ---------------- Brunch ----------------
recipe({
  id: 'smoked-salmon-bagel',
  title: 'Smoked Salmon Bagel',
  description: 'A toasted bagel piled with cream cheese, smoked salmon, capers and red onion.',
  categoryId: 'breakfast',
  imageUrl: 'https://images.unsplash.com/photo-1592483648228-9c1a30651052?w=1200',
  rating: 4.8,
  ratingCount: 503,
  prepTimeMinutes: 8,
  cookTimeMinutes: 2,
  difficulty: 'easy',
  servings: 1,
  mealTypes: ['brunch'],
  dietaryTags: ['quick-easy'],
  allergens: ['gluten', 'dairy', 'fish'],
  ingredients: [i('bagel', 1, 'piece'), i('cream-cheese', 2, 'tbsp'), i('smoked-salmon', 80, 'g'), i('red-onion', 20, 'g'), i('capers', 1, 'tsp'), i('dill', 2, 'g')],
  steps: ['Slice and toast the bagel.', 'Spread cream cheese generously on both halves.', 'Layer smoked salmon, thin red onion slices and capers.', 'Finish with chopped dill.']
}), recipe({
  id: 'eggs-benedict',
  title: 'Eggs Benedict',
  description: 'Poached eggs and Canadian bacon on a toasted English muffin, finished with a buttery hollandaise.',
  categoryId: 'breakfast',
  imageUrl: 'https://images.unsplash.com/photo-1608039755401-742074f0548d?w=1200',
  rating: 4.7,
  ratingCount: 445,
  prepTimeMinutes: 10,
  cookTimeMinutes: 15,
  difficulty: 'hard',
  servings: 2,
  mealTypes: ['brunch'],
  allergens: ['gluten', 'egg', 'dairy'],
  ingredients: [i('english-muffin', 2, 'piece'), i('canadian-bacon', 4, 'slice'), i('egg', 4, 'piece'), i('butter', 3, 'tbsp'), i('lemon-juice', 1, 'tbsp'), i('chives', 2, 'g')],
  steps: ['Split and toast the English muffins.', 'Warm the Canadian bacon in a pan until lightly browned.', {
    instruction: 'Poach the eggs in gently simmering water until whites are set.',
    timerSeconds: 210
  }, 'Whisk egg yolks with lemon juice, then slowly whisk in melted butter to make hollandaise.', 'Stack muffin, bacon and poached egg; spoon over hollandaise and top with chives.']
}), recipe({
  id: 'chicken-caesar-wrap',
  title: 'Chicken Caesar Wrap',
  description: 'Grilled chicken, crisp romaine and parmesan rolled into a soft tortilla with Caesar dressing.',
  categoryId: 'lunch',
  imageUrl: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=1200',
  rating: 4.5,
  ratingCount: 366,
  prepTimeMinutes: 10,
  cookTimeMinutes: 10,
  difficulty: 'easy',
  servings: 1,
  mealTypes: ['brunch', 'lunch'],
  dietaryTags: ['high-protein'],
  allergens: ['gluten', 'dairy', 'egg'],
  ingredients: [i('tortilla-wrap', 1, 'piece'), i('chicken-breast', 120, 'g'), i('romaine-lettuce', 60, 'g'), i('parmesan-cheese', 15, 'g'), i('caesar-dressing', 2, 'tbsp'), i('olive-oil', 1, 'tsp')],
  steps: [{
    instruction: 'Pan-sear the chicken breast in olive oil until cooked through.',
    timerSeconds: 480
  }, 'Slice the chicken and toss with romaine, parmesan and Caesar dressing.', 'Fill the tortilla with the mixture and roll tightly.']
}), recipe({
  id: 'avocado-chicken-sandwich',
  title: 'Avocado Chicken Sandwich',
  description: 'Grilled chicken breast with mashed avocado, tomato and lettuce on toasted bread.',
  categoryId: 'lunch',
  imageUrl: 'https://images.unsplash.com/photo-1553909489-cd47e0907980?w=1200',
  rating: 4.6,
  ratingCount: 312,
  prepTimeMinutes: 10,
  cookTimeMinutes: 10,
  difficulty: 'easy',
  servings: 1,
  mealTypes: ['brunch', 'lunch'],
  dietaryTags: ['high-protein'],
  allergens: ['gluten', 'egg'],
  ingredients: [i('bread', 2, 'slice'), i('chicken-breast', 120, 'g'), i('avocado', 0.5, 'piece'), i('tomato', 0.5, 'piece'), i('romaine-lettuce', 20, 'g'), i('mayonnaise', 1, 'tbsp', ['avocado'])],
  steps: [{
    instruction: 'Season and grill the chicken breast until cooked through.',
    timerSeconds: 480
  }, 'Toast the bread and mash the avocado on one slice.', 'Layer chicken, tomato and lettuce, spread mayonnaise on the other slice, and close the sandwich.']
}), recipe({
  id: 'veggie-quiche',
  title: 'Veggie Quiche',
  description: 'A buttery homemade crust filled with eggs, spinach, bell pepper and melted cheddar.',
  categoryId: 'breakfast',
  imageUrl: 'https://images.unsplash.com/photo-1584949091598-c31daaaa4aa9?w=1200',
  rating: 4.5,
  ratingCount: 214,
  prepTimeMinutes: 20,
  cookTimeMinutes: 35,
  difficulty: 'hard',
  servings: 6,
  mealTypes: ['brunch'],
  dietaryTags: ['vegetarian'],
  allergens: ['gluten', 'egg', 'dairy'],
  ingredients: [i('flour', 150, 'g'), i('butter', 90, 'g'), i('egg', 5, 'piece'), i('milk', 150, 'ml'), i('spinach', 2, 'cup'), i('bell-pepper', 1, 'piece'), i('cheddar-cheese', 80, 'g'), i('onion', 0.5, 'piece')],
  steps: ['Combine flour and cold butter into a dough, press into a tart pan and chill.', {
    instruction: 'Blind-bake the crust at 190°C (375°F).',
    timerSeconds: 600
  }, 'Sauté onion, bell pepper and spinach until softened.', 'Whisk eggs with milk, stir in the vegetables and cheddar, then pour into the crust.', {
    instruction: 'Bake until the filling is set and golden.',
    timerSeconds: 1500
  }]
}),
// ---------------- Salads ----------------
recipe({
  id: 'greek-salad',
  title: 'Greek Salad',
  description: 'Crisp cucumber, tomato and red onion with feta, kalamata olives and a bright olive oil dressing.',
  categoryId: 'salad',
  imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=1200',
  rating: 4.7,
  ratingCount: 589,
  prepTimeMinutes: 15,
  cookTimeMinutes: 0,
  difficulty: 'easy',
  servings: 2,
  mealTypes: ['lunch', 'dinner'],
  dietaryTags: ['vegetarian', 'low-carb', 'gluten-free', 'quick-easy'],
  allergens: ['dairy'],
  ingredients: [i('cucumber', 1, 'piece', undefined), i('tomato', 2, 'piece'), i('red-onion', 0.25, 'piece'), i('feta-cheese', 100, 'g'), i('kalamata-olives', 50, 'g'), i('olive-oil', 2, 'tbsp')],
  steps: ['Chop the cucumber and tomato into chunks; thinly slice the red onion.', 'Combine in a bowl with olives and a block of feta on top.', 'Drizzle with olive oil and season with oregano, salt and pepper.']
}), recipe({
  id: 'caesar-salad',
  title: 'Caesar Salad',
  description: 'Classic romaine, crunchy croutons and shaved parmesan tossed in Caesar dressing, with optional grilled chicken.',
  categoryId: 'salad',
  imageUrl: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=1200',
  rating: 4.6,
  ratingCount: 671,
  prepTimeMinutes: 10,
  cookTimeMinutes: 8,
  difficulty: 'easy',
  servings: 2,
  mealTypes: ['lunch', 'dinner'],
  dietaryTags: ['high-protein'],
  allergens: ['gluten', 'dairy', 'egg'],
  ingredients: [i('romaine-lettuce', 200, 'g'), i('parmesan-cheese', 30, 'g'), i('croutons', 40, 'g'), i('caesar-dressing', 3, 'tbsp'), i('chicken-breast', 150, 'g'), i('olive-oil', 1, 'tsp')],
  steps: [{
    instruction: 'Sear the chicken breast in olive oil until cooked through, then slice.',
    timerSeconds: 480
  }, 'Chop the romaine and toss with Caesar dressing.', 'Top with croutons, shaved parmesan and sliced chicken.']
}), recipe({
  id: 'quinoa-salad',
  title: 'Quinoa Salad',
  description: 'Fluffy quinoa with cucumber, cherry tomatoes, chickpeas and feta in a lemon-olive oil dressing.',
  categoryId: 'salad',
  imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1200',
  rating: 4.5,
  ratingCount: 298,
  prepTimeMinutes: 10,
  cookTimeMinutes: 15,
  difficulty: 'easy',
  servings: 2,
  mealTypes: ['lunch', 'dinner'],
  dietaryTags: ['vegetarian', 'high-protein', 'gluten-free'],
  allergens: ['dairy'],
  ingredients: [i('quinoa-dry', 0.5, 'cup'), i('cucumber', 1, 'piece'), i('cherry-tomato', 150, 'g'), i('chickpeas-canned', 150, 'g'), i('feta-cheese', 60, 'g'), i('olive-oil', 2, 'tbsp'), i('lemon-juice', 1, 'tbsp')],
  steps: [{
    instruction: 'Rinse and simmer quinoa in water until fluffy, then cool.',
    timerSeconds: 900
  }, 'Dice the cucumber and halve the cherry tomatoes.', 'Combine quinoa, cucumber, tomatoes, chickpeas and feta.', 'Dress with olive oil and lemon juice, then toss.']
}), recipe({
  id: 'tuna-salad',
  title: 'Tuna Salad',
  description: 'Flaked tuna with celery and red onion in a light mayonnaise dressing over mixed greens.',
  categoryId: 'salad',
  imageUrl: 'https://images.unsplash.com/photo-1604909052743-94e838986d24?w=1200',
  rating: 4.3,
  ratingCount: 233,
  prepTimeMinutes: 10,
  cookTimeMinutes: 0,
  difficulty: 'easy',
  servings: 1,
  mealTypes: ['lunch'],
  dietaryTags: ['high-protein', 'low-carb', 'quick-easy'],
  allergens: ['fish', 'egg'],
  ingredients: [i('canned-tuna', 150, 'g'), i('mayonnaise', 1, 'tbsp'), i('celery', 30, 'g'), i('red-onion', 20, 'g'), i('lemon-juice', 1, 'tsp'), i('mixed-greens', 1, 'cup')],
  steps: ['Drain the tuna and flake it into a bowl.', 'Finely dice celery and red onion, then mix with tuna, mayonnaise and lemon juice.', 'Serve over a bed of mixed greens.']
}), recipe({
  id: 'caprese-salad',
  title: 'Caprese Salad',
  description: 'Sliced tomato and fresh mozzarella layered with basil, olive oil and balsamic glaze.',
  categoryId: 'salad',
  imageUrl: 'https://images.unsplash.com/photo-1608897013039-887f21d8c804?w=1200',
  rating: 4.7,
  ratingCount: 401,
  prepTimeMinutes: 10,
  cookTimeMinutes: 0,
  difficulty: 'easy',
  servings: 2,
  mealTypes: ['lunch'],
  dietaryTags: ['vegetarian', 'low-carb', 'gluten-free', 'quick-easy'],
  allergens: ['dairy'],
  ingredients: [i('tomato', 3, 'piece'), i('mozzarella-fresh', 150, 'g'), i('basil', 10, 'g'), i('olive-oil', 2, 'tbsp'), i('balsamic-vinegar', 1, 'tbsp')],
  steps: ['Slice the tomatoes and mozzarella into rounds.', 'Arrange alternating with basil leaves on a plate.', 'Drizzle with olive oil and balsamic vinegar.']
}),
// ---------------- Soups ----------------
recipe({
  id: 'creamy-tomato-soup',
  title: 'Creamy Tomato Soup',
  description: 'Slow-simmered tomatoes with garlic and basil, finished with a swirl of cream.',
  categoryId: 'lunch',
  imageUrl: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=1200',
  rating: 4.6,
  ratingCount: 356,
  prepTimeMinutes: 10,
  cookTimeMinutes: 30,
  difficulty: 'easy',
  servings: 4,
  mealTypes: ['lunch', 'dinner'],
  dietaryTags: ['vegetarian'],
  allergens: ['dairy'],
  ingredients: [i('tomato-canned', 800, 'g'), i('onion', 1, 'piece'), i('garlic', 2, 'clove'), i('vegetable-broth', 400, 'ml'), i('heavy-cream', 100, 'ml'), i('olive-oil', 1, 'tbsp'), i('basil', 10, 'g')],
  steps: ['Sauté diced onion and garlic in olive oil until soft.', {
    instruction: 'Add tomatoes and broth, then simmer.',
    timerSeconds: 1200
  }, 'Blend until smooth, stir in the cream and basil.', 'Season to taste and serve warm.']
}), recipe({
  id: 'chicken-noodle-soup',
  title: 'Chicken Noodle Soup',
  description: 'A comforting classic with tender chicken, egg noodles, carrot and celery in a savory broth.',
  categoryId: 'lunch',
  imageUrl: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=1200',
  rating: 4.7,
  ratingCount: 512,
  prepTimeMinutes: 10,
  cookTimeMinutes: 35,
  difficulty: 'easy',
  servings: 4,
  mealTypes: ['lunch', 'dinner'],
  dietaryTags: ['high-protein'],
  allergens: ['gluten', 'egg'],
  ingredients: [i('chicken-breast', 300, 'g'), i('egg-noodles-dry', 150, 'g'), i('carrot', 2, 'piece'), i('celery', 2, 'piece'), i('onion', 1, 'piece'), i('chicken-broth', 1200, 'ml')],
  steps: ['Sauté diced onion, carrot and celery until softened.', {
    instruction: 'Add chicken breast and broth, simmer until chicken is cooked.',
    timerSeconds: 1200
  }, 'Remove chicken, shred it, and return to the pot with the noodles.', {
    instruction: 'Simmer until noodles are tender.',
    timerSeconds: 480
  }]
}), recipe({
  id: 'lentil-soup',
  title: 'Lentil Soup',
  description: 'Hearty red lentils simmered with carrot, onion, garlic and warming cumin.',
  categoryId: 'lunch',
  imageUrl: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=1200',
  rating: 4.5,
  ratingCount: 289,
  prepTimeMinutes: 10,
  cookTimeMinutes: 30,
  difficulty: 'easy',
  servings: 4,
  mealTypes: ['lunch', 'dinner'],
  dietaryTags: ['vegetarian', 'vegan', 'gluten-free', 'high-protein'],
  ingredients: [i('red-lentils-dry', 250, 'g'), i('carrot', 2, 'piece'), i('onion', 1, 'piece'), i('garlic', 2, 'clove'), i('vegetable-broth', 1000, 'ml'), i('cumin', 1, 'tsp'), i('olive-oil', 1, 'tbsp')],
  steps: ['Sauté onion, carrot and garlic in olive oil with cumin until fragrant.', {
    instruction: 'Add lentils and broth, then simmer until lentils are tender.',
    timerSeconds: 1500
  }, 'Blend partially for a creamy-but-textured soup, and season to taste.']
}), recipe({
  id: 'mushroom-soup',
  title: 'Mushroom Soup',
  description: 'Earthy mushrooms simmered with garlic and thyme in a rich, creamy broth.',
  categoryId: 'lunch',
  imageUrl: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=1200',
  rating: 4.5,
  ratingCount: 231,
  prepTimeMinutes: 10,
  cookTimeMinutes: 25,
  difficulty: 'easy',
  servings: 4,
  mealTypes: ['lunch', 'dinner'],
  dietaryTags: ['vegetarian'],
  allergens: ['dairy'],
  ingredients: [i('mushroom', 500, 'g'), i('onion', 1, 'piece'), i('garlic', 2, 'clove'), i('vegetable-broth', 600, 'ml'), i('heavy-cream', 100, 'ml'), i('butter', 2, 'tbsp')],
  steps: ['Sauté sliced mushrooms, onion and garlic in butter until golden.', {
    instruction: 'Add broth and simmer.',
    timerSeconds: 900
  }, 'Blend until smooth, then stir in the cream.']
}), recipe({
  id: 'pumpkin-soup',
  title: 'Pumpkin Soup',
  description: 'Velvety roasted pumpkin soup with coconut milk and a hint of nutmeg.',
  categoryId: 'lunch',
  imageUrl: 'https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?w=1200',
  rating: 4.6,
  ratingCount: 267,
  prepTimeMinutes: 15,
  cookTimeMinutes: 30,
  difficulty: 'easy',
  servings: 4,
  mealTypes: ['lunch', 'dinner'],
  dietaryTags: ['vegetarian', 'vegan', 'gluten-free'],
  ingredients: [i('pumpkin', 800, 'g'), i('onion', 1, 'piece'), i('garlic', 2, 'clove'), i('vegetable-broth', 500, 'ml'), i('coconut-milk', 200, 'ml'), i('nutmeg', 0.25, 'tsp'), i('olive-oil', 1, 'tbsp')],
  steps: ['Sauté diced onion and garlic in olive oil.', {
    instruction: 'Add cubed pumpkin and broth, simmer until tender.',
    timerSeconds: 1200
  }, 'Blend until silky smooth, then stir in coconut milk and nutmeg.']
}),
// ---------------- Pasta ----------------
recipe({
  id: 'spaghetti-bolognese',
  title: 'Spaghetti Bolognese',
  description: 'A rich, slow-simmered beef and tomato ragu tossed with spaghetti and parmesan.',
  categoryId: 'lunch',
  imageUrl: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=1200',
  rating: 4.7,
  ratingCount: 733,
  prepTimeMinutes: 10,
  cookTimeMinutes: 35,
  difficulty: 'medium',
  servings: 4,
  mealTypes: ['dinner'],
  allergens: ['gluten', 'dairy'],
  ingredients: [i('pasta-dry', 320, 'g'), i('ground-beef', 400, 'g'), i('tomato-canned', 400, 'g'), i('onion', 1, 'piece'), i('garlic', 2, 'clove'), i('parmesan-cheese', 40, 'g'), i('olive-oil', 1, 'tbsp')],
  steps: ['Sauté onion and garlic in olive oil, then brown the ground beef.', {
    instruction: 'Add tomatoes and simmer into a rich ragu.',
    timerSeconds: 1500
  }, {
    instruction: 'Cook the spaghetti in salted boiling water until al dente.',
    timerSeconds: 600
  }, 'Toss the pasta with the ragu and finish with grated parmesan.']
}), recipe({
  id: 'chicken-alfredo-pasta',
  title: 'Chicken Alfredo Pasta',
  description: 'Fettuccine tossed in a silky garlic-parmesan cream sauce with seared chicken.',
  categoryId: 'lunch',
  imageUrl: 'https://images.unsplash.com/photo-1645112411341-6c4fd023714a?w=1200',
  rating: 4.6,
  ratingCount: 588,
  prepTimeMinutes: 10,
  cookTimeMinutes: 20,
  difficulty: 'medium',
  servings: 4,
  mealTypes: ['dinner'],
  dietaryTags: ['high-protein'],
  allergens: ['gluten', 'dairy'],
  ingredients: [i('pasta-dry', 320, 'g'), i('chicken-breast', 300, 'g'), i('heavy-cream', 250, 'ml'), i('parmesan-cheese', 60, 'g'), i('garlic', 2, 'clove'), i('butter', 2, 'tbsp')],
  steps: [{
    instruction: 'Cook the pasta in salted boiling water until al dente.',
    timerSeconds: 600
  }, {
    instruction: 'Sear the chicken until cooked through, then slice.',
    timerSeconds: 480
  }, 'Melt butter with garlic, add cream and parmesan, and simmer into a sauce.', 'Toss the pasta and chicken through the sauce.']
}), recipe({
  id: 'pesto-pasta',
  title: 'Pesto Pasta',
  description: 'A vibrant basil-pine nut pesto tossed with pasta and burst cherry tomatoes.',
  categoryId: 'lunch',
  imageUrl: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=1200',
  rating: 4.5,
  ratingCount: 402,
  prepTimeMinutes: 10,
  cookTimeMinutes: 12,
  difficulty: 'easy',
  servings: 4,
  mealTypes: ['dinner', 'lunch'],
  dietaryTags: ['vegetarian', 'quick-easy'],
  allergens: ['gluten', 'dairy', 'tree nuts'],
  ingredients: [i('pasta-dry', 320, 'g'), i('basil', 40, 'g'), i('pine-nuts', 30, 'g'), i('parmesan-cheese', 40, 'g'), i('garlic', 1, 'clove'), i('olive-oil', 4, 'tbsp'), i('cherry-tomato', 150, 'g')],
  steps: [{
    instruction: 'Cook the pasta in salted boiling water until al dente.',
    timerSeconds: 600
  }, 'Blend basil, pine nuts, parmesan, garlic and olive oil into a smooth pesto.', 'Toss the pasta with pesto and halved cherry tomatoes.']
}), recipe({
  id: 'shrimp-garlic-pasta',
  title: 'Shrimp Garlic Pasta',
  description: 'Linguine tossed with garlicky shrimp, chili flakes and a bright squeeze of lemon.',
  categoryId: 'dinner',
  imageUrl: 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=1200',
  rating: 4.6,
  ratingCount: 356,
  prepTimeMinutes: 10,
  cookTimeMinutes: 15,
  difficulty: 'medium',
  servings: 4,
  mealTypes: ['dinner'],
  dietaryTags: ['high-protein', 'quick-easy'],
  allergens: ['gluten', 'shellfish'],
  ingredients: [i('pasta-dry', 320, 'g'), i('shrimp', 400, 'g'), i('garlic', 4, 'clove'), i('olive-oil', 3, 'tbsp'), i('chili-flakes', 0.5, 'tsp'), i('parsley', 10, 'g'), i('lemon', 1, 'piece')],
  steps: [{
    instruction: 'Cook the pasta in salted boiling water until al dente.',
    timerSeconds: 600
  }, {
    instruction: 'Sauté garlic and chili flakes in olive oil, add shrimp and cook through.',
    timerSeconds: 240
  }, 'Toss the pasta with the shrimp, parsley and a squeeze of lemon.']
}), recipe({
  id: 'spinach-ricotta-pasta',
  title: 'Spinach Ricotta Pasta',
  description: 'Pasta tossed with wilted spinach, creamy ricotta and shaved parmesan.',
  categoryId: 'dinner',
  imageUrl: 'https://images.unsplash.com/photo-1611270629569-8b357cb88da9?w=1200',
  rating: 4.4,
  ratingCount: 198,
  prepTimeMinutes: 10,
  cookTimeMinutes: 15,
  difficulty: 'easy',
  servings: 4,
  mealTypes: ['dinner', 'lunch'],
  dietaryTags: ['vegetarian'],
  allergens: ['gluten', 'dairy'],
  ingredients: [i('pasta-dry', 320, 'g'), i('ricotta-cheese', 250, 'g'), i('spinach', 3, 'cup'), i('garlic', 2, 'clove'), i('olive-oil', 2, 'tbsp'), i('parmesan-cheese', 30, 'g')],
  steps: [{
    instruction: 'Cook the pasta in salted boiling water until al dente.',
    timerSeconds: 600
  }, 'Sauté garlic in olive oil, wilt in the spinach.', 'Stir in ricotta and a splash of pasta water to loosen, then toss with pasta and parmesan.']
}),
// ---------------- Main Dishes ----------------
recipe({
  id: 'grilled-chicken-with-rice',
  title: 'Grilled Chicken with Rice',
  description: 'Juicy grilled chicken breast with steamed broccoli and lemon-garlic rice.',
  categoryId: 'lunch',
  imageUrl: 'https://images.unsplash.com/photo-1598515213692-5f252f1c3e0d?w=1200',
  rating: 4.6,
  ratingCount: 512,
  prepTimeMinutes: 10,
  cookTimeMinutes: 25,
  difficulty: 'easy',
  servings: 2,
  mealTypes: ['lunch', 'dinner'],
  dietaryTags: ['high-protein', 'gluten-free'],
  ingredients: [i('chicken-breast', 300, 'g'), i('white-rice-dry', 0.5, 'cup'), i('broccoli', 200, 'g'), i('olive-oil', 1, 'tbsp'), i('garlic', 1, 'clove'), i('lemon', 0.5, 'piece')],
  steps: [{
    instruction: 'Cook the rice according to package instructions.',
    timerSeconds: 900
  }, {
    instruction: 'Grill the seasoned chicken breast until cooked through.',
    timerSeconds: 600
  }, {
    instruction: 'Steam the broccoli until bright green and tender.',
    timerSeconds: 300
  }, 'Fluff the rice with garlic and lemon juice, and plate everything together.']
}), recipe({
  id: 'beef-stir-fry',
  title: 'Beef Stir Fry',
  description: 'Tender beef sirloin stir-fried with bell pepper and broccoli in a savory soy-ginger sauce.',
  categoryId: 'lunch',
  imageUrl: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=1200',
  rating: 4.5,
  ratingCount: 389,
  prepTimeMinutes: 15,
  cookTimeMinutes: 12,
  difficulty: 'medium',
  servings: 2,
  mealTypes: ['dinner'],
  dietaryTags: ['high-protein'],
  allergens: ['soy'],
  ingredients: [i('beef-sirloin', 300, 'g'), i('bell-pepper', 1, 'piece'), i('broccoli', 150, 'g'), i('soy-sauce', 2, 'tbsp'), i('garlic', 2, 'clove'), i('ginger', 10, 'g'), i('sesame-oil', 1, 'tsp'), i('white-rice-dry', 0.5, 'cup')],
  steps: [{
    instruction: 'Cook the rice according to package instructions.',
    timerSeconds: 900
  }, 'Slice the beef thinly and marinate briefly in soy sauce.', {
    instruction: 'Stir-fry beef in sesame oil until browned, then set aside.',
    timerSeconds: 180
  }, {
    instruction: 'Stir-fry garlic, ginger, bell pepper and broccoli until crisp-tender.',
    timerSeconds: 240
  }, 'Return the beef to the pan, toss together and serve over rice.']
}), recipe({
  id: 'chicken-curry',
  title: 'Chicken Curry',
  description: 'Tender chicken thigh simmered in a fragrant coconut curry sauce.',
  categoryId: 'lunch',
  imageUrl: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=1200',
  rating: 4.7,
  ratingCount: 601,
  prepTimeMinutes: 15,
  cookTimeMinutes: 30,
  difficulty: 'medium',
  servings: 4,
  mealTypes: ['dinner'],
  dietaryTags: ['gluten-free'],
  ingredients: [i('chicken-thigh', 500, 'g'), i('coconut-milk', 400, 'ml'), i('onion', 1, 'piece'), i('garlic', 3, 'clove'), i('ginger', 15, 'g'), i('curry-powder', 2, 'tbsp'), i('tomato-canned', 200, 'g'), i('white-rice-dry', 1, 'cup')],
  steps: [{
    instruction: 'Cook the rice according to package instructions.',
    timerSeconds: 900
  }, 'Sauté onion, garlic and ginger until fragrant, then stir in curry powder.', 'Add chicken thigh pieces and brown lightly.', {
    instruction: 'Pour in coconut milk and tomatoes, then simmer until chicken is tender.',
    timerSeconds: 1200
  }, 'Serve over rice.']
}), recipe({
  id: 'stuffed-bell-peppers',
  title: 'Stuffed Bell Peppers',
  description: 'Bell peppers filled with seasoned ground beef, rice and tomato, baked until tender.',
  categoryId: 'dinner',
  imageUrl: 'https://images.unsplash.com/photo-1600335895229-6e75511892c8?w=1200',
  rating: 4.4,
  ratingCount: 276,
  prepTimeMinutes: 15,
  cookTimeMinutes: 35,
  difficulty: 'medium',
  servings: 4,
  mealTypes: ['dinner'],
  dietaryTags: ['high-protein', 'gluten-free'],
  allergens: ['dairy'],
  ingredients: [i('bell-pepper', 4, 'piece'), i('ground-beef', 400, 'g', ['ground-turkey']), i('white-rice-dry', 0.5, 'cup'), i('tomato-canned', 200, 'g'), i('onion', 1, 'piece'), i('cheddar-cheese', 60, 'g')],
  steps: [{
    instruction: 'Cook the rice according to package instructions.',
    timerSeconds: 900
  }, 'Slice the tops off the bell peppers and remove seeds.', 'Brown the ground beef with onion, then stir in rice and half the tomatoes.', 'Fill the peppers with the mixture, top with remaining tomato and cheddar.', {
    instruction: 'Bake at 190°C (375°F) until peppers are tender.',
    timerSeconds: 1800
  }]
}), recipe({
  id: 'turkey-meatballs',
  title: 'Turkey Meatballs',
  description: 'Lean turkey meatballs simmered in tomato sauce, finished with parmesan and parsley.',
  categoryId: 'dinner',
  imageUrl: 'https://images.unsplash.com/photo-1529042410759-befb1204b468?w=1200',
  rating: 4.5,
  ratingCount: 334,
  prepTimeMinutes: 15,
  cookTimeMinutes: 25,
  difficulty: 'medium',
  servings: 4,
  mealTypes: ['dinner'],
  dietaryTags: ['high-protein'],
  allergens: ['gluten', 'egg', 'dairy'],
  ingredients: [i('ground-turkey', 500, 'g'), i('breadcrumbs', 50, 'g'), i('egg', 1, 'piece'), i('parmesan-cheese', 30, 'g'), i('garlic', 2, 'clove'), i('tomato-sauce', 400, 'g'), i('parsley', 10, 'g')],
  steps: ['Combine turkey, breadcrumbs, egg, parmesan and minced garlic; form into meatballs.', {
    instruction: 'Sear the meatballs on all sides.',
    timerSeconds: 300
  }, {
    instruction: 'Add tomato sauce and simmer until meatballs are cooked through.',
    timerSeconds: 900
  }, 'Finish with chopped parsley.']
}),
// ---------------- Fish ----------------
recipe({
  id: 'grilled-salmon',
  title: 'Grilled Salmon',
  description: 'Simply grilled salmon fillet with garlic, lemon and roasted asparagus.',
  categoryId: 'lunch',
  imageUrl: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=1200',
  rating: 4.8,
  ratingCount: 622,
  prepTimeMinutes: 10,
  cookTimeMinutes: 15,
  difficulty: 'easy',
  servings: 2,
  mealTypes: ['dinner'],
  dietaryTags: ['high-protein', 'low-carb', 'gluten-free', 'pescatarian'],
  allergens: ['fish'],
  ingredients: [i('salmon-fillet', 300, 'g'), i('olive-oil', 1, 'tbsp'), i('lemon', 1, 'piece'), i('garlic', 2, 'clove'), i('asparagus', 200, 'g')],
  steps: ['Season the salmon with salt, pepper and minced garlic.', {
    instruction: 'Grill salmon skin-side down until just cooked through.',
    timerSeconds: 480
  }, {
    instruction: 'Roast the asparagus with olive oil until tender.',
    timerSeconds: 600
  }, 'Serve with a squeeze of fresh lemon.']
}), recipe({
  id: 'baked-cod',
  title: 'Baked Cod',
  description: 'Flaky cod fillet baked under a crisp garlic-parsley breadcrumb crust.',
  categoryId: 'dinner',
  imageUrl: 'https://images.unsplash.com/photo-1580476262798-bddd9f4b7369?w=1200',
  rating: 4.5,
  ratingCount: 287,
  prepTimeMinutes: 10,
  cookTimeMinutes: 18,
  difficulty: 'easy',
  servings: 2,
  mealTypes: ['dinner'],
  dietaryTags: ['high-protein', 'pescatarian'],
  allergens: ['fish', 'gluten'],
  ingredients: [i('cod-fillet', 300, 'g'), i('olive-oil', 1, 'tbsp'), i('lemon', 1, 'piece'), i('breadcrumbs', 40, 'g'), i('parsley', 5, 'g'), i('garlic', 1, 'clove')],
  steps: ['Mix breadcrumbs with olive oil, minced garlic and chopped parsley.', 'Pat the cod dry and press the breadcrumb mixture on top.', {
    instruction: 'Bake at 200°C (400°F) until fish flakes easily.',
    timerSeconds: 1080
  }, 'Serve with a wedge of lemon.']
}), recipe({
  id: 'tuna-steak',
  title: 'Tuna Steak',
  description: 'Seared sesame-crusted tuna steak with a soy-sesame glaze.',
  categoryId: 'lunch',
  imageUrl: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=1200',
  rating: 4.6,
  ratingCount: 198,
  prepTimeMinutes: 10,
  cookTimeMinutes: 6,
  difficulty: 'medium',
  servings: 2,
  mealTypes: ['dinner'],
  dietaryTags: ['high-protein', 'low-carb', 'pescatarian'],
  allergens: ['fish', 'sesame', 'soy'],
  ingredients: [i('tuna-steak', 300, 'g'), i('sesame-oil', 1, 'tsp'), i('soy-sauce', 2, 'tbsp'), i('sesame-seeds', 15, 'g'), i('spring-onion', 15, 'g')],
  steps: ['Press sesame seeds onto both sides of the tuna steak.', {
    instruction: 'Sear in sesame oil for a rare-medium center.',
    timerSeconds: 180
  }, 'Slice thinly, drizzle with soy sauce and top with spring onion.']
}), recipe({
  id: 'garlic-butter-shrimp',
  title: 'Garlic Butter Shrimp',
  description: 'Juicy shrimp sautéed in garlic butter with lemon, parsley and a kick of chili.',
  categoryId: 'lunch',
  imageUrl: 'https://images.unsplash.com/photo-1625943913492-5b7f2c8b0e6a?w=1200',
  rating: 4.7,
  ratingCount: 344,
  prepTimeMinutes: 10,
  cookTimeMinutes: 8,
  difficulty: 'easy',
  servings: 2,
  mealTypes: ['dinner'],
  dietaryTags: ['high-protein', 'low-carb', 'gluten-free'],
  allergens: ['shellfish', 'dairy'],
  ingredients: [i('shrimp', 350, 'g'), i('butter', 2, 'tbsp'), i('garlic', 3, 'clove'), i('lemon', 0.5, 'piece'), i('parsley', 10, 'g'), i('chili-flakes', 0.25, 'tsp')],
  steps: ['Melt butter in a pan and sauté garlic and chili flakes until fragrant.', {
    instruction: 'Add shrimp and cook until pink and opaque.',
    timerSeconds: 240
  }, 'Finish with a squeeze of lemon and chopped parsley.']
}), recipe({
  id: 'fish-tacos',
  title: 'Fish Tacos',
  description: 'Flaky baked cod in warm corn tortillas with crunchy cabbage slaw and lime crema.',
  categoryId: 'dinner',
  imageUrl: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=1200',
  rating: 4.6,
  ratingCount: 276,
  prepTimeMinutes: 15,
  cookTimeMinutes: 15,
  difficulty: 'medium',
  servings: 3,
  mealTypes: ['lunch', 'dinner'],
  dietaryTags: ['pescatarian'],
  allergens: ['fish', 'dairy'],
  ingredients: [i('cod-fillet', 350, 'g'), i('corn-tortilla', 6, 'piece'), i('cabbage', 150, 'g'), i('lime', 1, 'piece'), i('sour-cream', 60, 'g'), i('avocado', 1, 'piece'), i('cilantro', 10, 'g')],
  steps: [{
    instruction: 'Season and bake the cod until flaky.',
    timerSeconds: 900
  }, 'Toss shredded cabbage with lime juice for a quick slaw.', 'Warm the tortillas, then flake the fish into them.', 'Top with slaw, avocado slices, sour cream and cilantro.']
}),
// ---------------- Vegetarian ----------------
recipe({
  id: 'vegetable-stir-fry',
  title: 'Vegetable Stir Fry',
  description: 'A colorful mix of crisp vegetables and tofu tossed in a savory garlic-ginger sauce.',
  categoryId: 'lunch',
  imageUrl: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=1200',
  rating: 4.4,
  ratingCount: 221,
  prepTimeMinutes: 15,
  cookTimeMinutes: 10,
  difficulty: 'easy',
  servings: 2,
  mealTypes: ['dinner', 'lunch'],
  dietaryTags: ['vegetarian', 'vegan', 'quick-easy'],
  allergens: ['soy'],
  ingredients: [i('bell-pepper', 1, 'piece'), i('broccoli', 150, 'g'), i('carrot', 1, 'piece'), i('soy-sauce', 2, 'tbsp'), i('garlic', 2, 'clove'), i('ginger', 10, 'g'), i('sesame-oil', 1, 'tsp'), i('white-rice-dry', 0.5, 'cup')],
  steps: [{
    instruction: 'Cook the rice according to package instructions.',
    timerSeconds: 900
  }, {
    instruction: 'Stir-fry garlic, ginger and vegetables in sesame oil until crisp-tender.',
    timerSeconds: 300
  }, 'Toss with soy sauce and serve over rice.']
}), recipe({
  id: 'stuffed-portobello-mushrooms',
  title: 'Stuffed Portobello Mushrooms',
  description: 'Portobello caps filled with garlicky spinach, feta and breadcrumbs, baked until golden.',
  categoryId: 'dinner',
  imageUrl: 'https://images.unsplash.com/photo-1541591425126-4e6cc0a4d40a?w=1200',
  rating: 4.4,
  ratingCount: 156,
  prepTimeMinutes: 15,
  cookTimeMinutes: 20,
  difficulty: 'easy',
  servings: 2,
  mealTypes: ['dinner'],
  dietaryTags: ['vegetarian', 'low-carb'],
  allergens: ['dairy', 'gluten'],
  ingredients: [i('portobello-mushroom', 4, 'piece'), i('spinach', 2, 'cup'), i('feta-cheese', 60, 'g'), i('breadcrumbs', 30, 'g'), i('garlic', 2, 'clove'), i('olive-oil', 1, 'tbsp')],
  steps: ['Remove mushroom stems and brush caps with olive oil.', 'Sauté garlic and spinach until wilted, then mix with feta and breadcrumbs.', 'Fill the mushroom caps with the mixture.', {
    instruction: 'Bake at 200°C (400°F) until golden.',
    timerSeconds: 1080
  }]
}),
// ---------------- Sandwiches ----------------
recipe({
  id: 'turkey-club-sandwich',
  title: 'Turkey Club Sandwich',
  description: 'A triple-decker classic with turkey breast, crispy bacon, lettuce and tomato.',
  categoryId: 'lunch',
  imageUrl: 'https://images.unsplash.com/photo-1481070555726-e2fe8357725c?w=1200',
  rating: 4.5,
  ratingCount: 267,
  prepTimeMinutes: 10,
  cookTimeMinutes: 8,
  difficulty: 'easy',
  servings: 1,
  mealTypes: ['lunch'],
  dietaryTags: ['high-protein'],
  allergens: ['gluten', 'egg'],
  ingredients: [i('bread', 3, 'slice'), i('turkey-breast', 100, 'g'), i('bacon', 2, 'slice'), i('romaine-lettuce', 20, 'g'), i('tomato', 0.5, 'piece'), i('mayonnaise', 1, 'tbsp')],
  steps: [{
    instruction: 'Cook the bacon until crisp.',
    timerSeconds: 300
  }, 'Toast the bread slices.', 'Layer turkey, bacon, lettuce and tomato between the bread with mayonnaise.']
}), recipe({
  id: 'caprese-panini',
  title: 'Caprese Panini',
  description: 'A grilled panini with fresh mozzarella, tomato and basil.',
  categoryId: 'lunch',
  imageUrl: 'https://images.unsplash.com/photo-1528736235302-52922df5c122?w=1200',
  rating: 4.4,
  ratingCount: 178,
  prepTimeMinutes: 8,
  cookTimeMinutes: 6,
  difficulty: 'easy',
  servings: 1,
  mealTypes: ['lunch'],
  dietaryTags: ['vegetarian', 'quick-easy'],
  allergens: ['gluten', 'dairy'],
  ingredients: [i('bread', 2, 'slice'), i('mozzarella-fresh', 80, 'g'), i('tomato', 1, 'piece'), i('basil', 5, 'g'), i('olive-oil', 1, 'tsp')],
  steps: ['Layer mozzarella, tomato slices and basil between the bread.', 'Brush the outside with olive oil.', {
    instruction: 'Grill in a panini press until golden and the cheese melts.',
    timerSeconds: 240
  }]
}),
// ---------------- Appetizers ----------------
recipe({
  id: 'bruschetta',
  title: 'Bruschetta',
  description: 'Toasted baguette topped with a fresh tomato, basil and garlic mixture.',
  categoryId: 'snack',
  imageUrl: 'https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=1200',
  rating: 4.6,
  ratingCount: 312,
  prepTimeMinutes: 10,
  cookTimeMinutes: 5,
  difficulty: 'easy',
  servings: 4,
  mealTypes: ['snack'],
  dietaryTags: ['vegetarian', 'vegan', 'quick-easy'],
  allergens: ['gluten'],
  ingredients: [i('baguette', 8, 'slice'), i('tomato', 3, 'piece'), i('basil', 10, 'g'), i('garlic', 1, 'clove'), i('olive-oil', 2, 'tbsp')],
  steps: [{
    instruction: 'Toast the baguette slices until crisp.',
    timerSeconds: 240
  }, 'Dice the tomatoes and mix with chopped basil, minced garlic and olive oil.', 'Rub each toast with garlic and spoon the tomato mixture on top.']
}), recipe({
  id: 'stuffed-mushrooms',
  title: 'Stuffed Mushrooms',
  description: 'Bite-sized mushrooms filled with a creamy garlic-parmesan filling.',
  categoryId: 'snack',
  imageUrl: 'https://images.unsplash.com/photo-1541529086526-db283c563270?w=1200',
  rating: 4.4,
  ratingCount: 189,
  prepTimeMinutes: 15,
  cookTimeMinutes: 20,
  difficulty: 'easy',
  servings: 4,
  mealTypes: ['snack'],
  dietaryTags: ['vegetarian'],
  allergens: ['dairy', 'gluten'],
  ingredients: [i('mushroom', 400, 'g'), i('cream-cheese', 4, 'tbsp'), i('garlic', 2, 'clove'), i('breadcrumbs', 30, 'g'), i('parmesan-cheese', 30, 'g')],
  steps: ['Remove mushroom stems and finely chop them.', 'Mix chopped stems with cream cheese, garlic, breadcrumbs and parmesan.', 'Fill the mushroom caps with the mixture.', {
    instruction: 'Bake at 190°C (375°F) until golden.',
    timerSeconds: 1080
  }]
}),
// ---------------- Desserts ----------------
recipe({
  id: 'greek-yogurt-berry-parfait',
  title: 'Greek Yogurt Berry Parfait',
  description: 'Layers of Greek yogurt, mixed berries, honey and granola in a glass.',
  categoryId: 'snack',
  imageUrl: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=1200',
  rating: 4.5,
  ratingCount: 201,
  prepTimeMinutes: 5,
  cookTimeMinutes: 0,
  difficulty: 'easy',
  servings: 1,
  mealTypes: ['snack'],
  dietaryTags: ['vegetarian', 'high-protein', 'quick-easy'],
  allergens: ['dairy', 'gluten'],
  ingredients: [i('greek-yogurt', 200, 'g'), i('mixed-berries', 1, 'cup'), i('honey', 1, 'tbsp'), i('granola', 0.25, 'cup')],
  steps: ['Layer yogurt, berries and granola in a glass, repeating twice.', 'Finish with a drizzle of honey on top.']
}), recipe({
  id: 'dark-chocolate-energy-bites',
  title: 'Dark Chocolate Energy Bites',
  description: 'No-bake bites of oats, peanut butter, dark chocolate and chia seeds.',
  categoryId: 'snack',
  imageUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=1200',
  rating: 4.5,
  ratingCount: 244,
  prepTimeMinutes: 15,
  cookTimeMinutes: 0,
  difficulty: 'easy',
  servings: 10,
  mealTypes: ['snack'],
  dietaryTags: ['vegetarian'],
  allergens: ['peanuts', 'gluten'],
  ingredients: [i('rolled-oats', 1, 'cup'), i('peanut-butter', 4, 'tbsp'), i('dark-chocolate', 50, 'g'), i('honey', 3, 'tbsp'), i('chia-seeds', 2, 'tbsp')],
  steps: ['Chop the dark chocolate into small chunks.', 'Mix oats, peanut butter, honey and chia seeds until well combined, then fold in chocolate.', {
    instruction: 'Roll into balls and chill until firm.',
    timerSeconds: 1800
  }]
}),
// ---------------- Bread & Baking ----------------
recipe({
  id: 'whole-wheat-banana-bread',
  title: 'Whole Wheat Banana Bread',
  description: 'A moist, lightly sweet banana bread studded with walnuts.',
  categoryId: 'snack',
  imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1200',
  rating: 4.6,
  ratingCount: 356,
  prepTimeMinutes: 15,
  cookTimeMinutes: 55,
  difficulty: 'medium',
  servings: 10,
  mealTypes: ['breakfast', 'snack'],
  dietaryTags: ['vegetarian'],
  allergens: ['gluten', 'egg', 'dairy', 'tree nuts'],
  ingredients: [i('flour', 250, 'g'), i('banana', 3, 'piece'), i('egg', 2, 'piece'), i('honey', 4, 'tbsp'), i('walnuts', 60, 'g'), i('baking-powder', 1.5, 'tsp'), i('butter', 60, 'g')],
  steps: ['Mash the bananas and mix with melted butter, honey and eggs.', 'Fold in flour and baking powder until just combined, then stir in walnuts.', 'Pour into a greased loaf pan.', {
    instruction: 'Bake at 175°C (350°F) until a toothpick comes out clean.',
    timerSeconds: 3300
  }]
}), recipe({
  id: 'blueberry-muffins',
  title: 'Blueberry Muffins',
  description: 'Bakery-style muffins bursting with juicy blueberries.',
  categoryId: 'snack',
  imageUrl: 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=1200',
  rating: 4.6,
  ratingCount: 298,
  prepTimeMinutes: 15,
  cookTimeMinutes: 22,
  difficulty: 'medium',
  servings: 12,
  mealTypes: ['breakfast', 'snack'],
  dietaryTags: ['vegetarian'],
  allergens: ['gluten', 'egg', 'dairy'],
  ingredients: [i('flour', 300, 'g'), i('blueberry', 1.5, 'cup'), i('egg', 2, 'piece'), i('milk', 200, 'ml'), i('honey', 4, 'tbsp'), i('baking-powder', 2, 'tsp'), i('butter', 80, 'g')],
  steps: ['Whisk melted butter, honey, eggs and milk together.', 'Fold in flour and baking powder, then gently fold in blueberries.', 'Divide batter among muffin cups.', {
    instruction: 'Bake at 190°C (375°F) until golden and springy.',
    timerSeconds: 1320
  }]
}),
// ---------------- Smoothies ----------------
recipe({
  id: 'berry-protein-smoothie',
  title: 'Berry Protein Smoothie',
  description: 'A thick, protein-packed smoothie with mixed berries, banana and Greek yogurt.',
  categoryId: 'snack',
  imageUrl: 'https://images.unsplash.com/photo-1502741338009-cac2772e18bc?w=1200',
  rating: 4.6,
  ratingCount: 389,
  prepTimeMinutes: 5,
  cookTimeMinutes: 0,
  difficulty: 'easy',
  servings: 1,
  mealTypes: ['breakfast', 'snack'],
  dietaryTags: ['vegetarian', 'high-protein', 'quick-easy'],
  allergens: ['dairy'],
  ingredients: [i('mixed-berries', 1, 'cup'), i('banana', 1, 'piece'), i('greek-yogurt', 150, 'g'), i('milk', 150, 'ml'), i('honey', 1, 'tbsp')],
  steps: ['Add all ingredients to a blender.', 'Blend until smooth and creamy.', 'Pour into a glass and serve chilled.']
}), recipe({
  id: 'green-detox-smoothie',
  title: 'Green Detox Smoothie',
  description: 'A refreshing blend of spinach, banana, apple and chia seeds.',
  categoryId: 'snack',
  imageUrl: 'https://images.unsplash.com/photo-1610970881699-44a5587cabec?w=1200',
  rating: 4.3,
  ratingCount: 212,
  prepTimeMinutes: 5,
  cookTimeMinutes: 0,
  difficulty: 'easy',
  servings: 1,
  mealTypes: ['breakfast', 'snack'],
  dietaryTags: ['vegetarian', 'vegan', 'quick-easy', 'gluten-free'],
  ingredients: [i('spinach', 2, 'cup'), i('banana', 1, 'piece'), i('apple', 1, 'piece'), i('almond-milk', 200, 'ml'), i('chia-seeds', 1, 'tbsp')],
  steps: ['Add all ingredients to a blender.', 'Blend until smooth.', 'Pour into a glass and enjoy immediately.']
}),
// ---------------- Drinks ----------------
recipe({
  id: 'iced-matcha-latte',
  title: 'Iced Matcha Latte',
  description: 'Whisked ceremonial matcha over ice with cold milk and a touch of honey.',
  categoryId: 'snack',
  imageUrl: 'https://images.unsplash.com/photo-1515823064-d6e0c04616a7?w=1200',
  rating: 4.5,
  ratingCount: 233,
  prepTimeMinutes: 5,
  cookTimeMinutes: 0,
  difficulty: 'easy',
  servings: 1,
  mealTypes: ['snack'],
  dietaryTags: ['vegetarian', 'quick-easy'],
  allergens: ['dairy'],
  ingredients: [i('matcha-powder', 1, 'tsp'), i('milk', 200, 'ml', ['almond-milk']), i('honey', 1, 'tsp')],
  steps: ['Whisk matcha powder with a splash of hot water until frothy.', 'Fill a glass with ice, pour in milk, then top with the matcha and honey.']
}), recipe({
  id: 'mango-lassi',
  title: 'Mango Lassi',
  description: 'A creamy, chilled Indian-style yogurt drink blended with sweet ripe mango.',
  categoryId: 'snack',
  imageUrl: 'https://images.unsplash.com/photo-1546173159-315724a31696?w=1200',
  rating: 4.6,
  ratingCount: 267,
  prepTimeMinutes: 5,
  cookTimeMinutes: 0,
  difficulty: 'easy',
  servings: 1,
  mealTypes: ['snack'],
  dietaryTags: ['vegetarian', 'quick-easy', 'gluten-free'],
  allergens: ['dairy'],
  ingredients: [i('mango', 1, 'piece'), i('greek-yogurt', 150, 'g'), i('milk', 100, 'ml'), i('honey', 1, 'tsp')],
  steps: ['Add all ingredients to a blender.', 'Blend until smooth and frothy.', 'Serve chilled over ice.']
})];
const RECIPE_INDEX = new Map(RECIPES.map(item => [item.id, item]));
export function getRecipeById(id) {
  return RECIPE_INDEX.get(id) ?? myRecipesStore.getById(id);
}
