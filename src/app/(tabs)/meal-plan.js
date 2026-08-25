import { useMemo, useState } from 'react';
import { SymbolView } from 'expo-symbols';
import { observer } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DateStrip } from '@/components/home/date-strip';
import { MealRow } from '@/components/home/meal-row';
import { ThemedText } from '@/components/themed-text';
import { MacroBar } from '@/components/ui/macro-bar';
import { ScreenScrollView } from '@/components/ui/screen-scroll-view';
import { BottomTabInset, Colors, LoginButtonGreen, LoginIconBackground, Spacing } from '@/constants/theme';
import { getIngredientById } from '@/data/seed/ingredients';
import { getRecipeById } from '@/data/seed/recipes';
import { useDailyNutrition } from '@/hooks/useDailyNutrition';
import { todayKey, weekContaining } from '@/lib/date';
import { generateDailyMealPlan } from '@/lib/mealPlanGenerator';
import { calculateDailyTargets, calculateRecipeNutrition, scaleForServings } from '@/lib/nutrition';
import { foodLogStore } from '@/store/foodLogStore';
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
  const insets = useSafeAreaInsets();
  const [date, setDate] = useState(todayKey());
  const profile = profileStore.profile;
  const targets = useMemo(() => profile ? calculateDailyTargets(profile) : undefined, [profile]);
  const { total } = useDailyNutrition(date);
  const planItems = mealPlanStore.itemsForDate(date);
  const loggedEntries = foodLogStore.entriesForDate(date);

  if (!profile || !targets) return null;

  const today = todayKey();
  const remainingWeekDays = weekContaining(today).filter(day => day >= today);

  function handleRegenerateToday() {
    mealPlanStore.removeItemsForDate(today);
    const generated = generateDailyMealPlan(targets.calories);
    generated.forEach(item => mealPlanStore.addItem({ date: today, ...item }));
    if (date !== today) setDate(today);
  }
  const hasFullWeekPlanned = remainingWeekDays.every(day => mealPlanStore.itemsForDate(day).length > 0);

  function handleGenerateWeek() {
    remainingWeekDays.forEach(day => {
      if (mealPlanStore.itemsForDate(day).length > 0) return;
      const generated = generateDailyMealPlan(targets.calories);
      generated.forEach(item => mealPlanStore.addItem({ date: day, ...item }));
    });
  }

  function toggleEaten(item) {
    const loggedEntry = loggedEntries.find(entry => entry.mealType === item.mealType && entry.recipeId === item.recipeId);
    if (loggedEntry) {
      foodLogStore.removeEntry(loggedEntry.id);
    } else {
      foodLogStore.logMeal({ date, mealType: item.mealType, recipeId: item.recipeId, servings: item.servings });
    }
  }

  return <View style={styles.flex1}>
      <View style={[styles.fixedTop, {
      paddingTop: insets.top + Spacing.two
    }]}>
        <View style={styles.headerRow}>
          <View style={styles.header}>
            <ThemedText type="title" style={styles.title} color={theme.text}>
              {t('mealPlan.title')}
            </ThemedText>
            <ThemedText type="default" color={theme.textSecondary}>
              {t('mealPlan.subtitle')}
            </ThemedText>
          </View>
          <Pressable onPress={handleRegenerateToday} hitSlop={8} style={styles.regenerateButton}>
            <SymbolView name="arrow.clockwise" size={18} tintColor={LoginButtonGreen} />
          </Pressable>
        </View>

        <DateStrip selectedDate={date} onSelectDate={setDate} />
      </View>

      <ScreenScrollView gap={Spacing.three} contentContainerStyle={{
      paddingBottom: BottomTabInset + (hasFullWeekPlanned ? Spacing.four : Spacing.six)
    }}>
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
              const isEaten = loggedEntries.some(entry => entry.mealType === item.mealType && entry.recipeId === item.recipeId);
              return <MealRow key={item.id} recipeId={item.recipeId} mealType={item.mealType} title={recipe.title} imageUrl={recipe.imageUrl} calories={calories} isEaten={isEaten} onToggleEaten={() => toggleEaten(item)} />;
            })}
              </View>}
          </View>;
    })}
      </ScreenScrollView>

      {!hasFullWeekPlanned && <Pressable onPress={handleGenerateWeek} style={[styles.weekButton, {
      bottom: BottomTabInset + Spacing.five + Spacing.two
    }]}>
          <SymbolView name="calendar.badge.plus" size={16} tintColor="#ffffff" />
          <ThemedText type="smallBold" style={styles.weekButtonText}>
            {t('mealPlan.weeklyMenu')}
          </ThemedText>
        </Pressable>}
    </View>;
}

export default observer(MealPlanScreen);

const styles = StyleSheet.create({
  flex1: {
    flex: 1
  },
  weekButton: {
    position: 'absolute',
    right: Spacing.four,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: LoginButtonGreen,
    borderRadius: 999,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 4
    },
    elevation: 4
  },
  weekButtonText: {
    color: '#ffffff'
  },
  fixedTop: {
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.two,
    backgroundColor: Colors.light.background
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two
  },
  header: {
    flex: 1,
    gap: Spacing.half
  },
  regenerateButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: LoginIconBackground,
    alignItems: 'center',
    justifyContent: 'center'
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
