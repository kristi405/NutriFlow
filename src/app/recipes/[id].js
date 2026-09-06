import { ThemedText } from '@/components/themed-text';
import { EmptyState } from '@/components/ui/empty-state';
import { RecipeImage } from '@/components/ui/recipe-image';
import { ScreenScrollView } from '@/components/ui/screen-scroll-view';
import { Colors, LoginButtonGreen, LoginGradientAccent, Spacing } from '@/constants/theme';
import { getIngredientById, INGREDIENTS } from '@/data/seed/ingredients';
import { getRecipeById } from '@/data/seed/recipes';
import { calculateRecipeNutrition } from '@/lib/nutrition';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, Modal, Pressable, Share, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { recentlyViewedStore } from '@/store/recentlyViewedStore';

const theme = Colors.light;
const WATER_BLUE = '#2F80ED';
const TOP_BAR_CONTENT_HEIGHT = 52;

const STATS = [
  { key: 'calories', labelKey: 'recipes.calories', color: theme.primary },
  { key: 'protein', labelKey: 'home.protein', color: WATER_BLUE },
  { key: 'fat', labelKey: 'home.fat', color: '#F2994A' },
  { key: 'carbs', labelKey: 'home.carbs', color: '#9B51E0' }
];

const TABS = [
  { key: 'ingredients', labelKey: 'recipes.ingredients', icon: { ios: 'checklist', android: 'checklist', web: 'checklist' } },
  { key: 'steps', labelKey: 'recipes.steps', icon: { ios: 'doc.text.fill', android: 'description', web: 'description' } },
  { key: 'nutrients', labelKey: 'recipes.nutrients', icon: { ios: 'chart.pie.fill', android: 'pie_chart', web: 'pie_chart' } }
];

const NUTRIENT_ROWS = [
  { key: 'fiber', labelKey: 'recipes.fiber', unit: 'g' },
  { key: 'sugar', labelKey: 'recipes.sugar', unit: 'g' },
  { key: 'saturatedFat', labelKey: 'recipes.saturatedFat', unit: 'g' },
  { key: 'cholesterol', labelKey: 'recipes.cholesterol', unit: 'mg' },
  { key: 'sodium', labelKey: 'recipes.sodium', unit: 'mg' },
  { key: 'omega3', labelKey: 'recipes.omega3', unit: 'g' },
  { key: 'omega6', labelKey: 'recipes.omega6', unit: 'g' }
];

const VITAMIN_ROWS = [
  { key: 'vitaminA', labelKey: 'recipes.vitaminA', unit: 'mcg' },
  { key: 'vitaminB1', labelKey: 'recipes.vitaminB1', unit: 'mg' },
  { key: 'vitaminB2', labelKey: 'recipes.vitaminB2', unit: 'mg' },
  { key: 'vitaminB3', labelKey: 'recipes.vitaminB3', unit: 'mg' },
  { key: 'vitaminB5', labelKey: 'recipes.vitaminB5', unit: 'mg' },
  { key: 'vitaminB6', labelKey: 'recipes.vitaminB6', unit: 'mg' },
  { key: 'vitaminB7', labelKey: 'recipes.vitaminB7', unit: 'mcg' },
  { key: 'vitaminB9', labelKey: 'recipes.vitaminB9', unit: 'mcg' },
  { key: 'vitaminB12', labelKey: 'recipes.vitaminB12', unit: 'mcg' },
  { key: 'vitaminC', labelKey: 'recipes.vitaminC', unit: 'mg' },
  { key: 'vitaminD', labelKey: 'recipes.vitaminD', unit: 'mcg' },
  { key: 'vitaminE', labelKey: 'recipes.vitaminE', unit: 'mg' },
  { key: 'vitaminK', labelKey: 'recipes.vitaminK', unit: 'mcg' }
];

