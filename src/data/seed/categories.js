// Unsplash photo IDs chosen per category for realistic food photography in seed data.
export const CATEGORIES = [{
  id: 'breakfast',
  name: 'Breakfast',
  imageUrl: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=800'
}, {
  id: 'brunch',
  name: 'Brunch',
  imageUrl: 'https://images.unsplash.com/photo-1533920379810-6bedac9e31f6?w=800'
}, {
  id: 'salads',
  name: 'Salads',
  imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800'
}, {
  id: 'soups',
  name: 'Soups',
  imageUrl: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800'
}, {
  id: 'pasta',
  name: 'Pasta',
  imageUrl: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800'
}, {
  id: 'main-dishes',
  name: 'Main Dishes',
  imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800'
}, {
  id: 'fish',
  name: 'Fish',
  imageUrl: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800'
}, {
  id: 'vegetarian',
  name: 'Vegetarian',
  imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800'
}, {
  id: 'sandwiches',
  name: 'Sandwiches',
  imageUrl: 'https://images.unsplash.com/photo-1481070555726-e2fe8357725c?w=800'
}, {
  id: 'appetizers',
  name: 'Appetizers',
  imageUrl: 'https://images.unsplash.com/photo-1541529086526-db283c563270?w=800'
}, {
  id: 'desserts',
  name: 'Desserts',
  imageUrl: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800'
}, {
  id: 'bread-baking',
  name: 'Bread & Baking',
  imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800'
}, {
  id: 'smoothies',
  name: 'Smoothies',
  imageUrl: 'https://images.unsplash.com/photo-1502741338009-cac2772e18bc?w=800'
}, {
  id: 'drinks',
  name: 'Drinks',
  imageUrl: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=800'
}];
const CATEGORY_INDEX = new Map(CATEGORIES.map(item => [item.id, item]));
export function getCategoryById(id) {
  return CATEGORY_INDEX.get(id);
}
