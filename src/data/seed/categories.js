// Unsplash photo IDs chosen per category for realistic food photography in seed data.
export const CATEGORIES = [{
  id: 'breakfast',
  name: 'Breakfast',
  imageUrl: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=800'
}, {
  id: 'lunch',
  name: 'Lunch',
  imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800'
}, {
  id: 'dinner',
  name: 'Dinner',
  imageUrl: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800'
}, {
  id: 'salad',
  name: 'Salad',
  imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800'
}, {
  id: 'snack',
  name: 'Snack',
  imageUrl: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800'
}];
const CATEGORY_INDEX = new Map(CATEGORIES.map(item => [item.id, item]));
export function getCategoryById(id) {
  return CATEGORY_INDEX.get(id);
}
