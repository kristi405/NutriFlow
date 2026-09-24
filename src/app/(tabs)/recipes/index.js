import { useEffect, useMemo, useRef, useState } from 'react';
import { router } from 'expo-router';
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from 'expo-speech-recognition';
import { SymbolView } from 'expo-symbols';
import { observer } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';
import { Alert, Animated, Easing, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { EmptyState } from '@/components/ui/empty-state';
import { RecentRecipeRow } from '@/components/ui/recent-recipe-row';
import { RecipeCard } from '@/components/ui/recipe-card';
import { RecipeImage } from '@/components/ui/recipe-image';
import { ScreenScrollView } from '@/components/ui/screen-scroll-view';
import { SectionHeader } from '@/components/ui/section-header';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { getCategories, getIngredientById, getRecipeById, getRecipes } from '@/data/catalog';
import { calculateRecipeNutrition } from '@/lib/nutrition';
import { favoritesStore } from '@/store/favoritesStore';
import { myRecipesStore } from '@/store/myRecipesStore';
import { recentlyViewedStore } from '@/store/recentlyViewedStore';

const FAVORITE_RED = '#E0245E';
const MY_RECIPES_FILTER = 'my-recipes';

// Matching photos for the non-category filter chips (all/my recipes/favorites),
// so they get the same round-photo treatment as the real categories below.
const ALL_CATEGORIES_IMAGE = 'https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=800';
const MY_RECIPES_IMAGE = 'https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=800';
const FAVORITES_IMAGE = 'https://images.unsplash.com/photo-1493770348161-369560ae357d?w=800';

const CONTAINER_PADDING = 20;
const CARD_GAP = Spacing.two;

function chunkPairs(items) {
  const pairs = [];
  for (let index = 0; index < items.length; index += 2) {
    pairs.push(items.slice(index, index + 2));
  }
  return pairs;
}

function PulseItem({ active, onPress, style, children }) {
  const scale = useRef(new Animated.Value(1)).current;
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (!active) return;
    Animated.sequence([Animated.timing(scale, { toValue: 1.18, duration: 160, easing: Easing.out(Easing.quad), useNativeDriver: true }), Animated.spring(scale, { toValue: 1, friction: 4, tension: 140, useNativeDriver: true })]).start();
  }, [active]);
  return <Pressable onPress={onPress} style={style}>
      <Animated.View style={{ alignItems: 'center', gap: 4, transform: [{ scale }] }}>{children}</Animated.View>
    </Pressable>;
}

function RecipesScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [query, setQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState(null);
  const contentAnim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    contentAnim.setValue(0);
    Animated.timing(contentAnim, { toValue: 1, duration: 320, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }, [selectedFilter]);
  const categories = getCategories();
  const recipes = getRecipes();

  useSpeechRecognitionEvent('result', event => {
    const transcript = event.results[0]?.transcript;
    if (transcript) setQuery(transcript);
  });
  useSpeechRecognitionEvent('end', () => setIsListening(false));
  useSpeechRecognitionEvent('error', () => setIsListening(false));

  async function handleVoiceSearch() {
    if (isListening) {
      ExpoSpeechRecognitionModule.stop();
      return;
    }
    const result = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!result.granted) {
      Alert.alert(t('recipes.voiceSearch'), t('recipes.voicePermissionDenied'));
      return;
    }
    setIsListening(true);
    ExpoSpeechRecognitionModule.start({
      lang: 'en-US',
      interimResults: true
    });
  }

  const filteredRecipes = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    // The Favorites filter also searches My Recipes, so a favorited own recipe shows up here too.
    const pool = selectedFilter === 'favorites' ? [...recipes, ...myRecipesStore.recipes] : recipes;
    return pool.filter(recipe => {
      const matchesQuery = !normalized || recipe.title.toLowerCase().includes(normalized);
      const matchesFilter = !selectedFilter || (selectedFilter === 'favorites' ? favoritesStore.isFavorite(recipe.id) : recipe.categoryId === selectedFilter);
      return matchesQuery && matchesFilter;
    });
  }, [query, selectedFilter, favoritesStore.favorites.length, myRecipesStore.recipes.length, recipes]);

  const collections = useMemo(() => categories.map(category => ({
    category,
    rows: chunkPairs(filteredRecipes.filter(recipe => recipe.categoryId === category.id))
  })).filter(collection => collection.rows.length > 0), [filteredRecipes, categories]);

  const myRecipesFiltered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return myRecipesStore.recipes.filter(recipe => !normalized || recipe.title.toLowerCase().includes(normalized));
  }, [query, myRecipesStore.recipes.length]);
  const myRecipesRows = useMemo(() => chunkPairs(myRecipesFiltered), [myRecipesFiltered]);

  const addRecipeButton = <Pressable onPress={() => router.push('/add-recipe')} hitSlop={8} accessibilityLabel={t('recipes.addRecipe')} style={({ pressed }) => [styles.addRecipeButton, pressed && styles.addRecipeButtonPressed]}>
      <SymbolView name={{ ios: 'plus', android: 'add', web: 'add' }} size={16} tintColor="#ffffff" />
      <ThemedText type="smallBold" color="#ffffff" style={styles.addRecipeLabel}>{t('recipes.addRecipe')}</ThemedText>
    </Pressable>;

  const recentlyViewed = recentlyViewedStore.recipeIds.map(getRecipeById).filter(Boolean);

  return <ScreenScrollView isTabScreen gap={Spacing.five} horizontalPadding={0}>
      <View style={styles.searchSection}>
        <View style={styles.searchRow}>
          <View style={styles.searchBar}>
            <SymbolView name={{ ios: 'magnifyingglass', android: 'search', web: 'search' }} size={16} tintColor={theme.textSecondary} />
            <TextInput value={query} onChangeText={setQuery} placeholder={t('recipes.searchPlaceholder')} placeholderTextColor={theme.textSecondary} style={styles.searchInput} returnKeyType="search" />
            {query.length > 0 && <Pressable onPress={() => setQuery('')} hitSlop={8}>
                <SymbolView name={{ ios: 'xmark.circle.fill', android: 'cancel', web: 'cancel' }} size={18} tintColor={theme.textSecondary} />
              </Pressable>}
            <Pressable onPress={handleVoiceSearch} hitSlop={8} style={[styles.micButton, isListening && styles.micButtonActive]}>
              <SymbolView name={{ ios: 'mic.fill', android: 'mic', web: 'mic' }} size={20} tintColor={isListening ? '#ffffff' : theme.textSecondary} />
            </Pressable>
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRow} style={{ marginVertical: -10 }}>
          <PulseItem active={!selectedFilter} onPress={() => setSelectedFilter(null)} style={styles.categoryCircleItem}>
            <View style={[styles.categoryImageWrapper, !selectedFilter && styles.categoryImageWrapperActive]}>
              <RecipeImage uri={ALL_CATEGORIES_IMAGE} style={styles.categoryImage} iconSize={16} />
            </View>
            <ThemedText type="caption" color={!selectedFilter ? theme.accent : theme.textSecondary} numberOfLines={2} style={styles.categoryLabel}>
              {t('recipes.allCategories')}
            </ThemedText>
          </PulseItem>
          <PulseItem active={selectedFilter === MY_RECIPES_FILTER} onPress={() => setSelectedFilter(current => current === MY_RECIPES_FILTER ? null : MY_RECIPES_FILTER)} style={styles.categoryCircleItem}>
            <View style={[styles.categoryImageWrapper, selectedFilter === MY_RECIPES_FILTER && styles.myRecipesImageWrapperActive]}>
              <RecipeImage uri={MY_RECIPES_IMAGE} style={styles.categoryImage} iconSize={16} />
            </View>
            <ThemedText type="caption" color={theme.secondary} numberOfLines={2} style={styles.categoryLabel}>
              {t('recipes.myRecipes')}
            </ThemedText>
          </PulseItem>
          <PulseItem active={selectedFilter === 'favorites'} onPress={() => setSelectedFilter(current => current === 'favorites' ? null : 'favorites')} style={styles.categoryCircleItem}>
            <View style={[styles.categoryImageWrapper, selectedFilter === 'favorites' && styles.favoritesImageWrapperActive]}>
              <RecipeImage uri={FAVORITES_IMAGE} style={styles.categoryImage} iconSize={16} />
            </View>
            <ThemedText type="caption" color={FAVORITE_RED} numberOfLines={2} style={styles.categoryLabel}>
              {t('recipes.favorites')}
            </ThemedText>
          </PulseItem>
          {categories.map(category => <PulseItem key={category.id} active={selectedFilter === category.id} onPress={() => setSelectedFilter(current => current === category.id ? null : category.id)} style={styles.categoryCircleItem}>
              <View style={[styles.categoryImageWrapper, selectedFilter === category.id && styles.categoryImageWrapperActive]}>
                <RecipeImage uri={category.imageUrl} style={styles.categoryImage} iconSize={16} />
              </View>
              <ThemedText type="caption" color={selectedFilter === category.id ? theme.accent : theme.textSecondary} numberOfLines={2} style={styles.categoryLabel}>
                {category.name}
              </ThemedText>
            </PulseItem>)}
        </ScrollView>
      </View>

      {recentlyViewed.length > 0 && <View style={[styles.section, styles.recentlyViewedSection]}>
          <View style={styles.paddedX}>
            <SectionHeader title={t('recipes.recentlyViewed')} />
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.recentRow}>
            {recentlyViewed.map(recipe => <RecentRecipeRow key={recipe.id} recipe={recipe} calories={calculateRecipeNutrition(recipe, getIngredientById).nutrition.calories} style={styles.recentCard} />)}
          </ScrollView>
        </View>}

      <Animated.View style={{ gap: Spacing.five, opacity: contentAnim, transform: [{ translateY: contentAnim.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }] }}>
      {selectedFilter === MY_RECIPES_FILTER ? <View style={styles.section}>
          <View style={styles.paddedX}>
            <SectionHeader title={t('recipes.myRecipes')} right={addRecipeButton} />
          </View>
          {myRecipesFiltered.length === 0 ? <View style={styles.paddedX}>
              <EmptyState icon={{ ios: 'book.closed', android: 'menu_book', web: 'menu_book' }} title={t('recipes.myRecipesEmptyTitle')} message={t('recipes.myRecipesEmptyMessage')} actionLabel={t('recipes.addRecipe')} onAction={() => router.push('/add-recipe')} />
            </View> : <View style={[styles.rows, styles.paddedX]}>
              {myRecipesRows.map((pair, index) => <View key={index} style={styles.row}>
                  {pair.map(recipe => <View key={recipe.id} style={styles.cardSlot}>
                      <RecipeCard recipe={recipe} calories={calculateRecipeNutrition(recipe, getIngredientById).nutrition.calories} style={styles.cardFill} />
                    </View>)}
                  {pair.length === 1 && <View style={styles.cardSlot} />}
                </View>)}
            </View>}
        </View> : collections.length === 0 ? <View style={styles.paddedX}>
          <EmptyState icon={{ ios: 'magnifyingglass', android: 'search', web: 'search' }} title={t('recipes.noResults')} message={t('recipes.noResultsMessage')} />
        </View> : collections.map(({ category, rows }, collectionIndex) => <View key={category.id} style={styles.section}>
          <View style={styles.paddedX}>
            <SectionHeader title={category.name} right={collectionIndex === 0 ? addRecipeButton : undefined} />
          </View>
          <View style={[styles.rows, styles.paddedX]}>
            {rows.map((pair, index) => <View key={index} style={styles.row}>
                {pair.map(recipe => <View key={recipe.id} style={styles.cardSlot}>
                    <RecipeCard recipe={recipe} calories={calculateRecipeNutrition(recipe, getIngredientById).nutrition.calories} style={styles.cardFill} />
                  </View>)}
                {pair.length === 1 && <View style={styles.cardSlot} />}
              </View>)}
          </View>
        </View>)}
      </Animated.View>
    </ScreenScrollView>;
}