const MINERAL_ROWS = [
  { key: 'calcium', labelKey: 'recipes.calcium', unit: 'mg' },
  { key: 'iron', labelKey: 'recipes.iron', unit: 'mg' },
  { key: 'magnesium', labelKey: 'recipes.magnesium', unit: 'mg' },
  { key: 'phosphorus', labelKey: 'recipes.phosphorus', unit: 'mg' },
  { key: 'potassium', labelKey: 'recipes.potassium', unit: 'mg' },
  { key: 'zinc', labelKey: 'recipes.zinc', unit: 'mg' },
  { key: 'copper', labelKey: 'recipes.copper', unit: 'mg' },
  { key: 'manganese', labelKey: 'recipes.manganese', unit: 'mg' },
  { key: 'selenium', labelKey: 'recipes.selenium', unit: 'mcg' },
  { key: 'iodine', labelKey: 'recipes.iodine', unit: 'mcg' }
];

function formatNutrientAmount(value) {
  const amount = value ?? 0;
  if (amount === 0) return '0';
  return amount < 10 ? String(Math.round(amount * 10) / 10) : String(Math.round(amount));
}

// Swapping is only offered for ingredient groups that have several interchangeable
// options in the dataset — meat, fish, vegetables, and grain-based sides.
function isSwappableIngredient(ingredient) {
  if (!ingredient) return false;
  return ingredient.categoryId === 'meat' || ingredient.categoryId === 'fish' || ingredient.subcategoryId === 'vegetables' || ingredient.subcategoryId === 'grains';
}

function swapPoolForIngredient(ingredient, unit) {
  if (!ingredient) return [];
  let pool;
  if (ingredient.categoryId === 'meat') pool = INGREDIENTS.filter(item => item.categoryId === 'meat');else if (ingredient.categoryId === 'fish') pool = INGREDIENTS.filter(item => item.categoryId === 'fish');else if (ingredient.subcategoryId === 'vegetables') pool = INGREDIENTS.filter(item => item.subcategoryId === 'vegetables');else if (ingredient.subcategoryId === 'grains') pool = INGREDIENTS.filter(item => item.subcategoryId === 'grains');else return [];
  // Only offer substitutes that can be measured in the recipe line's existing unit.
  return pool.filter(item => item.id !== ingredient.id && (unit === 'g' || unit === 'ml' || item.gramsPerUnit[unit] !== undefined));
}

