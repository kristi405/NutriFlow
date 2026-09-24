import { useEffect, useMemo, useState } from 'react';
import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { observer } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';
import { Modal, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DateStrip } from '@/components/home/date-strip';
import { MealRow } from '@/components/home/meal-row';
import { ThemedText } from '@/components/themed-text';
import { MacroBar } from '@/components/ui/macro-bar';
import { RecipeImage } from '@/components/ui/recipe-image';
import { ScreenScrollView } from '@/components/ui/screen-scroll-view';
import { TAB_BAR_HEIGHT } from '@/components/custom-tab-bar';
import { Spacing } from '@/constants/theme';
import { getIngredientById, getRecipeById, getRecipes } from '@/data/catalog';
import { useTheme } from '@/hooks/use-theme';
import { todayKey, weekContaining } from '@/lib/date';
import { generateDailyMealPlan } from '@/lib/mealPlanGenerator';
import { calculateDailyTargets, calculateRecipeNutrition, scaleForServings } from '@/lib/nutrition';
import { foodLogStore } from '@/store/foodLogStore';
import { mealPlanStore } from '@/store/mealPlanStore';
import { myRecipesStore } from '@/store/myRecipesStore';
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
  // My Recipes come first so they're preferred as swap candidates over seed recipes.
  const myPool = myRecipesStore.recipes.filter(recipe => isCategoryAllowedForMealType(recipe.categoryId, mealType));
  const catalogPool = getRecipes().filter(recipe => isCategoryAllowedForMealType(recipe.categoryId, mealType));
  return [...myPool, ...catalogPool];
}

const CALORIE_MATCH_TOLERANCE = 100;
const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'];
const MEAL_TYPE_ICONS = {
  breakfast: { ios: 'sunrise.fill', android: 'wb_twilight', web: 'wb_twilight' },
  lunch: { ios: 'sun.max.fill', android: 'wb_sunny', web: 'wb_sunny' },
  dinner: { ios: 'moon.stars.fill', android: 'bedtime', web: 'bedtime' },
  snack: { ios: 'leaf.fill', android: 'eco', web: 'eco' }
};
const QUICK_SNACK_ICON = { ios: 'flame.fill', android: 'local_fire_department', web: 'local_fire_department' };
const QUICK_SNACKS = [{ id: 'coffee', nameKey: 'mealPlan.quickSnackNames.coffee', calories: 40 }, { id: 'tea-with-honey', nameKey: 'mealPlan.quickSnackNames.teaWithHoney', calories: 30 }, { id: 'ice-cream', nameKey: 'mealPlan.quickSnackNames.iceCream', calories: 137 }, { id: 'candy', nameKey: 'mealPlan.quickSnackNames.candy', calories: 25 }, { id: 'chocolate-bar', nameKey: 'mealPlan.quickSnackNames.chocolateBar', calories: 230 }, { id: 'chips', nameKey: 'mealPlan.quickSnackNames.chips', calories: 160 }, { id: 'cookies', nameKey: 'mealPlan.quickSnackNames.cookies', calories: 140 }, { id: 'soda', nameKey: 'mealPlan.quickSnackNames.soda', calories: 140 }, { id: 'protein-bar', nameKey: 'mealPlan.quickSnackNames.proteinBar', calories: 200 }, { id: 'nuts-handful', nameKey: 'mealPlan.quickSnackNames.nutsHandful', calories: 170 }];

function MealPlanScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const insets = useSafeAreaInsets();
  const tabBarOffset = TAB_BAR_HEIGHT + Math.max(insets.bottom, 12);
  const [date, setDate] = useState(todayKey());
  const [swapMealType, setSwapMealType] = useState(null);
  const [isAddSnackModalOpen, setIsAddSnackModalOpen] = useState(false);
  const [customSnackCalories, setCustomSnackCalories] = useState('');
  const [editingSnackId, setEditingSnackId] = useState(null);
  const profile = profileStore.profile;
  const targets = useMemo(() => profile ? calculateDailyTargets(profile) : undefined, [profile]);
  const planItems = mealPlanStore.itemsForDate(date);
  const loggedEntries = foodLogStore.entriesForDate(date);
  const menuCalories = planItems.reduce((sum, item) => {
    const recipe = getRecipeById(item.recipeId);
    if (!recipe) return sum;
    return sum + scaleForServings(calculateRecipeNutrition(recipe, getIngredientById), item.servings).nutrition.calories;
  }, 0);
  // Only meals actually checked off on this screen count as "eaten" here — quick snacks
  // and anything else logged elsewhere don't affect this progress bar.
  const eatenCalories = planItems.reduce((sum, item) => {
    const isEaten = loggedEntries.some(entry => entry.mealType === item.mealType && entry.recipeId === item.recipeId);
    if (!isEaten) return sum;
    const recipe = getRecipeById(item.recipeId);
    if (!recipe) return sum;
    return sum + scaleForServings(calculateRecipeNutrition(recipe, getIngredientById), item.servings).nutrition.calories;
  }, 0);
  const allMealsEaten = planItems.length > 0 && planItems.every(item => loggedEntries.some(entry => entry.mealType === item.mealType && entry.recipeId === item.recipeId));
  const quickSnackEntries = loggedEntries.filter(entry => entry.mealType === 'snack' && entry.manualCalories !== undefined);

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

    const myPool = pool.filter(recipe => recipe.isUserRecipe && recipe.id !== currentRecipe?.id);
    const seedPool = pool.filter(recipe => !recipe.isUserRecipe && recipe.id !== currentRecipe?.id);

    // My Recipes of this meal type's category always come first, regardless of calorie match —
    // only the remaining slots (up to 5 total) are filled with calorie-matched seed recipes.
    const myCandidates = [...myPool].sort((a, b) => calculateRecipeNutrition(a, getIngredientById).nutrition.calories - calculateRecipeNutrition(b, getIngredientById).nutrition.calories).slice(0, 5);
    const remainingSlots = Math.max(0, 5 - myCandidates.length);

    let seedCandidates = [];
    if (remainingSlots > 0) {
      if (!currentRecipe) {
        seedCandidates = shuffle(seedPool).slice(0, remainingSlots);
      } else {
        const currentCalories = calculateRecipeNutrition(currentRecipe, getIngredientById).nutrition.calories;
        seedCandidates = seedPool.map(recipe => {
          const calories = calculateRecipeNutrition(recipe, getIngredientById).nutrition.calories;
          return { recipe, calories, diff: Math.abs(calories - currentCalories) };
        }).filter(entry => entry.diff <= CALORIE_MATCH_TOLERANCE).sort((a, b) => a.diff - b.diff).slice(0, remainingSlots).sort((a, b) => a.calories - b.calories).map(entry => entry.recipe);
      }
    }

    return [...myCandidates, ...seedCandidates];
  }, [swapMealType, planItems]);

  function handleSelectSwap(recipe) {
    const currentItem = planItems.find(item => item.mealType === swapMealType);
    if (currentItem) {
      // If this slot was already logged as eaten, keep that log entry pointing at the
      // actual (post-swap) dish instead of leaving it stuck on the replaced one.
      const loggedEntry = loggedEntries.find(entry => entry.mealType === swapMealType && entry.recipeId === currentItem.recipeId);
      mealPlanStore.updateRecipe(currentItem.id, recipe.id);
      if (loggedEntry) foodLogStore.updateEntry(loggedEntry.id, { recipeId: recipe.id });
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

  function closeSnackModal() {
    setIsAddSnackModalOpen(false);
    setEditingSnackId(null);
    setCustomSnackCalories('');
  }

  function handleOpenAddSnack() {
    setEditingSnackId(null);
    setCustomSnackCalories('');
    setIsAddSnackModalOpen(true);
  }

  function handleOpenEditSnack(entry) {
    setEditingSnackId(entry.id);
    setCustomSnackCalories(String(entry.manualCalories));
    setIsAddSnackModalOpen(true);
  }

  function commitSnack(label, calories) {
    if (editingSnackId) {
      foodLogStore.updateEntry(editingSnackId, { label, manualCalories: calories });
    } else {
      foodLogStore.logMeal({ date, mealType: 'snack', label, manualCalories: calories });
    }
    closeSnackModal();
  }

  function handleLogCustomSnack() {
    const calories = Math.round(Number(customSnackCalories));
    if (!Number.isFinite(calories) || calories <= 0) return;
    const editingEntry = editingSnackId ? quickSnackEntries.find(entry => entry.id === editingSnackId) : undefined;
    commitSnack(editingEntry?.label ?? t('mealPlan.customSnackLabel'), calories);
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
            <SymbolView name={{ ios: 'arrow.clockwise', android: 'refresh', web: 'refresh' }} size={18} tintColor={theme.accent} />
          </Pressable>
        </View>

        <DateStrip selectedDate={date} onSelectDate={setDate} />
      </View>

      <ScreenScrollView isTabScreen gap={Spacing.three} contentContainerStyle={{
      paddingBottom: tabBarOffset + (hasFullWeekPlanned ? Spacing.four : Spacing.six)
    }}>
      <View style={styles.topRow}>
        <View style={[styles.progressCard, allMealsEaten && styles.progressCardEaten]}>
          <MacroBar label={t('recipes.calories')} value={eatenCalories} target={targets.calories} unit={t('common.kcal')} color={theme.primary} />
        </View>
        <Pressable onPress={handleGenerateShoppingList} style={styles.shoppingListButton}>
          <SymbolView name="cart.fill" size={20} tintColor="#ffffff" />
          <ThemedText type="caption" style={styles.shoppingListButtonText} numberOfLines={2}>
            {t('home.shoppingList')}
          </ThemedText>
        </Pressable>
      </View>

      <View style={styles.mealTypesList}>
        {MEAL_TYPES.map(mealType => {
        const items = planItems.filter(item => item.mealType === mealType);
        const isMealTypeEaten = items.length > 0 && items.every(item => loggedEntries.some(entry => entry.mealType === item.mealType && entry.recipeId === item.recipeId));
        return <View key={mealType} style={[styles.mealTypeCard, isMealTypeEaten && styles.mealTypeCardEaten]}>
              <View style={styles.mealTypeHeader}>
                <View style={styles.mealTypeHeaderLeft}>
                  <View style={styles.iconWrapper}>
                    <SymbolView name={MEAL_TYPE_ICONS[mealType]} size={18} tintColor={theme.accent} />
                  </View>
                  <ThemedText type="smallBold" color={theme.text}>
                    {t(`mealTypes.${mealType}`)}
                  </ThemedText>
                </View>
                <Pressable onPress={() => setSwapMealType(mealType)} hitSlop={8} style={styles.editButton}>
                  <SymbolView name={{ ios: 'pencil', android: 'edit', web: 'edit' }} size={16} tintColor={theme.accent} />
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

        {quickSnackEntries.map(entry => <View key={entry.id} style={styles.mealTypeCard}>
            <View style={styles.mealTypeHeader}>
              <View style={styles.mealTypeHeaderLeft}>
                <View style={styles.iconWrapper}>
                  <SymbolView name={QUICK_SNACK_ICON} size={18} tintColor={theme.accent} />
                </View>
                <View>
                  <ThemedText type="smallBold" color={theme.text}>{entry.label}</ThemedText>
                  <ThemedText type="small" color={theme.textSecondary}>{entry.manualCalories} {t('common.kcal')}</ThemedText>
                </View>
              </View>
              <View style={styles.quickSnackActions}>
                <Pressable onPress={() => handleOpenEditSnack(entry)} hitSlop={8} style={styles.editButton}>
                  <SymbolView name={{ ios: 'pencil', android: 'edit', web: 'edit' }} size={16} tintColor={theme.accent} />
                </Pressable>
                <Pressable onPress={() => foodLogStore.removeEntry(entry.id)} hitSlop={8} style={styles.deleteButton}>
                  <SymbolView name={{ ios: 'trash', android: 'delete', web: 'delete' }} size={16} tintColor={theme.error} />
                </Pressable>
              </View>
            </View>
          </View>)}

        <Pressable onPress={handleOpenAddSnack} style={styles.addSnackButton}>
          <SymbolView name={{ ios: 'plus.circle.fill', android: 'add_circle', web: 'add_circle' }} size={20} tintColor={theme.accent} />
          <ThemedText type="smallBold" color={theme.accent}>{t('mealPlan.addSnack')}</ThemedText>
        </Pressable>

        <View style={styles.totalPlannedRow}>
          <ThemedText type="small" color={theme.textSecondary}>{t('mealPlan.totalPlannedCalories')}</ThemedText>
          <ThemedText type="smallBold" color={theme.text}>{Math.round(menuCalories)} {t('common.kcal')}</ThemedText>
        </View>
      </View>
      </ScreenScrollView>

      {!hasFullWeekPlanned && <Pressable onPress={handleGenerateWeek} style={[styles.weekButton, {
      bottom: tabBarOffset + Spacing.three
    }]}>
          <SymbolView name={{ ios: 'calendar.badge.plus', android: 'calendar_add_on', web: 'calendar_add_on' }} size={16} tintColor="#ffffff" />
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
                <SymbolView name={{ ios: 'xmark', android: 'close', web: 'close' }} size={16} tintColor={theme.accent} />
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
                      <SymbolView name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }} size={16} tintColor={theme.textSecondary} />
                    </Pressable>;
            })}
              </View>}
          </Pressable>
        </Pressable>
      </Modal>

      <Modal visible={isAddSnackModalOpen} transparent animationType="slide" onRequestClose={closeSnackModal}>
        <Pressable style={styles.modalBackdrop} onPress={closeSnackModal}>
          <Pressable style={styles.modalSheet} onPress={event => event.stopPropagation()}>
            <View style={styles.modalHeader}>
              <View>
                <ThemedText type="smallBold" color={theme.text}>{t(editingSnackId ? 'mealPlan.editSnackTitle' : 'mealPlan.addSnackTitle')}</ThemedText>
                <ThemedText type="caption" color={theme.textSecondary}>{t('mealPlan.addSnackSubtitle')}</ThemedText>
              </View>
              <Pressable onPress={closeSnackModal} hitSlop={8} style={styles.editButton}>
                <SymbolView name={{ ios: 'xmark', android: 'close', web: 'close' }} size={16} tintColor={theme.accent} />
              </Pressable>
            </View>

            <ScrollView style={styles.quickSnackScroll}>
              <View style={styles.swapList}>
                {QUICK_SNACKS.map(snack => <Pressable key={snack.id} onPress={() => commitSnack(t(snack.nameKey), snack.calories)} style={styles.swapRow}>
                    <View style={styles.quickSnackIconWrapper}>
                      <SymbolView name={QUICK_SNACK_ICON} size={16} tintColor={theme.accent} />
                    </View>
                    <ThemedText type="smallBold" color={theme.text} style={styles.flex1}>{t(snack.nameKey)}</ThemedText>
                    <ThemedText type="small" color={theme.textSecondary}>{snack.calories} {t('common.kcal')}</ThemedText>
                  </Pressable>)}
              </View>
            </ScrollView>

            <View style={styles.customSnackRow}>
              <TextInput value={customSnackCalories} onChangeText={setCustomSnackCalories} keyboardType="number-pad" placeholder={t('mealPlan.customSnackPlaceholder')} placeholderTextColor={theme.textSecondary} style={styles.customSnackInput} />
              <Pressable onPress={handleLogCustomSnack} style={styles.customSnackButton}>
                <ThemedText type="smallBold" color="#ffffff">{t(editingSnackId ? 'common.save' : 'common.add')}</ThemedText>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>;
}

