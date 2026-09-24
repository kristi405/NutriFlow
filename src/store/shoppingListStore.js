import { makeAutoObservable } from 'mobx';
import { persistStore } from './persist';

// Checked ingredient ids per list scope ("today@2026-09-24", "week@2026-09-21").
// The key carries the day ("today") or the week's first day ("week"), so a new day/week starts fresh.
class ShoppingListStore {
  checked = {};
  hasHydrated = false;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
    persistStore(this, 'nutriflow.shopping-list', ['checked']);
  }

  checkedFor(scopeKey) {
    return this.checked[scopeKey] ?? [];
  }

  toggle(scopeKey, ingredientId) {
    const current = this.checkedFor(scopeKey);
    const next = current.includes(ingredientId) ? current.filter(id => id !== ingredientId) : [...current, ingredientId];
    const [kind, date] = scopeKey.split('@');
    const kept = Object.fromEntries(Object.entries(this.checked).filter(([key]) => {
      const [keyKind, keyDate] = key.split('@');
      return keyKind !== kind || keyDate >= date;
    }));
    this.checked = { ...kept, [scopeKey]: next };
  }
}

export const shoppingListStore = new ShoppingListStore();