export default function RecipeDetailScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { id } = useLocalSearchParams();
  const recipe = getRecipeById(id);
  const [excludedIngredientIds, setExcludedIngredientIds] = useState(() => new Set());
  const [isEditingIngredients, setIsEditingIngredients] = useState(false);
  const [substitutions, setSubstitutions] = useState({});
  const [swapIngredientId, setSwapIngredientId] = useState(null);
  const [activeTab, setActiveTab] = useState('ingredients');
  const [headerHeight, setHeaderHeight] = useState(0);
  const [isScrolledPastImage, setIsScrolledPastImage] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;

  const profile = useMemo(() => {
    if (!recipe) return undefined;
    const activeIngredients = recipe.ingredients.filter(line => !excludedIngredientIds.has(line.ingredientId)).map(line => substitutions[line.ingredientId] ? {
      ...line,
      ingredientId: substitutions[line.ingredientId]
    } : line);
    return calculateRecipeNutrition({
      ...recipe,
      ingredients: activeIngredients
    }, getIngredientById);
  }, [recipe, excludedIngredientIds, substitutions]);
  const nutrition = profile?.nutrition;
  const vitamins = profile?.vitamins;
  const minerals = profile?.minerals;

  const swapLine = swapIngredientId ? recipe?.ingredients.find(line => line.ingredientId === swapIngredientId) : undefined;
  const swapCurrentIngredient = swapLine ? getIngredientById(substitutions[swapLine.ingredientId] ?? swapLine.ingredientId) : undefined;
  const swapCandidates = swapLine ? swapPoolForIngredient(swapCurrentIngredient, swapLine.unit) : [];

  function toggleIngredient(ingredientId) {
    setExcludedIngredientIds(current => {
      const next = new Set(current);
      if (next.has(ingredientId)) next.delete(ingredientId);else next.add(ingredientId);
      return next;
    });
  }

  function handleSelectSwap(newIngredientId) {
    if (swapIngredientId) {
      setSubstitutions(current => ({
        ...current,
        [swapIngredientId]: newIngredientId
      }));
    }
    setSwapIngredientId(null);
  }

  useEffect(() => {
    if (recipe) recentlyViewedStore.recordView(recipe.id);
  }, [recipe]);

  if (!recipe) {
    return <ScreenScrollView>
        <EmptyState icon={{
        ios: 'fork.knife',
        android: 'restaurant_menu',
        web: 'restaurant_menu'
      }} title={t('common.errorTitle')} message={t('common.errorDefault')} actionLabel={t('common.back')} onAction={() => router.back()} />
      </ScreenScrollView>;
  }

  const totalTime = recipe.prepTimeMinutes + recipe.cookTimeMinutes;

  function handleShare() {
    Share.share({
      message: `${recipe.title}\n${recipe.imageUrl}`
    }).catch(() => {});
  }

  const topBarHeight = insets.top + TOP_BAR_CONTENT_HEIGHT;
  const imageHeight = width * (3 / 4);
  const scrollDistance = Math.max(1, imageHeight - topBarHeight);

  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, scrollDistance],
    outputRange: [imageHeight, topBarHeight],
    extrapolate: 'clamp'
  });

  const handleScroll = Animated.event([{
    nativeEvent: {
      contentOffset: {
        y: scrollY
      }
    }
  }], {
    useNativeDriver: true,
    listener: event => {
      const scrolledPast = event.nativeEvent.contentOffset.y >= scrollDistance;
      setIsScrolledPastImage(current => current === scrolledPast ? current : scrolledPast);
    }
  });

  return <LinearGradient colors={[Colors.light.background, Colors.light.primarySoft, LoginGradientAccent]} style={styles.flex1}>
      <View style={[styles.fixedImageWrapper, {
      height: imageHeight
    }]}>
        <RecipeImage uri={recipe.imageUrl} style={styles.image} iconSize={48} />
      </View>

      <View style={[styles.topBar, {
      height: topBarHeight,
      paddingTop: insets.top,
      backgroundColor: isScrolledPastImage ? LoginGradientAccent : 'transparent'
    }]}>
        <Pressable onPress={() => router.back()} hitSlop={8} style={styles.floatingButton}>
          <SymbolView name={{ ios: 'chevron.left', android: 'chevron_left', web: 'chevron_left' }} size={18} tintColor={theme.text} />
        </Pressable>
        <Pressable onPress={handleShare} hitSlop={8} style={styles.floatingButton}>
          <SymbolView name={{ ios: 'square.and.arrow.up', android: 'ios_share', web: 'ios_share' }} size={17} tintColor={theme.text} />
        </Pressable>
      </View>

      <Animated.View style={[styles.headerBlock, {
      transform: [{
        translateY: headerTranslateY
      }]
    }]} onLayout={event => setHeaderHeight(event.nativeEvent.layout.height)}>
        <View style={styles.paddedContainer}>
          <View style={styles.header}>
            <ThemedText type="title" style={styles.title} color={theme.text}>
              {recipe.title}
            </ThemedText>
            <ThemedText type="small" color={theme.textSecondary}>
              {recipe.description}
            </ThemedText>
          </View>

          <View style={styles.metaRow}>
            <MetaItem icon={{ ios: 'clock', android: 'schedule', web: 'schedule' }} label={`${totalTime} ${t('common.min')}`} color={WATER_BLUE} />
            <MetaItem icon={{ ios: 'person.2.fill', android: 'group', web: 'group' }} label={`${recipe.servings} ${t('recipes.servings')}`} />
            <MetaItem icon={{ ios: 'chart.bar.fill', android: 'bar_chart', web: 'bar_chart' }} label={t(`recipes.difficulty.${recipe.difficulty}`, { defaultValue: recipe.difficulty })} color={recipe.difficulty === 'easy' ? theme.primary : theme.textSecondary} />
          </View>

          {nutrition && <View style={styles.statsCard}>
              {STATS.map(stat => <View key={stat.key} style={styles.statItem}>
                  <ThemedText type="smallBold" color={stat.color}>
                    {Math.round(nutrition[stat.key])}
                  </ThemedText>
                  <ThemedText type="caption" color={stat.color}>
                    {t(stat.labelKey)}
                  </ThemedText>
                </View>)}
            </View>}

          <View style={styles.tabBar}>
            {TABS.map(tab => {
            const isActive = activeTab === tab.key;
            return <Pressable key={tab.key} onPress={() => setActiveTab(tab.key)} style={[styles.tabButton, isActive && styles.tabButtonActive]}>
                  <SymbolView name={tab.icon} size={14} tintColor={isActive ? LoginButtonGreen : theme.textSecondary} />
                  <ThemedText type="small" color={isActive ? LoginButtonGreen : theme.textSecondary}>
                    {t(tab.labelKey)}
                  </ThemedText>
                </Pressable>;
          })}
          </View>
        </View>
      </Animated.View>

      <Animated.ScrollView style={styles.flex1} showsVerticalScrollIndicator={false} onScroll={handleScroll} scrollEventThrottle={16} contentContainerStyle={{
      paddingBottom: insets.bottom + Spacing.four
    }}>
        <View style={{
        height: imageHeight
      }} />

        <View style={[styles.headerSpacer, {
        height: headerHeight
      }]} />

        <View style={[styles.paddedContainer, styles.tabContent]}>
          {activeTab === 'ingredients' && <View style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <ThemedText type="headline" color={theme.text}>{t('recipes.ingredients')}</ThemedText>
                <Pressable onPress={() => setIsEditingIngredients(current => !current)} hitSlop={8} style={[styles.editButton, isEditingIngredients && styles.editButtonActive]}>
                  <SymbolView name={isEditingIngredients ? { ios: 'checkmark', android: 'check', web: 'check' } : { ios: 'square.and.pencil', android: 'edit_square', web: 'edit_square' }} size={15} tintColor={isEditingIngredients ? '#ffffff' : LoginButtonGreen} />
                  <ThemedText type="small" color={isEditingIngredients ? '#ffffff' : LoginButtonGreen}>
                    {isEditingIngredients ? t('common.done') : t('common.edit')}
                  </ThemedText>
                </Pressable>
              </View>
              <View style={styles.list}>
                {recipe.ingredients.map(line => {
                const effectiveIngredientId = substitutions[line.ingredientId] ?? line.ingredientId;
                const ingredient = getIngredientById(effectiveIngredientId);
                const isExcluded = excludedIngredientIds.has(line.ingredientId);
                return <View key={line.ingredientId} style={styles.ingredientRow}>
                      {isEditingIngredients && <Pressable onPress={() => toggleIngredient(line.ingredientId)} hitSlop={8}>
                          <SymbolView name={isExcluded ? { ios: 'circle', android: 'radio_button_unchecked', web: 'radio_button_unchecked' } : { ios: 'checkmark.circle.fill', android: 'check_circle', web: 'check_circle' }} size={22} tintColor={isExcluded ? theme.border : theme.primary} />
                        </Pressable>}
                      {isEditingIngredients && !isExcluded && isSwappableIngredient(ingredient) && <Pressable onPress={() => setSwapIngredientId(line.ingredientId)} hitSlop={8}>
                          <SymbolView name={{ ios: 'arrow.triangle.2.circlepath', android: 'sync', web: 'sync' }} size={20} tintColor={LoginButtonGreen} />
                        </Pressable>}
                      <View style={styles.ingredientCard}>
                        <ThemedText type="small" color={isExcluded ? theme.textSecondary : theme.text} style={isExcluded && styles.strikethrough}>
                          {ingredient?.name ?? line.ingredientId}
                        </ThemedText>
                        <ThemedText type="small" color={theme.textSecondary}>
                          {line.quantity} {line.unit}
                        </ThemedText>
                      </View>
                    </View>;
              })}
              </View>
            </View>}

          {activeTab === 'steps' && <View style={[styles.card, styles.stepsCard]}>
              <ThemedText type="headline" color={theme.text} style={styles.cardTitle}>
                {t('recipes.steps')}
              </ThemedText>
              <View style={styles.stepsList}>
                {recipe.steps.map(step => <View key={step.order} style={styles.stepRow}>
                    <View style={styles.stepNumber}>
                      <ThemedText type="caption" color="#ffffff">{step.order}</ThemedText>
                    </View>
                    <ThemedText type="small" color={theme.text} style={styles.stepText}>
                      {step.instruction}
                    </ThemedText>
                  </View>)}
              </View>
            </View>}

          {activeTab === 'nutrients' && nutrition && <View style={styles.nutrientsGroup}>
              <View style={styles.card}>
                <ThemedText type="headline" color={theme.text} style={styles.cardTitle}>
                  {t('recipes.nutrients')}
                </ThemedText>
                {NUTRIENT_ROWS.map((row, index) => {
                const isLast = index === NUTRIENT_ROWS.length - 1;
                return <View key={row.key} style={[styles.listRow, isLast && styles.listRowLast]}>
                      <ThemedText type="small" color={theme.text}>{t(row.labelKey)}</ThemedText>
                      <ThemedText type="small" color={theme.textSecondary}>
                        {formatNutrientAmount(nutrition[row.key])} {row.unit}
                      </ThemedText>
                    </View>;
              })}
              </View>

              <View style={styles.card}>
                <ThemedText type="headline" color={theme.text} style={styles.cardTitle}>
                  {t('recipes.vitamins')}
                </ThemedText>
                {VITAMIN_ROWS.map((row, index) => {
                const isLast = index === VITAMIN_ROWS.length - 1;
                return <View key={row.key} style={[styles.listRow, isLast && styles.listRowLast]}>
                      <ThemedText type="small" color={theme.text}>{t(row.labelKey)}</ThemedText>
                      <ThemedText type="small" color={theme.textSecondary}>
                        {formatNutrientAmount(vitamins?.[row.key])} {row.unit}
                      </ThemedText>
                    </View>;
              })}
              </View>

              <View style={styles.card}>
                <ThemedText type="headline" color={theme.text} style={styles.cardTitle}>
                  {t('recipes.minerals')}
                </ThemedText>
                {MINERAL_ROWS.map((row, index) => {
                const isLast = index === MINERAL_ROWS.length - 1;
                return <View key={row.key} style={[styles.listRow, isLast && styles.listRowLast]}>
                      <ThemedText type="small" color={theme.text}>{t(row.labelKey)}</ThemedText>
                      <ThemedText type="small" color={theme.textSecondary}>
                        {formatNutrientAmount(minerals?.[row.key])} {row.unit}
                      </ThemedText>
                    </View>;
              })}
              </View>
            </View>}
        </View>
      </Animated.ScrollView>

      <Modal visible={!!swapIngredientId} transparent animationType="slide" onRequestClose={() => setSwapIngredientId(null)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setSwapIngredientId(null)}>
          <Pressable style={styles.modalSheet} onPress={event => event.stopPropagation()}>
            <View style={styles.modalHeader}>
              <View>
                <ThemedText type="smallBold" color={theme.text}>{t('recipes.swapTitle')}</ThemedText>
                <ThemedText type="caption" color={theme.textSecondary}>{t('recipes.swapSubtitle')}</ThemedText>
              </View>
              <Pressable onPress={() => setSwapIngredientId(null)} hitSlop={8} style={styles.modalCloseButton}>
                <SymbolView name={{ ios: 'xmark', android: 'close', web: 'close' }} size={16} tintColor={LoginButtonGreen} />
              </Pressable>
            </View>

            {swapCandidates.length === 0 ? <ThemedText type="small" color={theme.textSecondary}>{t('recipes.swapEmpty')}</ThemedText> : <View style={styles.swapList}>
                {swapCandidates.map(item => <Pressable key={item.id} onPress={() => handleSelectSwap(item.id)} style={styles.swapRow}>
                    <View style={styles.swapIconWrapper}>
                      <SymbolView name={{ ios: 'leaf.fill', android: 'eco', web: 'eco' }} size={16} tintColor={LoginButtonGreen} />
                    </View>
                    <View style={styles.swapTextWrapper}>
                      <ThemedText type="smallBold" color={theme.text} numberOfLines={1}>{item.name}</ThemedText>
                      <ThemedText type="small" color={theme.textSecondary}>{Math.round(item.per100g.nutrition.calories)} {t('common.kcal')} / 100g</ThemedText>
                    </View>
                    <SymbolView name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }} size={16} tintColor={theme.textSecondary} />
                  </Pressable>)}
              </View>}
          </Pressable>
        </Pressable>
      </Modal>
    </LinearGradient>;
}

