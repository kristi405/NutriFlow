import { useMemo } from 'react';
import { calculateDailyTargets, calculateNutritionScore } from '@/lib/nutrition';
import { todayKey } from '@/lib/date';
import { profileStore } from '@/store/profileStore';
import { waterStore } from '@/store/waterStore';
import { useDailyNutrition } from './useDailyNutrition';
export function useNutritionScore(date = todayKey()) {
  const profile = profileStore.profile;
  const {
    total
  } = useDailyNutrition(date);
  const waterMl = waterStore.totalForDate(date);
  return useMemo(() => {
    if (!profile) return undefined;
    const targets = calculateDailyTargets(profile);
    const result = calculateNutritionScore({
      intake: total,
      targets,
      waterMl
    });
    return {
      ...result,
      targets
    };
  }, [profile, total, waterMl]);
}
