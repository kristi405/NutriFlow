// Unsplash photo IDs chosen per category for realistic food photography in seed data.
export const CATEGORIES = [{
  id: 'breakfast',
  name: 'Breakfast',
  imageUrl: 'https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?w=800'
}, {
  id: 'lunch',
  name: 'Lunch',
  imageUrl: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800'
}, {
  id: 'dinner',
  name: 'Dinner',
  imageUrl: 'https://images.unsplash.com/photo-1529042410759-befb1204b468?w=800'
}, {
  id: 'salad',
  name: 'Salad',
  imageUrl: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=800'
}, {
  id: 'snack',
  name: 'Snack',
  imageUrl: 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=800'
}];
const CATEGORY_INDEX = new Map(CATEGORIES.map(item => [item.id, item]));
export function getCategoryById(id) {
  return CATEGORY_INDEX.get(id);
}