const createStyles = theme => StyleSheet.create({
  searchSection: {
    gap: Spacing.three
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginHorizontal: CONTAINER_PADDING
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    backgroundColor: theme.backgroundElement,
    borderRadius: 22,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two
  },
  addRecipeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: theme.accent,
    borderRadius: 14,
    paddingHorizontal: Spacing.three + 2,
    paddingVertical: Spacing.two,
    shadowColor: theme.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 5
  },
  addRecipeButtonPressed: {
    opacity: 0.85
  },
  addRecipeLabel: {
    fontSize: 15,
    lineHeight: 20
  },
  paddedX: {
    paddingHorizontal: CONTAINER_PADDING
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: theme.text
  },
  micButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center'
  },
  micButtonActive: {
    backgroundColor: theme.accent
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.two,
    paddingLeft: CONTAINER_PADDING,
    paddingVertical: 10
  },
  categoryCircleItem: {
    alignItems: 'center',
    gap: 4,
    width: 70
  },
  categoryImageWrapper: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent'
  },
  categoryImageWrapperActive: {
    borderColor: theme.accent
  },
  favoritesImageWrapperActive: {
    borderColor: FAVORITE_RED
  },
  myRecipesImageWrapperActive: {
    borderColor: theme.secondary
  },
  categoryImage: {
    width: '100%',
    height: '100%',
    borderRadius: 30
  },
  categoryLabel: {
    textAlign: 'center'
  },
  section: {
    gap: Spacing.three
  },
  recentlyViewedSection: {
    marginVertical: -Spacing.two
  },
  rows: {
    gap: Spacing.two
  },
  row: {
    flexDirection: 'row',
    gap: CARD_GAP
  },
  cardSlot: {
    flexBasis: 0,
    flexGrow: 1,
    flexShrink: 1,
    minWidth: 0
  },
  cardFill: {
    width: '100%'
  },
  recentRow: {
    gap: Spacing.two,
    paddingLeft: CONTAINER_PADDING
  },
  recentCard: {
    width: 200
  }
});

export default observer(RecipesScreen);
