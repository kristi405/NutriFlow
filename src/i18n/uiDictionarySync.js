import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiRequest } from '@/lib/api';
import i18next from './index';

// Backend-managed overlay on top of the bundled static JSON (see ./index.js).
// The static JSON stays the guaranteed baseline — this only adds/overrides
// individual keys, so a key missing here (or an offline first launch) just
// falls back to the bundled string instead of ever showing a raw key.

const CACHE_KEY_PREFIX = 'nutriflow.uiDictionary.';

function unflatten(flat) {
  const result = {};
  for (const [key, value] of Object.entries(flat)) {
    const parts = key.split('.');
    let node = result;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!node[parts[i]]) node[parts[i]] = {};
      node = node[parts[i]];
    }
    node[parts[parts.length - 1]] = value;
  }
  return result;
}

async function applyFromCache(lang) {
  try {
    const raw = await AsyncStorage.getItem(`${CACHE_KEY_PREFIX}${lang}`);
    if (!raw) return;
    i18next.addResourceBundle(lang, 'translation', unflatten(JSON.parse(raw)), true, true);
  } catch {
    // corrupt cache entry — ignore, network fetch below will refresh it
  }
}

/** Applies the cached dictionary immediately (offline-safe), then refreshes it from the server. */
export async function syncUiDictionary(lang) {
  await applyFromCache(lang);
  try {
    const flat = await apiRequest(`/app/translations?lang=${lang}`);
    if (!flat || typeof flat !== 'object') return;
    i18next.addResourceBundle(lang, 'translation', unflatten(flat), true, true);
    await AsyncStorage.setItem(`${CACHE_KEY_PREFIX}${lang}`, JSON.stringify(flat));
  } catch {
    // offline — keep whatever the cache/bundle already applied
  }
}
