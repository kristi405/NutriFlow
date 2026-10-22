import { useEffect, useMemo, useRef, useState } from 'react';
import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { observer } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';
import { Alert, KeyboardAvoidingView, Modal, PanResponder, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DateStrip } from '@/components/home/date-strip';
import { PersonAvatar } from '@/components/people/person-avatar';
import { PersonSwitcher } from '@/components/people/person-switcher';
import { AllergenWarning } from '@/components/allergen-warning';
import { MealRow } from '@/components/home/meal-row';
import { ShoppingRangeModal } from '@/components/meal-plan/shopping-range-modal';
import { WeeklyMenuModal } from '@/components/meal-plan/weekly-menu-modal';
import { ThemedText } from '@/components/themed-text';
import { MacroBar } from '@/components/ui/macro-bar';
import { RecipeImage } from '@/components/ui/recipe-image';
import { ScreenScrollView } from '@/components/ui/screen-scroll-view';
import { TAB_BAR_HEIGHT, tabBarBottomGap } from '@/components/custom-tab-bar';
import { Spacing } from '@/constants/theme';
import { getIngredientById, getIngredients, getRecipeById, getRecipes } from '@/data/catalog';
import { useTheme } from '@/hooks/use-theme';
import { useKeyboardHeight } from '@/hooks/useKeyboardHeight';
import { addDays, monthOf, todayKey, weekContaining, yearOf } from '@/lib/date';
import { defaultQuantityFor, formatQuantity, formatUnit, parseQuantity } from '@/lib/ingredientUnits';
import { guessIngredientImage } from '@/lib/ingredientImage';
import { generateDailyMealPlan } from '@/lib/mealPlanGenerator';
import { planningCalories } from '@/lib/mealPlanning';
import { findAllergenConflicts } from '@/lib/allergens';
import { recipeImageUri } from '@/lib/recipeImage';
import { calculateDailyTargets, calculateRecipeNutrition, planItemNutrition, scaleForServings, scaleIngredient } from '@/lib/nutrition';
import { ensurePremium } from '@/lib/premium';
import { foodLogStore } from '@/store/foodLogStore';
import { mealPlanStore } from '@/store/mealPlanStore';
import { myRecipesStore } from '@/store/myRecipesStore';
import { peopleStore } from '@/store/peopleStore';
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
// Minimum horizontal drag (px) to count as a deliberate week swipe, not a tap/wobble.
const WEEK_SWIPE_THRESHOLD = 50;
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
  const keyboardHeight = useKeyboardHeight();
  const tabBarOffset = TAB_BAR_HEIGHT + tabBarBottomGap(insets.bottom);
  const [date, setDate] = useState(todayKey());
  const [swapMealType, setSwapMealType] = useState(null);
  const [isShowingAllSwap, setIsShowingAllSwap] = useState(false);
  // Generation itself is instant, so the loader is held for a moment — otherwise
  // the modal would flash and the user couldn't tell anything happened.
  const [weekGenerationStatus, setWeekGenerationStatus] = useState(null);
  const [generationScope, setGenerationScope] = useState('week');
  const [isAddSnackModalOpen, setIsAddSnackModalOpen] = useState(false);
  const [customSnackCalories, setCustomSnackCalories] = useState('');
  const [snackPickerMode, setSnackPickerMode] = useState(null);
  const [snackQuery, setSnackQuery] = useState('');
  const [pendingSnackIngredient, setPendingSnackIngredient] = useState(null);
  const [snackAmount, setSnackAmount] = useState('');
  const [editingSnackId, setEditingSnackId] = useState(null);
  const [isShoppingRangeOpen, setIsShoppingRangeOpen] = useState(false);
  // Swipe left/right on the calendar header to move a week at a time. Only
  // claims the gesture once it's clearly horizontal, so it doesn't fight the
  // page's vertical scrolling (the header sits above the ScreenScrollView anyway).
  const weekPanResponder = useRef(PanResponder.create({
    onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dx) > 12 && Math.abs(gesture.dx) > Math.abs(gesture.dy) * 2,
    onPanResponderRelease: (_, gesture) => {
      if (gesture.dx <= -WEEK_SWIPE_THRESHOLD) shiftWeek(1);else if (gesture.dx >= WEEK_SWIPE_THRESHOLD) shiftWeek(-1);
    }
  })).current;
  const profile = profileStore.activeProfile;
  const targets = useMemo(() => profile ? calculateDailyTargets(profile) : undefined, [profile]);
  const planItems = mealPlanStore.itemsForDate(date);
  const loggedEntries = foodLogStore.entriesForDate(date);
  const menuCalories = planItems.reduce((sum, item) => {
    const recipe = getRecipeById(item.recipeId);
    if (!recipe) return sum;
    return sum + scaleForServings(planItemNutrition(recipe, item, getIngredientById), item.servings).nutrition.calories;
  }, 0);
  // Only meals actually checked off on this screen count as "eaten" here — quick snacks
  // and anything else logged elsewhere don't affect this progress bar.
  const eatenCalories = planItems.reduce((sum, item) => {
    const isEaten = loggedEntries.some(entry => entry.mealType === item.mealType && entry.recipeId === item.recipeId);
    if (!isEaten) return sum;
    const recipe = getRecipeById(item.recipeId);
    if (!recipe) return sum;
    return sum + scaleForServings(planItemNutrition(recipe, item, getIngredientById), item.servings).nutrition.calories;
  }, 0);
  const allMealsEaten = planItems.length > 0 && planItems.every(item => loggedEntries.some(entry => entry.mealType === item.mealType && entry.recipeId === item.recipeId));
  const quickSnackEntries = loggedEntries.filter(entry => entry.mealType === 'snack' && entry.manualCalories !== undefined);
  const eatenSnackCalories = quickSnackEntries.reduce((sum, entry) => sum + (entry.manualCalories ?? 0), 0);

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
  // The week being viewed (navigable via the arrows/swipe below), not always
  // today's — but days already in the past are still never auto-generated.
  const weekDays = weekContaining(date);
  const remainingWeekDays = weekDays.filter(day => day >= today);
  // A week spanning two months (e.g. the last days of one and the first of the
  // next) is labeled by its Thursday — the same convention ISO week numbering
  // uses, so the shown month/year stays stable as you scrub near a month edge.
  const monthAnchor = weekDays[3];
  const monthLabel = `${t(`common.months.${monthOf(monthAnchor)}`)} ${yearOf(monthAnchor)}`;

  // Moves the calendar strip a week at a time, via the arrows or a swipe on
  // the header (see weekPanResponder below). Shifting by exactly 7 days keeps
  // the same weekday selected (e.g. Wednesday stays selected a week later).
  function shiftWeek(weeks) {
    setDate(current => addDays(current, weeks * 7));
  }

  // Replaces today's whole menu, including any dishes the user swapped in by
  // hand — so ask first, unless there is nothing planned yet to lose.
  function handleRegenerateToday() {
    if (mealPlanStore.itemsForDate(today).length === 0) {
      regenerateToday();
      return;
    }
    Alert.alert(t('mealPlan.regenerateTitle'), t(peopleStore.shareMenu && peopleStore.members.length > 0 ? 'mealPlan.regenerateMessageShared' : 'mealPlan.regenerateMessage'), [{ text: t('common.cancel'), style: 'cancel' }, { text: t('mealPlan.regenerateConfirm'), style: 'destructive', onPress: regenerateToday }]);
  }
  const hasFullWeekPlanned = remainingWeekDays.every(day => mealPlanStore.itemsForDate(day).length > 0);

  function runGenerationWithPopup(scope, generate) {
    if (weekGenerationStatus || !ensurePremium()) return;
    setGenerationScope(scope);
    setWeekGenerationStatus('generating');
    setTimeout(generate, 300);
    setTimeout(() => setWeekGenerationStatus('done'), 2200);
    setTimeout(() => setWeekGenerationStatus(null), 4000);
  }

  function regenerateToday() {
    runGenerationWithPopup('day', () => {
      mealPlanStore.removeItemsForDate(today);
      const generated = generateDailyMealPlan(planningCalories(targets), { allergies: profile?.preferences?.allergies });
      generated.forEach(item => mealPlanStore.addItem({ date: today, ...item }));
      if (date !== today) setDate(today);
    });
  }

  function handleGenerateWeek() {
    runGenerationWithPopup('week', () => {
      remainingWeekDays.forEach(day => {
        if (mealPlanStore.itemsForDate(day).length > 0) return;
        const generated = generateDailyMealPlan(planningCalories(targets), { allergies: profile?.preferences?.allergies });
        generated.forEach(item => mealPlanStore.addItem({ date: day, ...item }));
      });
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

  // Every dish in this meal's category (my recipes first), minus what's already in the slot.
  const allSwapRecipes = useMemo(() => {
    if (!swapMealType) return [];
    const currentItem = planItems.find(item => item.mealType === swapMealType);
    const currentRecipeId = currentItem?.recipeId;
    const pool = categoryPoolForMealType(swapMealType).filter(recipe => recipe.id !== currentRecipeId);
    return [...pool.filter(recipe => recipe.isUserRecipe), ...pool.filter(recipe => !recipe.isUserRecipe).sort((a, b) => a.title.localeCompare(b.title))];
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


  function handleGenerateShoppingList(range) {
    setIsShoppingRangeOpen(false);
    router.push({ pathname: '/shopping-list', params: { range } });
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
    setSnackPickerMode(null);
    setSnackQuery('');
    setPendingSnackIngredient(null);
    setSnackAmount('');
  }

  const snackPickerItems = useMemo(() => {
    if (snackPickerMode === null) return [];
    const normalized = snackQuery.trim().toLowerCase();
    if (snackPickerMode === 'dish') {
      const dishes = [...myRecipesStore.recipes, ...getRecipes()];
      return dishes.filter(recipe => !normalized || recipe.title.toLowerCase().includes(normalized)).slice(0, 40);
    }
    return getIngredients().filter(ingredient => !normalized || ingredient.name.toLowerCase().includes(normalized)).slice(0, 40);
  }, [snackPickerMode, snackQuery, myRecipesStore.recipes.length]);

  function handlePickSnackDish(recipe) {
    const profile = calculateRecipeNutrition(recipe, getIngredientById);
    commitSnack(recipe.title, Math.round(profile.nutrition.calories), profile);
  }

  function handlePickSnackIngredient(ingredient) {
    setPendingSnackIngredient(ingredient);
    setSnackAmount(defaultQuantityFor(ingredient.defaultUnit));
  }

  function confirmSnackIngredient() {
    const ingredient = pendingSnackIngredient;
    if (!ingredient) return;
    const unit = ingredient.defaultUnit;
    const quantity = parseQuantity(snackAmount);
    const profile = scaleIngredient(ingredient, quantity, unit);
    commitSnack(`${ingredient.name} (${formatQuantity(quantity)} ${formatUnit(t, unit)})`, Math.round(profile.nutrition.calories), profile);
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

  // `profile` is the full nutrition breakdown when the snack came from a dish or
  // ingredient; quick/custom calorie snacks have none and count as calories only.
  function commitSnack(label, calories, profile) {
    if (editingSnackId) {
      foodLogStore.updateEntry(editingSnackId, { label, manualCalories: calories, profile: undefined });
    } else {
      foodLogStore.logMeal({ date, mealType: 'snack', label, manualCalories: calories, profile });
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
          </View>
          <Pressable onPress={() => ensurePremium() && handleRegenerateToday()} hitSlop={8} style={styles.refreshButton}>
            <SymbolView name={{ ios: 'arrow.clockwise', android: 'refresh', web: 'refresh' }} size={18} tintColor={theme.accent} />
          </Pressable>
          <PersonSwitcher variant="avatarBadge" size={40} style={styles.headerAvatar}>
            <View style={styles.headerAvatarCircle}>
              <PersonAvatar profile={profileStore.activeProfile} size={36} iconFallback />
            </View>
          </PersonSwitcher>
        </View>

        <ThemedText type="smallBold" color={theme.textSecondary} style={styles.monthLabel}>
          {monthLabel}
        </ThemedText>

        <View style={styles.weekRow} {...weekPanResponder.panHandlers}>
          <Pressable onPress={() => shiftWeek(-1)} hitSlop={8} style={styles.weekArrow}>
            <SymbolView name={{ ios: 'chevron.left', android: 'chevron_left', web: 'chevron_left' }} size={18} tintColor={theme.textSecondary} />
          </Pressable>
          <DateStrip selectedDate={date} onSelectDate={setDate} style={styles.dateStripFlex} />
          <Pressable onPress={() => shiftWeek(1)} hitSlop={8} style={styles.weekArrow}>
            <SymbolView name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }} size={18} tintColor={theme.textSecondary} />
          </Pressable>
        </View>
      </View>

      <ScreenScrollView isTabScreen gap={Spacing.three} contentContainerStyle={{
      // The header/calendar above already clears the status bar, so only a small gap is needed here.
      paddingTop: Spacing.two,
      paddingBottom: tabBarOffset + (hasFullWeekPlanned ? Spacing.four : Spacing.six)
    }}>
      <View style={styles.topRow}>
        <View style={[styles.progressCard, allMealsEaten && styles.progressCardEaten]}>
          <MacroBar label={t('recipes.calories')} value={eatenCalories + eatenSnackCalories} target={targets.calories} unit={t('common.kcal')} color={theme.primary} />
        </View>
        <Pressable onPress={() => ensurePremium() && setIsShoppingRangeOpen(true)} style={styles.shoppingListButton}>
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
                <Pressable onPress={() => { setIsShowingAllSwap(false); setSwapMealType(mealType); }} hitSlop={8} style={styles.editButton}>
                  <SymbolView name={{ ios: 'pencil', android: 'edit', web: 'edit' }} size={16} tintColor={theme.accent} />
                </Pressable>
              </View>
              {items.length === 0 ? <ThemedText type="small" color={theme.textSecondary}>
                  {t('mealPlan.noMealPlanned')}
                </ThemedText> : <View style={styles.mealList}>
                  {items.map(item => {
                const recipe = getRecipeById(item.recipeId);
                if (!recipe) return null;
                const calories = scaleForServings(planItemNutrition(recipe, item, getIngredientById), item.servings).nutrition.calories;
                const isEaten = loggedEntries.some(entry => entry.mealType === item.mealType && entry.recipeId === item.recipeId);
                return <MealRow key={item.id} recipeId={item.recipeId} planItemId={item.id} mealType={item.mealType} title={recipe.title} imageUrl={recipeImageUri(recipe)} calories={calories} servings={item.servings} isEaten={isEaten} onToggleEaten={() => toggleEaten(item)} allergens={findAllergenConflicts(recipe, profile?.preferences?.allergies)} />;
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
                <View style={styles.snackLabelWrapper}>
                  <ThemedText type="smallBold" color={theme.text} numberOfLines={1}>{entry.label}</ThemedText>
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

      <WeeklyMenuModal status={weekGenerationStatus} scope={generationScope} />

      <ShoppingRangeModal visible={isShoppingRangeOpen} onSelect={handleGenerateShoppingList} onClose={() => setIsShoppingRangeOpen(false)} />


      <Modal visible={!!swapMealType} transparent animationType="slide" onRequestClose={() => setSwapMealType(null)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setSwapMealType(null)}>
          <Pressable style={styles.modalSheet} onPress={event => event.stopPropagation()}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderText}>
                <ThemedText type="smallBold" color={theme.text}>{t('mealPlan.swapTitle')}</ThemedText>
                <ThemedText type="caption" color={theme.textSecondary}>{t('mealPlan.swapSubtitle')}</ThemedText>
              </View>
              <Pressable onPress={() => setSwapMealType(null)} hitSlop={8} style={styles.editButton}>
                <SymbolView name={{ ios: 'xmark', android: 'close', web: 'close' }} size={16} tintColor={theme.accent} />
              </Pressable>
            </View>

            {(isShowingAllSwap ? allSwapRecipes : swapCandidates).length === 0 ? <ThemedText type="small" color={theme.textSecondary}>{t('mealPlan.swapEmpty')}</ThemedText> : <ScrollView style={styles.quickSnackScroll}><View style={styles.swapList}>
                {(isShowingAllSwap ? allSwapRecipes : swapCandidates).map(recipe => {
              const calories = calculateRecipeNutrition(recipe, getIngredientById).nutrition.calories;
              return <Pressable key={recipe.id} onPress={() => handleSelectSwap(recipe)} style={styles.swapRow}>
                      <RecipeImage uri={recipeImageUri(recipe)} style={styles.swapImage} iconSize={18} />
                      <View style={styles.swapTextWrapper}>
                        <ThemedText type="smallBold" color={theme.text} numberOfLines={1}>{recipe.title}</ThemedText>
                        <ThemedText type="small" color={theme.textSecondary}>{Math.round(calories)} {t('common.kcal')}</ThemedText>
                        <AllergenWarning allergens={findAllergenConflicts(recipe, profile?.preferences?.allergies)} />
                      </View>
                      <SymbolView name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }} size={16} tintColor={theme.textSecondary} />
                    </Pressable>;
            })}
              </View></ScrollView>}

            <Pressable onPress={() => setIsShowingAllSwap(current => !current)} style={styles.chooseOtherButton}>
              <SymbolView name={{ ios: isShowingAllSwap ? 'chevron.up' : 'list.bullet', android: isShowingAllSwap ? 'expand_less' : 'list', web: isShowingAllSwap ? 'expand_less' : 'list' }} size={14} tintColor={theme.accent} />
              <ThemedText type="smallBold" color={theme.accent}>{t(isShowingAllSwap ? 'mealPlan.showFewerDishes' : 'mealPlan.chooseOtherDish')}</ThemedText>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal visible={isAddSnackModalOpen} transparent animationType="slide" onRequestClose={closeSnackModal}>
        {/* Modals present in their own native root, so the keyboard-avoidance
            fix applied to the main screens (automaticallyAdjustKeyboardInsets
            on a ScrollView) doesn't reach in here — this sheet has no scroll
            view of its own, just a fixed card, so KeyboardAvoidingView's
            native, frame-synced "padding" is the right tool. It replaces the
            old `paddingBottom: keyboardHeight` state-driven snap, which moved
            the whole sheet (search field and close button included) a beat
            after the real keyboard animation, instead of with it. */}
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex1}>
          <Pressable style={[styles.modalBackdrop, Platform.OS === 'android' && { paddingBottom: keyboardHeight }]} onPress={closeSnackModal}>
          <Pressable style={[styles.modalSheet, snackPickerMode !== null && { paddingBottom: Spacing.three }, keyboardHeight > 0 && styles.modalSheetKeyboardOpen]} onPress={event => event.stopPropagation()}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderText}>
                <ThemedText type="smallBold" color={theme.text}>{t(editingSnackId ? 'mealPlan.editSnackTitle' : 'mealPlan.addSnackTitle')}</ThemedText>
                <ThemedText type="caption" color={theme.textSecondary}>{t('mealPlan.addSnackSubtitle')}</ThemedText>
              </View>
              <Pressable onPress={closeSnackModal} hitSlop={8} style={styles.editButton}>
                <SymbolView name={{ ios: 'xmark', android: 'close', web: 'close' }} size={16} tintColor={theme.accent} />
              </Pressable>
            </View>

            <View style={styles.snackPickerButtons}>
              <Pressable onPress={() => { setSnackPickerMode(current => current === 'dish' ? null : 'dish'); setSnackQuery(''); setPendingSnackIngredient(null); }} style={[styles.snackPickerButton, snackPickerMode === 'dish' && styles.snackPickerButtonActive]}>
                <ThemedText type="smallBold" color={snackPickerMode === 'dish' ? '#ffffff' : theme.accent}>{t('mealPlan.chooseDish')}</ThemedText>
              </Pressable>
              <Pressable onPress={() => { setSnackPickerMode(current => current === 'ingredient' ? null : 'ingredient'); setSnackQuery(''); setPendingSnackIngredient(null); }} style={[styles.snackPickerButton, snackPickerMode === 'ingredient' && styles.snackPickerButtonActive]}>
                <ThemedText type="smallBold" color={snackPickerMode === 'ingredient' ? '#ffffff' : theme.accent}>{t('mealPlan.chooseIngredient')}</ThemedText>
              </Pressable>
            </View>

            {snackPickerMode !== null ? <>
                <ScrollView style={styles.snackPickerScroll} keyboardShouldPersistTaps="handled">
                  <View style={styles.swapList}>
                    {snackPickerItems.map(item => <Pressable key={item.id} onPress={() => snackPickerMode === 'dish' ? handlePickSnackDish(item) : handlePickSnackIngredient(item)} style={styles.swapRow}>
                        {snackPickerMode === 'dish' ? <RecipeImage uri={recipeImageUri(item)} style={styles.swapImage} iconSize={18} /> : <RecipeImage uri={guessIngredientImage(item)} style={styles.swapImage} iconSize={18} />}
                        <ThemedText type="smallBold" color={theme.text} style={styles.flex1} numberOfLines={1}>{snackPickerMode === 'dish' ? item.title : item.name}</ThemedText>
                      </Pressable>)}
                  </View>
                </ScrollView>
              </> : <ScrollView style={styles.quickSnackScroll}>
              <View style={styles.swapList}>
                {QUICK_SNACKS.map(snack => <Pressable key={snack.id} onPress={() => commitSnack(t(snack.nameKey), snack.calories)} style={styles.swapRow}>
                    <View style={styles.quickSnackIconWrapper}>
                      <SymbolView name={QUICK_SNACK_ICON} size={16} tintColor={theme.accent} />
                    </View>
                    <ThemedText type="smallBold" color={theme.text} style={styles.flex1}>{t(snack.nameKey)}</ThemedText>
                    <ThemedText type="small" color={theme.textSecondary}>{snack.calories} {t('common.kcal')}</ThemedText>
                  </Pressable>)}
              </View>
            </ScrollView>}

            {snackPickerMode !== null ? <TextInput value={snackQuery} onChangeText={setSnackQuery} placeholder={t(snackPickerMode === 'dish' ? 'mealPlan.searchDishPlaceholder' : 'mealPlan.searchIngredientPlaceholder')} placeholderTextColor={theme.textSecondary} style={[styles.snackSearchInput, { color: theme.text, borderColor: theme.border }]} /> : <View style={styles.customSnackRow}>
              <TextInput value={customSnackCalories} onChangeText={setCustomSnackCalories} keyboardType="number-pad" placeholder={t('mealPlan.customSnackPlaceholder')} placeholderTextColor={theme.textSecondary} style={styles.customSnackInput} />
              <Pressable onPress={handleLogCustomSnack} style={styles.customSnackButton}>
                <ThemedText type="smallBold" color="#ffffff">{t(editingSnackId ? 'common.save' : 'common.add')}</ThemedText>
              </Pressable>
            </View>}
          </Pressable>
          {pendingSnackIngredient && <Pressable style={[StyleSheet.absoluteFill, styles.amountBackdrop]} onPress={() => setPendingSnackIngredient(null)}>
          <Pressable style={[styles.amountCard, { backgroundColor: theme.background }]} onPress={event => event.stopPropagation()}>
            <ThemedText type="smallBold" color={theme.text}>{t('mealPlan.howMuchEaten')}</ThemedText>
            <ThemedText type="small" color={theme.textSecondary}>{pendingSnackIngredient.name}</ThemedText>
            <View style={styles.customSnackRow}>
              <TextInput value={snackAmount} onChangeText={setSnackAmount} keyboardType="decimal-pad" autoFocus placeholder={formatUnit(t, pendingSnackIngredient.defaultUnit)} placeholderTextColor={theme.textSecondary} style={styles.customSnackInput} />
              <ThemedText type="smallBold" color={theme.textSecondary}>{formatUnit(t, pendingSnackIngredient.defaultUnit)}</ThemedText>
            </View>
            <View style={styles.amountActions}>
              <Pressable onPress={() => setPendingSnackIngredient(null)} style={styles.amountCancel}>
                <ThemedText type="smallBold" color={theme.textSecondary}>{t('common.cancel')}</ThemedText>
              </Pressable>
              <Pressable onPress={confirmSnackIngredient} style={styles.customSnackButton}>
                <ThemedText type="smallBold" color="#ffffff">{t('common.add')}</ThemedText>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>}
          </Pressable>
        </KeyboardAvoidingView>
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
    paddingVertical: 18,
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
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.two
  },
  monthLabel: {
    textAlign: 'left',
    textTransform: 'capitalize',
    marginTop: Spacing.one,
    marginBottom: -Spacing.two
  },
  weekRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one
  },
  weekArrow: {
    padding: Spacing.one
  },
  dateStripFlex: {
    flex: 1
  },
  header: {
    flex: 1,
    gap: Spacing.half
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.accentSoft,
    alignItems: 'center',
    justifyContent: 'center'
  },
  headerAvatar: {
    marginRight: -2
  },
  headerAvatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: theme.accent,
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
    flex: 1,
    minWidth: 0,
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
  snackPickerScroll: {
    maxHeight: 200
  },
  snackPickerButtons: {
    flexDirection: 'row',
    gap: Spacing.two
  },
  snackPickerButton: {
    flex: 1,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: theme.accent,
    borderRadius: 999,
    paddingVertical: Spacing.two
  },
  snackPickerButtonActive: {
    backgroundColor: theme.accent
  },
  snackLabelWrapper: {
    flex: 1,
    minWidth: 0
  },
  amountBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.five
  },
  amountCard: {
    width: '100%',
    maxWidth: 320,
    borderRadius: 24,
    padding: Spacing.four,
    gap: Spacing.three
  },
  amountActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: Spacing.two
  },
  amountCancel: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two
  },
  snackSearchInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 16,
    lineHeight: 20
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
    gap: Spacing.three,
    maxHeight: '90%'
  },
  // With the keyboard up, KeyboardAvoidingView already shifts the sheet to sit
  // right above it — the sheet's own resting-state bottom padding would then
  // show up as a gap of empty space above the keyboard.
  modalSheetKeyboardOpen: {
    paddingBottom: Spacing.two
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two
  },
  // Without this, the title/subtitle block has no shrink limit, so a longer
  // translation (German, Polish, ...) overflows the row and pushes the
  // fixed-size close button out of place instead of wrapping its own text.
  modalHeaderText: {
    flex: 1
  },
  swapList: {
    gap: Spacing.two
  },
  chooseOtherButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1.5,
    borderColor: theme.accent,
    borderRadius: 999,
    paddingVertical: Spacing.two
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
