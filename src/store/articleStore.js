import { makeAutoObservable } from 'mobx';
import { apiRequest } from '@/lib/api';
import { authStore } from './authStore';
import { persistStore } from './persist';

// TEMPORARY: shown when /articles/today isn't reachable yet (no backend
// endpoint live), so the card is visible in dev before that's built.
// Remove once the real endpoint is in place.
const FALLBACK_ARTICLE = {
  id: 'fallback-1',
  title: '5 simple ways to eat more protein',
  excerpt: 'Small swaps that add up — no meal prep required.',
  body: 'Protein keeps you full longer and helps preserve muscle, especially while losing weight. A few easy ways to get more of it without overhauling your diet: add Greek yogurt to breakfast, snack on nuts or edamame instead of chips, swap regular pasta for a protein/legume-based one, keep hard-boiled eggs ready in the fridge, and finish meals with a source of lean protein like chicken, fish, tofu, or beans.',
  imageUrl: null,
  publishedAt: new Date().toISOString()
};

class ArticleStore {
  todayArticle = null;
  lastFetchedDate = null;
  hasHydrated = false;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
    persistStore(this, 'nutriflow.article', ['todayArticle', 'lastFetchedDate']);
  }

  // Only re-fetches once per calendar day — the home screen calls this on
  // every render, so this keeps it from hammering the endpoint.
  async ensureTodayArticle(dateKey) {
    if (this.lastFetchedDate === dateKey && this.todayArticle) return;
    try {
      const data = await apiRequest('/articles/today', { token: authStore.token });
      this.todayArticle = data;
      this.lastFetchedDate = dateKey;
    } catch {
      // Backend endpoint isn't live yet — fall back so the card is visible in dev.
      this.todayArticle = FALLBACK_ARTICLE;
      this.lastFetchedDate = dateKey;
    }
  }

  // Used by the detail screen when opened from something other than today's
  // card (e.g. a deep link), where the cached todayArticle won't match.
  async fetchById(id) {
    return apiRequest(`/articles/${id}`, { token: authStore.token });
  }
}

export const articleStore = new ArticleStore();
