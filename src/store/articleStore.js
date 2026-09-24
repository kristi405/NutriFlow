import { makeAutoObservable, runInAction } from 'mobx';
import { adaptArticle, pickArticleOfTheDay } from '@/lib/articleAdapter';
import { apiRequest } from '@/lib/api';
import { authStore } from './authStore';
import { persistStore } from './persist';

class ArticleStore {
  todayArticle = null;
  lastFetchedDate = null;
  // Language the cached article text is in — a language switch invalidates it.
  lang = null;
  // Full list for the articles screen; kept in memory only (refetched on open).
  articles = [];
  isLoadingArticles = false;
  hasArticlesError = false;
  // Single source of truth for the heart state everywhere (list, card,
  // detail). Persisted so it's right on cold start before any fetch lands.
  favoriteIds = [];
  hasHydrated = false;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
    persistStore(this, 'nutriflow.article', ['todayArticle', 'lastFetchedDate', 'lang', 'favoriteIds']);
  }

  isFavorite(id) {
    return this.favoriteIds.includes(id);
  }

  setFavorite(id, value) {
    if (this.isFavorite(id) === value) return;
    this.favoriteIds = value ? [...this.favoriteIds, id] : this.favoriteIds.filter(favoriteId => favoriteId !== id);
  }

  // Optimistic: the heart flips immediately and is rolled back if the request fails.
  async toggleFavorite(id) {
    const wasFavorite = this.isFavorite(id);
    this.setFavorite(id, !wasFavorite);
    try {
      await apiRequest(`/app/articles/${id}/favorite`, { method: wasFavorite ? 'DELETE' : 'POST', token: authStore.token });
    } catch {
      runInAction(() => this.setFavorite(id, wasFavorite));
    }
  }

  applyArticles(rawList) {
    this.articles = rawList.map(adaptArticle);
    this.favoriteIds = this.articles.filter(article => article.isFavorite).map(article => article.id);
  }

  async loadArticles(lang) {
    this.isLoadingArticles = true;
    this.hasArticlesError = false;
    try {
      const rawList = await apiRequest(`/app/articles?lang=${lang}`, { token: authStore.token });
      runInAction(() => this.applyArticles(rawList));
    } catch {
      runInAction(() => {
        this.hasArticlesError = true;
      });
    } finally {
      runInAction(() => {
        this.isLoadingArticles = false;
      });
    }
  }

  // Only re-fetches once per calendar day (and per language) — the home
  // screen calls this on mount, so this keeps it from hammering the endpoint.
  async ensureTodayArticle(dateKey, lang) {
    if (this.lastFetchedDate === dateKey && this.lang === lang && this.todayArticle) return;
    try {
      const rawList = await apiRequest(`/app/articles?lang=${lang}`, { token: authStore.token });
      const picked = pickArticleOfTheDay(rawList, dateKey);
      if (!picked) return;
      runInAction(() => {
        this.applyArticles(rawList);
        this.todayArticle = adaptArticle(picked);
        this.lastFetchedDate = dateKey;
        this.lang = lang;
      });
    } catch {
      // Offline / request failed — keep showing whatever is cached.
    }
  }

  // Used by the detail screen when opened from something other than today's
  // card (e.g. a deep link), where the cached todayArticle won't match.
  async fetchById(id, lang) {
    const article = adaptArticle(await apiRequest(`/app/articles/${id}?lang=${lang}`, { token: authStore.token }));
    runInAction(() => this.setFavorite(article.id, article.isFavorite));
    return article;
  }
}

export const articleStore = new ArticleStore();
