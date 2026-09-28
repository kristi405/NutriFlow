import { router } from 'expo-router';
import { subscriptionStore } from '@/store/subscriptionStore';

// Gate for actions: opens the paywall and returns false when Premium is required.
export function ensurePremium() {
  if (subscriptionStore.hasAccess) return true;
  router.push('/paywall');
  return false;
}
