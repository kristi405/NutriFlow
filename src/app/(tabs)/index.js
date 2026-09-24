import { useEffect, useMemo, useState } from 'react';
import { SymbolView } from 'expo-symbols';
import { observer } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { ArticleCard } from '@/components/home/article-card';
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
import { PremiumCard } from '@/components/ui/premium-card';
import { QuickAction } from '@/components/ui/quick-action';
import { ScreenScrollView } from '@/components/ui/screen-scroll-view';
import { SectionHeader } from '@/components/ui/section-header';
import { getIngredientById, getRecipeById } from '@/data/catalog';
import { useDailyNutrition } from '@/hooks/useDailyNutrition';
import { useNutritionScore } from '@/hooks/useNutritionScore';
import { useStepCount } from '@/hooks/useStepCount';
import { calculateDailyTargets, calculateRecipeNutrition, scaleForServings } from '@/lib/nutrition';
import { generateDailyMealPlan } from '@/lib/mealPlanGenerator';
import { todayKey } from '@/lib/date';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { articleStore } from '@/store/articleStore';
import { localeStore } from '@/store/localeStore';
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
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  function showComingSoon(feature) {
    Alert.alert(feature, t('home.comingSoon'));
  }
  const profile = profileStore.profile;
  const [date, setDate] = useState(todayKey());
  const { total } = useDailyNutrition(date);
  const scoreResult = useNutritionScore(date);
  const { steps } = useStepCount();
  const waterMl = waterStore.totalForDate(date);
  const addWater = waterStore.addWater;
  const planItems = mealPlanStore.itemsForDate(date);
  const loggedEntries = foodLogStore.entriesForDate(date);
  const targets = useMemo(() => profile ? calculateDailyTargets(profile) : undefined, [profile]);
  useEffect(() => {
    if (!targets) return;
    const today = todayKey();
    if (mealPlanStore.itemsForDate(today).length > 0) return;
    const generated = generateDailyMealPlan(targets.calories);
    generated.forEach(item => mealPlanStore.addItem({ date: today, ...item }));
  }, [targets]);
  useEffect(() => {
    if (!localeStore.hasHydrated) return;
    articleStore.ensureTodayArticle(todayKey(), localeStore.language);
  }, [localeStore.hasHydrated, localeStore.language]);
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
  const allMealsEaten = planItems.length > 0 && planItems.every(item => loggedEntries.some(entry => entry.mealType === item.mealType && entry.recipeId === item.recipeId));
  if (!profile || !targets) return null;
  const consumedCalories = Math.round(total.nutrition.calories);
  const burnedCalories = Math.round(steps * profile.weightKg * 0.0005);
  const remainingCalories = Math.max(0, targets.calories - consumedCalories + burnedCalories);
  return <ScreenScrollView gap={Spacing.three}>
      <Pressable onPress={() => router.push('/profile')} style={styles.headerRow}>
        <View style={styles.avatar}>
          <SymbolView name={{ ios: 'person.fill', android: 'person', web: 'person' }} size={22} tintColor={theme.accent} />
        </View>
        <View style={styles.headerTextColumn}>
          <View style={styles.greetingRow}>
            <ThemedText type="headline" style={styles.name} color={theme.text} numberOfLines={1}>
              {t(greetingKey())}, {profile.name.split(' ')[0]}
            </ThemedText>
            <WavingHand size={24} />
          </View>
          <ThemedText type="small" color={theme.textSecondary}>
            {t('home.trackSubtitle')}
          </ThemedText>
        </View>
        <View style={styles.settingsButton}>
          <SymbolView name={{ ios: 'gearshape', android: 'settings', web: 'settings' }} size={30} tintColor={theme.textSecondary} />
        </View>
      </Pressable>

      <DateStrip selectedDate={date} onSelectDate={setDate} style={styles.dateStrip} />

      <View style={styles.nutritionCard}>
        <View style={styles.nutritionHeader}>
          <ThemedText type="smallBold" color={theme.text}>{t('home.dailyCalories')}</ThemedText>
          <View style={styles.calorieBadge}>
            <ThemedText type="caption" style={styles.calorieBadgeText} color={theme.primary}>
              {targets.calories} {t('home.kcalGoal')}
            </ThemedText>
          </View>
        </View>
        <View style={styles.ringRow}>
          <CalorieRing consumed={total.nutrition.calories} target={targets.calories} size={140} strokeWidth={12} />
          <View style={styles.calorieStatsColumn}>
            <View style={styles.calorieStatRow}>
              <SymbolView name={{ ios: 'fork.knife', android: 'restaurant_menu', web: 'restaurant_menu' }} size={18} tintColor={theme.primary} />
              <View>
                <ThemedText type="smallBold" style={styles.calorieStatValue} color={theme.primary}>{consumedCalories} {t('common.kcal')}</ThemedText>
                <ThemedText type="caption" color={theme.textSecondary}>{t('home.consumed')}</ThemedText>
              </View>
            </View>
            <View style={styles.calorieStatRow}>
              <SymbolView name={{ ios: 'flame.fill', android: 'local_fire_department', web: 'local_fire_department' }} size={18} tintColor={theme.warning} />
              <View>
                <ThemedText type="smallBold" style={styles.calorieStatValue} color={theme.warning}>{burnedCalories} {t('common.kcal')}</ThemedText>
                <ThemedText type="caption" color={theme.textSecondary}>{t('home.burned')}</ThemedText>
              </View>
            </View>
            <View style={styles.calorieStatRow}>
              <SymbolView name={{ ios: 'gauge', android: 'speed', web: 'speed' }} size={18} tintColor={theme.secondary} />
              <View>
                <ThemedText type="smallBold" style={styles.calorieStatValue} color={theme.secondary}>{remainingCalories} {t('common.kcal')}</ThemedText>
                <ThemedText type="caption" color={theme.textSecondary}>{t('home.remaining')}</ThemedText>
              </View>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.macroRow}>
        <MacroCard label={t('home.protein')} value={total.nutrition.protein} target={targets.protein} color="#2F80ED" trackColor="#DCEBFC" detailed />
        <MacroCard label={t('home.fat')} value={total.nutrition.fat} target={targets.fat} color="#F2994A" trackColor="#FCE7D3" detailed />
        <MacroCard label={t('home.carbs')} value={total.nutrition.carbs} target={targets.carbs} color="#9B51E0" trackColor="#EEE0FA" detailed />
      </View>

      <WaterCard consumedMl={waterMl} targetMl={targets.water} onAdd={amount => addWater(date, amount)} />

      <StepsCard />

      {scoreResult && <NutritionScoreCard score={scoreResult.score} explanation={scoreResult.explanation} />}

      <SectionHeader title={t('articles.title')} seeAllHref="/articles" />
      <ArticleCard article={articleStore.todayArticle} onPress={() => router.push({ pathname: '/article/[id]', params: { id: articleStore.todayArticle.id } })} />

      <PremiumCard />

      {nextMeal ? <View style={styles.section}>
          <SectionHeader title={t('home.nextMeal')} />
          <MealRow recipeId={nextMeal.recipe.id} mealType={nextMeal.mealType} title={nextMeal.recipe.title} imageUrl={nextMeal.recipe.imageUrl} calories={nextMeal.calories} />
        </View> : <View style={styles.section}>
          <SectionHeader title={t('home.nextMeal')} />
          {allMealsEaten ? <View style={styles.planCompleteCard}>
              <View style={styles.planCompleteIconWrapper}>
                <SymbolView name={{ ios: 'checkmark.circle.fill', android: 'check_circle', web: 'check_circle' }} size={32} tintColor="#ffffff" />
              </View>
              <ThemedText type="headline" color={theme.text} style={styles.centerText}>
                {t('home.planCompleteTitle')}
              </ThemedText>
              <ThemedText type="small" color={theme.textSecondary} style={styles.centerText}>
                {t('home.planCompleteMessage')}
              </ThemedText>
            </View> : <EmptyState icon={{
        ios: 'fork.knife',
        android: 'restaurant_menu',
        web: 'restaurant_menu'
      }} title={t('home.emptyDayTitle')} message={t('home.emptyDayMessage')} actionLabel={t('home.browseRecipes')} onAction={() => router.push('/recipes')} />}
        </View>}

      <View style={styles.section}>
        <SectionHeader title={t('home.quickActions')} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickActionsRow}>
          <QuickAction icon={{
          ios: 'plus.circle.fill',
          android: 'add_circle',
          web: 'add_circle'
        }} label={t('home.addMeal')} color={theme.accent} onPress={() => router.push('/recipes')} />
          <QuickAction icon={{
          ios: 'camera.fill',
          android: 'photo_camera',
          web: 'photo_camera'
        }} label={t('home.scanFood')} color="#EB5757" onPress={() => showComingSoon(t('home.scanFood'))} />
          <QuickAction icon={{
          ios: 'sparkles',
          android: 'auto_awesome',
          web: 'auto_awesome'
        }} label={t('home.aiRecipe')} color="#9B51E0" onPress={() => showComingSoon(t('home.aiRecipe'))} />
          <QuickAction icon={{
          ios: 'cart.fill',
          android: 'shopping_cart',
          web: 'shopping_cart'
        }} label={t('home.shoppingList')} color="#F2994A" onPress={() => showComingSoon(t('home.shoppingList'))} />
          <QuickAction icon={{
          ios: 'scalemass.fill',
          android: 'monitor_weight',
          web: 'monitor_weight'
        }} label={t('home.addWeight')} color="#5B6EE1" onPress={() => router.push('/progress')} />
          <QuickAction icon={{
          ios: 'drop.fill',
          android: 'water_drop',
          web: 'water_drop'
        }} label={t('home.addWater')} color="#2F80ED" onPress={() => addWater(date, 250)} />
        </ScrollView>
      </View>
    </ScreenScrollView>;
}
export default observer(HomeScreen);
const createStyles = theme => StyleSheet.create({
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
    borderColor: theme.accent,
    alignItems: 'center',
    justifyContent: 'center'
  },
  settingsButton: {
    width: 40,
    height: 40,
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
    flexShrink: 1,
    fontSize: 17,
    lineHeight: 22
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
    backgroundColor: theme.accentSoft,
    borderRadius: 999,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one
  },
  calorieBadgeText: {
    fontWeight: '700'
  },
  calorieStatValue: {
    fontSize: 16,
    lineHeight: 22
  },
  ringRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.four
  },
  calorieStatsColumn: {
    gap: Spacing.three
  },
  calorieStatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one
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
  quickActionsRow: {
    flexDirection: 'row',
    gap: Spacing.three,
    paddingRight: Spacing.two
  },
  planCompleteCard: {
    alignItems: 'center',
    gap: Spacing.two,
    backgroundColor: theme.accentSoft,
    borderColor: theme.accent,
    borderWidth: 1.5,
    borderRadius: 20,
    paddingVertical: Spacing.five,
    paddingHorizontal: Spacing.four
  },
  planCompleteIconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.accent,
    alignItems: 'center',
    justifyContent: 'center'
  },
  centerText: {
    textAlign: 'center'
  }
});
