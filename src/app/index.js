import { useMemo, useState } from 'react';
import { SymbolView } from 'expo-symbols';
import { observer } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { AiInsightCard } from '@/components/home/ai-insight-card';
import { DateStrip } from '@/components/home/date-strip';
import { MacroCard } from '@/components/home/macro-card';
import { MealRow } from '@/components/home/meal-row';
import { NutritionScoreCard } from '@/components/home/nutrition-score-card';
import { StepsCard } from '@/components/home/steps-card';
import { WaterCard } from '@/components/home/water-card';
import { WavingHand } from '@/components/home/waving-hand';
import { ThemedText } from '@/components/themed-text';
import { CalorieRing } from '@/components/ui/calorie-ring';
import { EmptyState } from '@/components/ui/empty-state';
import { QuickAction } from '@/components/ui/quick-action';
import { ScreenScrollView } from '@/components/ui/screen-scroll-view';
import { SectionHeader } from '@/components/ui/section-header';
import { getIngredientById } from '@/data/seed/ingredients';
import { getRecipeById } from '@/data/seed/recipes';
import { useDailyNutrition } from '@/hooks/useDailyNutrition';
import { useNutritionScore } from '@/hooks/useNutritionScore';
import { calculateDailyTargets, calculateRecipeNutrition, scaleForServings } from '@/lib/nutrition';
import { todayKey } from '@/lib/date';
import { Colors, LoginButtonGreen, LoginGradientAccent, Spacing } from '@/constants/theme';
const theme = Colors.light;
import { insightService } from '@/services/ai/insightService';
import { foodLogStore } from '@/store/foodLogStore';
import { mealPlanStore } from '@/store/mealPlanStore';
import { profileStore } from '@/store/profileStore';
import { waterStore } from '@/store/waterStore';
import { router } from 'expo-router';
const MEAL_ORDER = ['breakfast', 'brunch', 'lunch', 'dinner', 'snack'];
function greetingKey() {
  const hour = new Date().getHours();
  if (hour < 12) return 'home.greetingMorning';
  if (hour < 18) return 'home.greetingAfternoon';
  return 'home.greetingEvening';
}
function HomeScreen() {
  const { t } = useTranslation();
  function showComingSoon(feature) {
    Alert.alert(feature, t('home.comingSoon'));
  }
  const profile = profileStore.profile;
  const [date, setDate] = useState(todayKey());
  const {
    meals,
    total
  } = useDailyNutrition(date);
  const scoreResult = useNutritionScore(date);
  const waterMl = waterStore.totalForDate(date);
  const addWater = waterStore.addWater;
  const planItems = mealPlanStore.itemsForDate(date);
  const loggedEntries = foodLogStore.entriesForDate(date);
  const targets = useMemo(() => profile ? calculateDailyTargets(profile) : undefined, [profile]);
  const nextMeal = useMemo(() => {
    const loggedRecipeIds = new Set(loggedEntries.map(entry => `${entry.mealType}:${entry.recipeId}`));
    const pending = planItems.filter(item => !loggedRecipeIds.has(`${item.mealType}:${item.recipeId}`)).sort((a, b) => MEAL_ORDER.indexOf(a.mealType) - MEAL_ORDER.indexOf(b.mealType));
    const item = pending[0];
    if (!item) return undefined;
    const recipe = getRecipeById(item.recipeId);
    if (!recipe) return undefined;
    const calories = scaleForServings(calculateRecipeNutrition(recipe, getIngredientById), item.servings).nutrition.calories;
    return {
      recipe,
      mealType: item.mealType,
      calories
    };
  }, [planItems, loggedEntries]);
  if (!profile || !targets) return null;
  return <ScreenScrollView gap={Spacing.three}>
      <View style={styles.headerRow}>
        <View style={styles.headerTextColumn}>
          <View style={styles.greetingRow}>
            <ThemedText type="headline" style={styles.name} color={theme.text}>
              {t(greetingKey())}, {profile.name.split(' ')[0]}
            </ThemedText>
            <WavingHand size={24} />
          </View>
          <ThemedText type="small" color={theme.textSecondary}>
            {t('home.trackSubtitle')}
          </ThemedText>
        </View>
        <View style={styles.avatar}>
          <SymbolView name="person.fill" size={22} tintColor={LoginButtonGreen} />
        </View>
      </View>

      <DateStrip selectedDate={date} onSelectDate={setDate} style={styles.dateStrip} />

      <View style={styles.nutritionCard}>
        <View style={styles.nutritionHeader}>
          <ThemedText type="smallBold" color={theme.text}>{t('home.dailyCalories')}</ThemedText>
          <View style={styles.calorieBadge}>
            <ThemedText type="caption" color={theme.primary}>
              {targets.calories} {t('home.kcalGoal')}
            </ThemedText>
          </View>
        </View>
        <View style={styles.ringSection}>
          <CalorieRing consumed={total.nutrition.calories} target={targets.calories} size={140} strokeWidth={12} />
        </View>
      </View>

      <View style={styles.macroRow}>
        <MacroCard label={t('home.protein')} value={total.nutrition.protein} target={targets.protein} color={theme.primary} />
        <MacroCard label={t('home.carbs')} value={total.nutrition.carbs} target={targets.carbs} color={theme.secondary} />
        <MacroCard label={t('home.fat')} value={total.nutrition.fat} target={targets.fat} color={theme.warning} />
      </View>

      <WaterCard consumedMl={waterMl} targetMl={targets.water} onAdd={amount => addWater(date, amount)} />

      <StepsCard />

      {scoreResult && <NutritionScoreCard score={scoreResult.score} explanation={scoreResult.explanation} />}

      <AiInsightCard insight={scoreResult ? insightService.getDailyInsight(scoreResult) : t('home.defaultInsight')} />

      {nextMeal && <View style={styles.section}>
          <SectionHeader title={t('home.nextMeal')} />
          <MealRow recipeId={nextMeal.recipe.id} mealType={nextMeal.mealType} title={nextMeal.recipe.title} imageUrl={nextMeal.recipe.imageUrl} calories={nextMeal.calories} />
        </View>}

      <View style={styles.section}>
        <SectionHeader title={t('home.todaysMeals')} />
        {meals.length === 0 ? <EmptyState icon={{
        ios: 'fork.knife',
        android: 'restaurant_menu',
        web: 'restaurant_menu'
      }} title={t('home.emptyDayTitle')} message={t('home.emptyDayMessage')} actionLabel={t('home.browseRecipes')} onAction={() => router.push('/recipes')} /> : <View style={styles.mealList}>
            {meals.map(meal => <MealRow key={meal.id} recipeId={meal.recipeId} mealType={meal.mealType} title={meal.recipeTitle} imageUrl={meal.recipeImageUrl} calories={meal.profile.nutrition.calories} />)}
          </View>}
      </View>

      <View style={styles.section}>
        <SectionHeader title={t('home.quickActions')} />
        <View style={styles.quickActionsGrid}>
          <QuickAction icon={{
          ios: 'plus.circle.fill',
          android: 'add_circle',
          web: 'add_circle'
        }} label={t('home.addMeal')} onPress={() => router.push('/recipes')} />
          <QuickAction icon={{
          ios: 'camera.fill',
          android: 'photo_camera',
          web: 'photo_camera'
        }} label={t('home.scanFood')} onPress={() => showComingSoon(t('home.scanFood'))} />
          <QuickAction icon={{
          ios: 'sparkles',
          android: 'auto_awesome',
          web: 'auto_awesome'
        }} label={t('home.aiRecipe')} onPress={() => showComingSoon(t('home.aiRecipe'))} />
          <QuickAction icon={{
          ios: 'cart.fill',
          android: 'shopping_cart',
          web: 'shopping_cart'
        }} label={t('home.shoppingList')} onPress={() => showComingSoon(t('home.shoppingList'))} />
          <QuickAction icon={{
          ios: 'scalemass.fill',
          android: 'monitor_weight',
          web: 'monitor_weight'
        }} label={t('home.addWeight')} onPress={() => router.push('/progress')} />
          <QuickAction icon={{
          ios: 'drop.fill',
          android: 'water_drop',
          web: 'water_drop'
        }} label={t('home.addWater')} onPress={() => addWater(date, 250)} />
        </View>
      </View>
    </ScreenScrollView>;
}
export default observer(HomeScreen);
const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.background,
    borderWidth: 2,
    borderColor: LoginButtonGreen,
    alignItems: 'center',
    justifyContent: 'center'
  },
  headerTextColumn: {
    flex: 1,
    gap: Spacing.half
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one
  },
  name: {
    flexShrink: 1
  },
  dateStrip: {
    marginTop: -Spacing.one
  },
  nutritionCard: {
    backgroundColor: theme.background,
    borderColor: theme.border,
    borderWidth: 1,
    borderRadius: 20,
    padding: Spacing.three,
    gap: Spacing.four
  },
  nutritionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  calorieBadge: {
    backgroundColor: LoginGradientAccent,
    borderRadius: 999,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one
  },
  ringSection: {
    alignItems: 'center',
    gap: Spacing.two
  },
  macroRow: {
    flexDirection: 'row',
    gap: Spacing.two
  },
  section: {
    gap: Spacing.three
  },
  mealList: {
    gap: Spacing.two
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.three,
    justifyContent: 'space-between'
  }
});
