import { ThemedText } from '@/components/themed-text';
import { EmptyState } from '@/components/ui/empty-state';
import { RecipeImage } from '@/components/ui/recipe-image';
import { ScreenScrollView } from '@/components/ui/screen-scroll-view';
import { Colors, LoginButtonGreen, LoginGradientAccent, Spacing } from '@/constants/theme';
import { getIngredientById } from '@/data/seed/ingredients';
import { getRecipeById } from '@/data/seed/recipes';
import { calculateRecipeNutrition } from '@/lib/nutrition';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, Pressable, Share, StyleSheet, useWindowDimensions, View } from 'react-native';
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
  { key: 'ingredients', labelKey: 'recipes.ingredients', icon: 'checklist' },
  { key: 'steps', labelKey: 'recipes.steps', icon: 'doc.text.fill' },
  { key: 'nutrients', labelKey: 'recipes.nutrients', icon: 'chart.pie.fill' }
];

const NUTRIENT_ROWS = [
  { key: 'fiber', labelKey: 'recipes.fiber', unit: 'g' },
  { key: 'sugar', labelKey: 'recipes.sugar', unit: 'g' },
  { key: 'saturatedFat', labelKey: 'recipes.saturatedFat', unit: 'g' },
  { key: 'cholesterol', labelKey: 'recipes.cholesterol', unit: 'mg' },
  { key: 'sodium', labelKey: 'recipes.sodium', unit: 'mg' }
];

export default function RecipeDetailScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { id } = useLocalSearchParams();
  const recipe = getRecipeById(id);
  const [excludedIngredientIds, setExcludedIngredientIds] = useState(() => new Set());
  const [isEditingIngredients, setIsEditingIngredients] = useState(false);
  const [activeTab, setActiveTab] = useState('ingredients');
  const [headerHeight, setHeaderHeight] = useState(0);
  const [isScrolledPastImage, setIsScrolledPastImage] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;

  const nutrition = useMemo(() => {
    if (!recipe) return undefined;
    const activeIngredients = recipe.ingredients.filter(line => !excludedIngredientIds.has(line.ingredientId));
    return calculateRecipeNutrition({
      ...recipe,
      ingredients: activeIngredients
    }, getIngredientById).nutrition;
  }, [recipe, excludedIngredientIds]);

  function toggleIngredient(ingredientId) {
    setExcludedIngredientIds(current => {
      const next = new Set(current);
      if (next.has(ingredientId)) next.delete(ingredientId);else next.add(ingredientId);
      return next;
    });
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
          <SymbolView name="chevron.left" size={18} tintColor={theme.text} />
        </Pressable>
        <Pressable onPress={handleShare} hitSlop={8} style={styles.floatingButton}>
          <SymbolView name="square.and.arrow.up" size={17} tintColor={theme.text} />
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
            <MetaItem icon="clock" label={`${totalTime} ${t('common.min')}`} color={WATER_BLUE} />
            <MetaItem icon="person.2.fill" label={`${recipe.servings} ${t('recipes.servings')}`} />
            <MetaItem icon="chart.bar.fill" label={t(`recipes.difficulty.${recipe.difficulty}`, { defaultValue: recipe.difficulty })} color={recipe.difficulty === 'easy' ? theme.primary : theme.textSecondary} />
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
                  <SymbolView name={isEditingIngredients ? 'checkmark' : 'square.and.pencil'} size={15} tintColor={isEditingIngredients ? '#ffffff' : LoginButtonGreen} />
                  <ThemedText type="small" color={isEditingIngredients ? '#ffffff' : LoginButtonGreen}>
                    {isEditingIngredients ? t('common.done') : t('common.edit')}
                  </ThemedText>
                </Pressable>
              </View>
              <View style={styles.list}>
                {recipe.ingredients.map(line => {
                const ingredient = getIngredientById(line.ingredientId);
                const isExcluded = excludedIngredientIds.has(line.ingredientId);
                const RowComponent = isEditingIngredients ? Pressable : View;
                return <RowComponent key={line.ingredientId} onPress={isEditingIngredients ? () => toggleIngredient(line.ingredientId) : undefined} style={styles.ingredientRow}>
                      {isEditingIngredients && <SymbolView name={isExcluded ? 'circle' : 'checkmark.circle.fill'} size={22} tintColor={isExcluded ? theme.border : theme.primary} />}
                      <View style={styles.ingredientCard}>
                        <ThemedText type="small" color={isExcluded ? theme.textSecondary : theme.text} style={isExcluded && styles.strikethrough}>
                          {ingredient?.name ?? line.ingredientId}
                        </ThemedText>
                        <ThemedText type="small" color={theme.textSecondary}>
                          {line.quantity} {line.unit}
                        </ThemedText>
                      </View>
                    </RowComponent>;
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

          {activeTab === 'nutrients' && nutrition && <View style={styles.card}>
              <ThemedText type="headline" color={theme.text} style={styles.cardTitle}>
                {t('recipes.nutrients')}
              </ThemedText>
              {NUTRIENT_ROWS.map((row, index) => {
              const isLast = index === NUTRIENT_ROWS.length - 1;
              return <View key={row.key} style={[styles.listRow, isLast && styles.listRowLast]}>
                    <ThemedText type="small" color={theme.text}>{t(row.labelKey)}</ThemedText>
                    <ThemedText type="small" color={theme.textSecondary}>
                      {Math.round(nutrition[row.key])} {row.unit}
                    </ThemedText>
                  </View>;
            })}
            </View>}
        </View>
      </Animated.ScrollView>
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
  }
});
