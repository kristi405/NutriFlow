import { makeAutoObservable } from 'mobx';
import { persistStore } from './persist';

let nextCustomItemSeq = 0;

// Checked ingredient ids per list scope ("today@2026-09-24", "week@2026-09-21").
// The key carries the day ("today") or the week's first day ("week"), so a new day/week starts fresh.
class ShoppingListStore {
  checked = {};
  // Manually-typed items (not derived from any recipe), per the same scope
  // key as `checked` — [{ id, name }], newest last.
  customItems = {};
  hasHydrated = false;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
    persistStore(this, 'nutriflow.shopping-list', ['checked', 'customItems']);
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

  customItemsFor(scopeKey) {
    return this.customItems[scopeKey] ?? [];
  }

  addCustomItem(scopeKey, name) {
    const id = `custom-${Date.now()}-${nextCustomItemSeq++}`;
    const current = this.customItemsFor(scopeKey);
    this.customItems = { ...this.customItems, [scopeKey]: [...current, { id, name }] };
    return id;
  }

  removeCustomItem(scopeKey, id) {
    const current = this.customItemsFor(scopeKey);
    this.customItems = { ...this.customItems, [scopeKey]: current.filter(item => item.id !== id) };
  }

  // Called on account deletion, so this account's checked items don't linger
  // in memory for whoever signs in next in the same app session.
  reset() {
    this.checked = {};
    this.customItems = {};
  }
}

export const shoppingListStore = new ShoppingListStore();
