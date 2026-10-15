// The backend doesn't send a photo per ingredient (`image_url` is always empty
// in practice), so the ingredients list falls back to a representative photo
// picked from the ingredient's name. Order matters — more specific buckets
// (e.g. nuts, so "peanut butter" doesn't land on dairy's "butter") are checked
// before broader ones. Word lists mix English with common Russian terms since
// ingredient names can arrive in either language depending on locale.
const BUCKETS = [
  {
    key: 'poultry',
    image: 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=200',
    words: ['chicken', 'turkey', 'duck', 'poultry', 'курица', 'куриная', 'куриное', 'индейка', 'утка']
  },
  {
    key: 'seafood',
    image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=200',
    words: ['salmon', 'tuna', 'cod', 'shrimp', 'fish', 'seafood', 'anchovy', 'sardine', 'crab', 'lobster', 'mackerel', 'рыба', 'лосось', 'тунец', 'креветк', 'треска', 'семга']
  },
  {
    key: 'redMeat',
    image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=200',
    words: ['beef', 'pork', 'bacon', 'ham', 'sausage', 'lamb', 'steak', 'veal', 'sirloin', 'говядина', 'свинина', 'бекон', 'ветчина', 'колбаса', 'баранина', 'стейк']
  },
  {
    key: 'egg',
    image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=200',
    words: ['egg', 'яйцо', 'яйца', 'яичн']
  },
  {
    key: 'nuts',
    image: 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=200',
    words: ['peanut butter', 'walnut', 'almond', 'cashew', 'pistachio', 'pine nut', 'chia seed', 'sesame seed', 'nut', 'nuts', 'seed', 'орех', 'миндаль', 'фундук', 'кешью', 'фисташк', 'семечки', 'семена', 'кунжут', 'арахис']
  },
  {
    key: 'dairy',
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=200',
    words: ['milk', 'cream', 'yogurt', 'yoghurt', 'buttermilk', 'butter', 'молоко', 'сливки', 'йогурт', 'сметана']
  },
  {
    key: 'cheese',
    image: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=200',
    words: ['cheese', 'mozzarella', 'feta', 'parmesan', 'cheddar', 'ricotta', 'brie', 'gouda', 'сыр']
  },
  {
    key: 'bakery',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=200',
    words: ['bread', 'baguette', 'bagel', 'muffin', 'tortilla', 'wrap', 'croissant', 'bun', 'pita', 'sourdough', 'хлеб', 'багет', 'булочк', 'лаваш']
  },
  {
    key: 'grains',
    image: 'https://images.unsplash.com/photo-1516684732162-798a0062be99?w=200',
    words: ['rice', 'pasta', 'oats', 'oatmeal', 'quinoa', 'noodle', 'breadcrumb', 'flour', 'granola', 'crouton', 'barley', 'couscous', 'buckwheat', 'cereal', 'рис', 'паста', 'макарон', 'овсян', 'овёс', 'киноа', 'лапша', 'мука', 'гранола', 'гречк']
  },
  {
    key: 'legumes',
    image: 'https://images.unsplash.com/photo-1515543904379-3d757afe72e4?w=200',
    words: ['chickpea', 'lentil', 'soybean', 'edamame', 'bean', 'нут', 'чечевиц', 'фасол', 'бобы', 'горох']
  },
  {
    key: 'oils',
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=200',
    words: ['olive oil', 'sesame oil', 'vegetable oil', 'vinegar', 'mayonnaise', 'mayo', 'soy sauce', 'dressing', 'ketchup', 'mustard', 'масло', 'уксус', 'майонез', 'соус', 'кетчуп', 'горчиц']
  },
  {
    key: 'spices',
    image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=200',
    words: ['cumin', 'cinnamon', 'nutmeg', 'curry', 'chili flakes', 'chili powder', 'paprika', 'baking powder', 'baking soda', 'vanilla', 'turmeric', 'matcha', 'cayenne', 'специ', 'корица', 'тмин', 'карри', 'паприка', 'разрыхлит', 'ваниль', 'куркум']
  },
  {
    key: 'pantry',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200',
    words: ['broth', 'stock', 'canned tomato', 'tomato sauce', 'coconut milk', 'honey', 'chocolate', 'jam', 'syrup', 'бульон', 'мёд', 'мед', 'шоколад', 'варенье', 'сироп']
  },
  {
    key: 'greens',
    image: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=200',
    words: ['spinach', 'lettuce', 'basil', 'parsley', 'dill', 'cilantro', 'chive', 'spring onion', 'arugula', 'kale', 'mint', 'rosemary', 'thyme', 'sage', 'herb', 'greens', 'шпинат', 'салат', 'базилик', 'петрушк', 'укроп', 'кинза', 'зелень', 'мята', 'розмарин']
  },
  {
    key: 'berries',
    image: 'https://images.unsplash.com/photo-1498557850523-fd3d118b962e?w=200',
    words: ['berry', 'berries', 'blueberr', 'strawberr', 'raspberr', 'cranberr', 'ягод', 'черник', 'клубник', 'малин', 'клюкв']
  },
  {
    key: 'fruits',
    image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=200',
    words: ['apple', 'banana', 'mango', 'pear', 'peach', 'grape', 'orange', 'pineapple', 'melon', 'kiwi', 'plum', 'lemon', 'lime', 'яблок', 'банан', 'манго', 'груш', 'персик', 'виноград', 'апельсин', 'ананас', 'дыня', 'киви', 'слив', 'лимон', 'лайм']
  },
  {
    key: 'vegetables',
    image: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=200',
    words: ['tomato', 'onion', 'garlic', 'ginger', 'pepper', 'carrot', 'celery', 'cucumber', 'broccoli', 'asparagus', 'cabbage', 'pumpkin', 'mushroom', 'potato', 'zucchini', 'eggplant', 'corn', 'beet', 'radish', 'squash', 'caper', 'olives', 'avocado', 'томат', 'помидор', 'лук', 'чеснок', 'имбир', 'морков', 'сельдере', 'огурец', 'брокколи', 'спарж', 'капуст', 'тыкв', 'гриб', 'картоф', 'кукуруз', 'свёкл', 'свекл', 'редис', 'каперс', 'оливк', 'авокадо']
  }
];

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200';

function hasWord(name, phrase) {
  const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`\\b${escaped}`, 'i').test(name);
}

const PANTRY_BUCKET = BUCKETS.find(bucket => bucket.key === 'pantry');

function matchBucket(ingredient) {
  const name = ingredient?.name ?? '';
  // Checked first, outside bucket order: "chicken broth"/"beef stock" would
  // otherwise match the meat buckets before ever reaching pantry's own
  // "broth"/"stock" keywords — wrong for images, and would wrongly let a
  // broth be offered as a protein swap for an actual cut of meat.
  if (hasWord(name, 'broth') || hasWord(name, 'stock')) return PANTRY_BUCKET;
  return BUCKETS.find(bucket => bucket.words.some(word => hasWord(name, word)));
}

/** A representative photo for an ingredient, used only on the ingredients list screen. */
export function guessIngredientImage(ingredient) {
  if (ingredient.imageUrl) return ingredient.imageUrl;
  return matchBucket(ingredient)?.image ?? FALLBACK_IMAGE;
}

// The backend doesn't tag ingredients with a food category (categoryId/subcategoryId
// always come back as a generic fallback — see catalogAdapter's adaptIngredient), so
// this is also the only way to group ingredients for substitution-by-category. Returns
// one of the BUCKETS' `key`s above, or null if nothing matched.
export function guessIngredientCategory(ingredient) {
  return matchBucket(ingredient)?.key ?? null;
}
