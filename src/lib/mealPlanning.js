import { calculateDailyTargets } from '@/lib/nutrition';
import { peopleStore } from '@/store/peopleStore';
import { profileStore } from '@/store/profileStore';

// Calories a newly generated day should add up to. A shared menu is planned
// for the account owner and scaled per person afterwards, so it must not be
// sized for whichever family member happens to be on screen.
export function planningCalories(activeTargets) {
  if (peopleStore.shareMenu && profileStore.profile) return calculateDailyTargets(profileStore.profile).calories;
  return activeTargets.calories;
}
