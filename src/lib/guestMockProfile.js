import { calculateDailyTargets } from '@/lib/nutrition/targets';

// A guest has no real profile — Home/Meal Plan/Progress/AI Analysis render
// their normal UI anyway (so the screen looks like the real app, not a
// locked stub) using these placeholder numbers, and only show the
// "sign in to continue" prompt once the guest actually taps into the
// screen (see GuestLockOverlay).
export const GUEST_MOCK_PROFILE = {
  name: 'Guest',
  sex: 'female',
  age: 30,
  heightCm: 170,
  weightKg: 65,
  targetWeightKg: 60,
  activityLevel: 'moderate',
  goal: { type: 'maintain-weight' },
  preferences: {
    dietaryTags: [],
    allergies: [],
    dislikedIngredientIds: [],
    favoriteCuisines: [],
    units: 'metric'
  }
};

export const GUEST_MOCK_TARGETS = calculateDailyTargets(GUEST_MOCK_PROFILE);
