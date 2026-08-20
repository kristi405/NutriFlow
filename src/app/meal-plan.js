import { useMemo, useState } from 'react';
import { SymbolView } from 'expo-symbols';
import { observer } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { DateStrip } from '@/components/home/date-strip';
import { MealRow } from '@/components/home/meal-row';
import { ThemedText } from '@/components/themed-text';
import { MacroBar } from '@/components/ui/macro-bar';
import { ScreenScrollView } from '@/components/ui/screen-scroll-view';
import { Colors, LoginButtonGreen, LoginIconBackground, Spacing } from '@/constants/theme';
import { getIngredientById } from '@/data/seed/ingredients';
import { getRecipeById } from '@/data/seed/recipes';
import { useDailyNutrition } from '@/hooks/useDailyNutrition';
import { todayKey } from '@/lib/date';
import { calculateDailyTargets, calculateRecipeNutrition, scaleForServings } from '@/lib/nutrition';
import { mealPlanStore } from '@/store/mealPlanStore';
import { profileStore } from '@/store/profileStore';

const theme = Colors.light;
const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'];
const MEAL_TYPE_ICONS = {
  breakfast: 'sunrise.fill',
  lunch: 'sun.max.fill',
  dinner: 'moon.stars.fill',
  snack: 'leaf.fill'
};

function MealPlanScreen() {
  const { t } = useTranslation();
  const [date, setDate] = useState(todayKey());
  const profile = profileStore.profile;
  const targets = useMemo(() => profile ? calculateDailyTargets(profile) : undefined, [profile]);
  const { total } = useDailyNutrition(date);
  const planItems = mealPlanStore.itemsForDate(date);

  if (!profile || !targets) return null;

  return <ScreenScrollView gap={Spacing.three}>
      <View style={styles.header}>
        <ThemedText type="title" style={styles.title} color={theme.text}>
          {t('mealPlan.title')}
        </ThemedText>
        <ThemedText type="default" color={theme.textSecondary}>
          {t('mealPlan.subtitle')}
        </ThemedText>
      </View>

      <DateStrip selectedDate={date} onSelectDate={setDate} />

      <View style={styles.progressCard}>
        <MacroBar label={t('recipes.calories')} value={total.nutrition.calories} target={targets.calories} unit={t('common.kcal')} color={theme.primary} />
      </View>

      {MEAL_TYPES.map(mealType => {
      const items = planItems.filter(item => item.mealType === mealType);
      return <View key={mealType} style={styles.mealTypeCard}>
            <View style={styles.mealTypeHeader}>
              <View style={styles.iconWrapper}>
                <SymbolView name={MEAL_TYPE_ICONS[mealType]} size={18} tintColor={LoginButtonGreen} />
              </View>
              <ThemedText type="smallBold" color={theme.text}>
                {t(`mealTypes.${mealType}`)}
              </ThemedText>
            </View>
            {items.length === 0 ? <ThemedText type="small" color={theme.textSecondary}>
                {t('mealPlan.noMealPlanned')}
              </ThemedText> : <View style={styles.mealList}>
                {items.map(item => {
              const recipe = getRecipeById(item.recipeId);
              if (!recipe) return null;
              const calories = scaleForServings(calculateRecipeNutrition(recipe, getIngredientById), item.servings).nutrition.calories;
              return <MealRow key={item.id} recipeId={item.recipeId} mealType={item.mealType} title={recipe.title} imageUrl={recipe.imageUrl} calories={calories} />;
            })}
              </View>}
          </View>;
    })}
    </ScreenScrollView>;
}

export default observer(MealPlanScreen);

const styles = StyleSheet.create({
  header: {
    gap: Spacing.half
  },
  title: {
    fontSize: 32,
    lineHeight: 38
  },
  progressCard: {
    backgroundColor: theme.background,
    borderColor: theme.border,
    borderWidth: 1,
    borderRadius: 20,
    padding: Spacing.three
  },
  mealTypeCard: {
    gap: Spacing.two,
    backgroundColor: theme.background,
    borderColor: theme.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: Spacing.three
  },
  mealTypeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: LoginIconBackground,
    alignItems: 'center',
    justifyContent: 'center'
  },
  mealList: {
    gap: Spacing.two
  }
});
