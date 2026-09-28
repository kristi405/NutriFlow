import { Platform } from 'react-native';

// RevenueCat public SDK keys (`test_…` = Test Store key for development, `appl_…`/`goog_…` for
// production) — set EXPO_PUBLIC_REVENUECAT_IOS_KEY / EXPO_PUBLIC_REVENUECAT_ANDROID_KEY in .env.local.
const IOS_API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY ?? '';
const ANDROID_API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY ?? '';

// Must match the entitlement identifier configured in the RevenueCat dashboard.
export const ENTITLEMENT_ID = 'nutriflow_pro';

function currentApiKey() {
  return Platform.OS === 'android' ? ANDROID_API_KEY : IOS_API_KEY;
}

function isValidKey(key, platformPrefix) {
  return (key.startsWith(platformPrefix) || key.startsWith('test_')) && !key.includes('REPLACE');
}

// Subscriptions stay disabled until a real key replaces the placeholder, so the app
// keeps working (and never touches the native module) without RevenueCat set up.
export function isPurchasesConfigured() {
  if (Platform.OS === 'android') return isValidKey(ANDROID_API_KEY, 'goog_');
  if (Platform.OS === 'ios') return isValidKey(IOS_API_KEY, 'appl_');
  return false;
}

let sdk;

// Loaded lazily and defensively: an installed build that predates the native
// module (before the next rebuild) must not crash on import.
export function getPurchases() {
  if (sdk !== undefined) return sdk;
  try {
    sdk = require('react-native-purchases').default;
  } catch {
    sdk = null;
  }
  return sdk;
}

export function getApiKey() {
  return currentApiKey();
}
