import AsyncStorage from '@react-native-async-storage/async-storage';
import { autorun, runInAction } from 'mobx';

/** Loads `key` from AsyncStorage into `store`, then keeps it in sync on every change. */
export function persistStore(store, key, fields) {
  AsyncStorage.getItem(key).then(raw => {
    runInAction(() => {
      if (raw) {
        const saved = JSON.parse(raw);
        for (const field of fields) {
          if (field in saved) store[field] = saved[field];
        }
      }
      store.hasHydrated = true;
    });
    autorun(() => {
      const snapshot = {};
      for (const field of fields) snapshot[field] = store[field];
      AsyncStorage.setItem(key, JSON.stringify(snapshot));
    });
  });
}