export default observer(MealPlanScreen);

const createStyles = theme => StyleSheet.create({
  flex1: {
    flex: 1
  },
  weekButton: {
    position: 'absolute',
    right: Spacing.four,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: theme.accent,
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
    backgroundColor: theme.background
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
    backgroundColor: theme.accentSoft,
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
  progressCardEaten: {
    borderColor: theme.accent
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
  mealTypesList: {
    gap: Spacing.two
  },
  mealTypeCard: {
    gap: Spacing.two,
    backgroundColor: theme.background,
    borderColor: theme.border,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: Spacing.three,
    paddingVertical: 12
  },
  mealTypeCardEaten: {
    borderColor: theme.accent
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
    backgroundColor: theme.accentSoft,
    alignItems: 'center',
    justifyContent: 'center'
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.accentSoft,
    alignItems: 'center',
    justifyContent: 'center'
  },
  mealList: {
    gap: Spacing.two
  },
  quickSnackIconWrapper: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.accentSoft,
    alignItems: 'center',
    justifyContent: 'center'
  },
  quickSnackActions: {
    flexDirection: 'row',
    gap: Spacing.two
  },
  deleteButton: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: theme.backgroundElement,
    alignItems: 'center',
    justifyContent: 'center'
  },
  flex1: {
    flex: 1
  },
  addSnackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.one,
    backgroundColor: theme.background,
    borderColor: theme.border,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 16,
    paddingVertical: Spacing.three
  },
  totalPlannedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.one,
    paddingTop: Spacing.one
  },
  quickSnackScroll: {
    maxHeight: 320
  },
  customSnackRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    alignItems: 'center'
  },
  customSnackInput: {
    flex: 1,
    borderColor: theme.border,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    color: theme.text
  },
  customSnackButton: {
    backgroundColor: theme.accent,
    borderRadius: 12,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    alignItems: 'center',
    justifyContent: 'center'
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
