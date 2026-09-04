import { useEffect, useMemo, useState } from 'react';
import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { observer } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DateStrip } from '@/components/home/date-strip';
import { MealRow } from '@/components/home/meal-row';
import { ThemedText } from '@/components/themed-text';
import { MacroBar } from '@/components/ui/macro-bar';
import { RecipeImage } from '@/components/ui/recipe-image';
import { ScreenScrollView } from '@/components/ui/screen-scroll-view';
import { BottomTabInset, Colors, LoginButtonGreen, LoginIconBackground, Spacing } from '@/constants/theme';
import { getIngredientById } from '@/data/seed/ingredients';
import { getRecipeById, RECIPES } from '@/data/seed/recipes';
import { useDailyNutrition } from '@/hooks/useDailyNutrition';
import { todayKey, weekContaining } from '@/lib/date';
import { generateDailyMealPlan } from '@/lib/mealPlanGenerator';
import { calculateDailyTargets, calculateRecipeNutrition, scaleForServings } from '@/lib/nutrition';
import { foodLogStore } from '@/store/foodLogStore';
import { mealPlanStore } from '@/store/mealPlanStore';
import { profileStore } from '@/store/profileStore';

function shuffle(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function isCategoryAllowedForMealType(categoryId, mealType) {
  if (mealType === 'breakfast') return categoryId === 'breakfast';
  if (mealType === 'snack') return categoryId === 'snack';
  if (mealType === 'lunch') return categoryId === 'lunch';
  return categoryId === 'dinner' || categoryId === 'salad';
}

function categoryPoolForMealType(mealType) {
  return RECIPES.filter(recipe => isCategoryAllowedForMealType(recipe.categoryId, mealType));
}

const theme = Colors.light;
const CALORIE_MATCH_TOLERANCE = 100;
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
  const [swapMealType, setSwapMealType] = useState(null);
  const profile = profileStore.profile;
  const targets = useMemo(() => profile ? calculateDailyTargets(profile) : undefined, [profile]);
  const { total } = useDailyNutrition(date);
  const planItems = mealPlanStore.itemsForDate(date);
  const loggedEntries = foodLogStore.entriesForDate(date);
  const menuCalories = planItems.reduce((sum, item) => {
    const recipe = getRecipeById(item.recipeId);
    if (!recipe) return sum;
    return sum + scaleForServings(calculateRecipeNutrition(recipe, getIngredientById), item.servings).nutrition.calories;
  }, 0);

  // Repairs items left over from before recipes were split into
  // breakfast/lunch/dinner/salad/snack categories, so a meal type never ends
  // up showing a dish from the wrong category (e.g. a lunch dish in dinner).
  useEffect(() => {
    for (const item of planItems) {
      const recipe = getRecipeById(item.recipeId);
      if (recipe && isCategoryAllowedForMealType(recipe.categoryId, item.mealType)) continue;
      const pool = categoryPoolForMealType(item.mealType);
      if (pool.length === 0) continue;
      const currentCalories = recipe ? calculateRecipeNutrition(recipe, getIngredientById).nutrition.calories : undefined;
      const replacement = currentCalories === undefined ? shuffle(pool)[0] : pool.reduce((best, candidate) => {
        const diff = Math.abs(calculateRecipeNutrition(candidate, getIngredientById).nutrition.calories - currentCalories);
        return !best || diff < best.diff ? { candidate, diff } : best;
      }, null).candidate;
      mealPlanStore.updateRecipe(item.id, replacement.id);
    }
  }, [planItems]);

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

  const swapCandidates = useMemo(() => {
    if (!swapMealType) return [];
    const pool = categoryPoolForMealType(swapMealType);
    const currentItem = planItems.find(item => item.mealType === swapMealType);
    const currentRecipe = currentItem ? getRecipeById(currentItem.recipeId) : undefined;
    if (!currentRecipe) return shuffle(pool).slice(0, 5);

    const currentCalories = calculateRecipeNutrition(currentRecipe, getIngredientById).nutrition.calories;
    return pool.filter(recipe => recipe.id !== currentRecipe.id).map(recipe => {
      const calories = calculateRecipeNutrition(recipe, getIngredientById).nutrition.calories;
      return { recipe, calories, diff: Math.abs(calories - currentCalories) };
    }).filter(entry => entry.diff <= CALORIE_MATCH_TOLERANCE).sort((a, b) => a.diff - b.diff).slice(0, 5).sort((a, b) => a.calories - b.calories).map(entry => entry.recipe);
  }, [swapMealType, planItems]);

  function handleSelectSwap(recipe) {
    const currentItem = planItems.find(item => item.mealType === swapMealType);
    if (currentItem) {
      mealPlanStore.updateRecipe(currentItem.id, recipe.id);
    } else {
      mealPlanStore.addItem({ date, mealType: swapMealType, recipeId: recipe.id, servings: 1 });
    }
    setSwapMealType(null);
  }

  function handleGenerateShoppingList() {
    router.push('/shopping-list');
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
      <View style={styles.topRow}>
        <View style={styles.progressCard}>
          <MacroBar label={t('recipes.calories')} value={total.nutrition.calories} target={menuCalories} unit={t('common.kcal')} color={theme.primary} />
        </View>
        <Pressable onPress={handleGenerateShoppingList} style={styles.shoppingListButton}>
          <SymbolView name="cart.fill" size={20} tintColor="#ffffff" />
          <ThemedText type="caption" style={styles.shoppingListButtonText} numberOfLines={2}>
            {t('home.shoppingList')}
          </ThemedText>
        </Pressable>
      </View>

      {MEAL_TYPES.map(mealType => {
      const items = planItems.filter(item => item.mealType === mealType);
      return <View key={mealType} style={styles.mealTypeCard}>
            <View style={styles.mealTypeHeader}>
              <View style={styles.mealTypeHeaderLeft}>
                <View style={styles.iconWrapper}>
                  <SymbolView name={MEAL_TYPE_ICONS[mealType]} size={18} tintColor={LoginButtonGreen} />
                </View>
                <ThemedText type="smallBold" color={theme.text}>
                  {t(`mealTypes.${mealType}`)}
                </ThemedText>
              </View>
              <Pressable onPress={() => setSwapMealType(mealType)} hitSlop={8} style={styles.editButton}>
                <SymbolView name="pencil" size={16} tintColor={LoginButtonGreen} />
              </Pressable>
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

      <Modal visible={!!swapMealType} transparent animationType="slide" onRequestClose={() => setSwapMealType(null)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setSwapMealType(null)}>
          <Pressable style={styles.modalSheet} onPress={event => event.stopPropagation()}>
            <View style={styles.modalHeader}>
              <View>
                <ThemedText type="smallBold" color={theme.text}>{t('mealPlan.swapTitle')}</ThemedText>
                <ThemedText type="caption" color={theme.textSecondary}>{t('mealPlan.swapSubtitle')}</ThemedText>
              </View>
              <Pressable onPress={() => setSwapMealType(null)} hitSlop={8} style={styles.editButton}>
                <SymbolView name="xmark" size={16} tintColor={LoginButtonGreen} />
              </Pressable>
            </View>

            {swapCandidates.length === 0 ? <ThemedText type="small" color={theme.textSecondary}>{t('mealPlan.swapEmpty')}</ThemedText> : <View style={styles.swapList}>
                {swapCandidates.map(recipe => {
              const calories = calculateRecipeNutrition(recipe, getIngredientById).nutrition.calories;
              return <Pressable key={recipe.id} onPress={() => handleSelectSwap(recipe)} style={styles.swapRow}>
                      <RecipeImage uri={recipe.imageUrl} style={styles.swapImage} iconSize={18} />
                      <View style={styles.swapTextWrapper}>
                        <ThemedText type="smallBold" color={theme.text} numberOfLines={1}>{recipe.title}</ThemedText>
                        <ThemedText type="small" color={theme.textSecondary}>{Math.round(calories)} {t('common.kcal')}</ThemedText>
                      </View>
                      <SymbolView name="chevron.right" size={16} tintColor={theme.textSecondary} />
                    </Pressable>;
            })}
              </View>}
          </Pressable>
        </Pressable>
      </Modal>
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
  topRow: {
    flexDirection: 'row',
    gap: Spacing.three
  },
  progressCard: {
    flex: 3,
    backgroundColor: theme.background,
    borderColor: theme.border,
    borderWidth: 1,
    borderRadius: 20,
    padding: Spacing.three
  },
  shoppingListButton: {
    flex: 2,
    backgroundColor: theme.secondary,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.one,
    padding: Spacing.three
  },
  shoppingListButtonText: {
    color: '#ffffff',
    textAlign: 'center'
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
    justifyContent: 'space-between'
  },
  mealTypeHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two
  },
  editButton: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: LoginIconBackground,
    alignItems: 'center',
    justifyContent: 'center'
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
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end'
  },
  modalSheet: {
    backgroundColor: theme.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: Spacing.four,
    paddingBottom: Spacing.six,
    gap: Spacing.three
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two
  },
  swapList: {
    gap: Spacing.two
  },
  swapRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.two,
    borderBottomWidth: 1,
    borderColor: theme.border
  },
  swapImage: {
    width: 48,
    height: 48,
    borderRadius: 12
  },
  swapTextWrapper: {
    flex: 1,
    gap: 2
  }
});
