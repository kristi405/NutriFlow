/**
 * Rule-based placeholder for the Phase 4 AI Nutrition Coach (§20). It only reasons
 * over the user's actual logged nutrition (via the score breakdown) and never
 * fabricates numbers — swapping in a real model later means replacing this
 * function's body, not its call sites.
 */
import i18next from '@/i18n';

const TIP_KEYS = {
  calories: 'insights.tips.calories',
  protein: 'insights.tips.protein',
  fiber: 'insights.tips.fiber',
  micronutrients: 'insights.tips.micronutrients',
  saturatedFat: 'insights.tips.saturatedFat',
  sugar: 'insights.tips.sugar',
  sodium: 'insights.tips.sodium',
  hydration: 'insights.tips.hydration'
};
class RuleBasedInsightService {
  getDailyInsight(scoreResult) {
    const entries = Object.entries(scoreResult.breakdown);
    const lowest = entries.reduce((a, b) => b[1] < a[1] ? b : a);
    if (scoreResult.score >= 90) {
      return i18next.t('insights.excellentDay');
    }
    return i18next.t(TIP_KEYS[lowest[0]]);
  }
}
export const insightService = new RuleBasedInsightService();