function MetaItem({ icon, label, color = theme.textSecondary }) {
  return <View style={styles.metaItem}>
      <SymbolView name={icon} size={14} tintColor={color} />
      <ThemedText type="small" color={color}>{label}</ThemedText>
    </View>;
}

const styles = StyleSheet.create({
  flex1: {
    flex: 1
  },
  fixedImageWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 0
  },
  image: {
    width: '100%',
    height: '100%'
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four
  },
  floatingButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center'
  },
  paddedContainer: {
    paddingHorizontal: Spacing.four,
    gap: Spacing.three
  },
  tabContent: {
    paddingTop: Spacing.three
  },
  headerBlock: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 5,
    backgroundColor: LoginGradientAccent,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
    paddingBottom: Spacing.three
  },
  headerSpacer: {
    backgroundColor: LoginGradientAccent
  },
  header: {
    gap: Spacing.half,
    marginTop: Spacing.three
  },
  title: {
    fontSize: 22,
    lineHeight: 28
  },
  metaRow: {
    flexDirection: 'row',
    gap: Spacing.four
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: theme.background,
    borderColor: theme.border,
    borderWidth: 1,
    paddingVertical: Spacing.three,
    borderRadius: 16
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 2
  },
  tabBar: {
    flexDirection: 'row',
    gap: Spacing.four
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingBottom: Spacing.two,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent'
  },
  tabButtonActive: {
    borderBottomColor: LoginButtonGreen
  },
  section: {
    gap: Spacing.three
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  list: {
    gap: Spacing.two
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two
  },
  ingredientCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.background,
    borderColor: theme.border,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two
  },
  cardTitle: {
    marginBottom: Spacing.two
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: theme.primarySoft,
    borderRadius: 999,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two
  },
  editButtonActive: {
    backgroundColor: LoginButtonGreen
  },
  card: {
    backgroundColor: theme.background,
    borderColor: theme.border,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three
  },
  stepsCard: {
    paddingBottom: Spacing.four
  },
  nutrientsGroup: {
    gap: Spacing.three
  },
  stepsList: {
    gap: Spacing.four
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.two,
    borderBottomWidth: 1,
    borderBottomColor: theme.border
  },
  listRowLast: {
    borderBottomWidth: 0
  },
  strikethrough: {
    textDecorationLine: 'line-through'
  },
  stepRow: {
    flexDirection: 'row',
    gap: Spacing.two
  },
  stepNumber: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: theme.primary,
    alignItems: 'center',
    justifyContent: 'center'
  },
  stepText: {
    flex: 1
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
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.primarySoft,
    alignItems: 'center',
    justifyContent: 'center'
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
  swapIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.primarySoft,
    alignItems: 'center',
    justifyContent: 'center'
  },
  swapTextWrapper: {
    flex: 1,
    gap: 2
  }
});
