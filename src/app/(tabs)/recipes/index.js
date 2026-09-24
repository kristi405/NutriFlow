import { useMemo, useState } from 'react';
import { router } from 'expo-router';
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from 'expo-speech-recognition';
import { SymbolView } from 'expo-symbols';
import { observer } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';
import { Alert, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
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
const ALL_CATEGORIES_IMAGE = 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=800';
const MY_RECIPES_IMAGE = 'https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?w=800';
const FAVORITES_IMAGE = 'https://images.unsplash.com/photo-1518057111178-44a106bad636?w=800';

const CONTAINER_PADDING = 20;
const CARD_GAP = Spacing.two;

function chunkPairs(items) {
  const pairs = [];
  for (let index = 0; index < items.length; index += 2) {
    pairs.push(items.slice(index, index + 2));
  }
  return pairs;
}

function RecipesScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [query, setQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState(null);
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
          <Pressable onPress={() => router.push('/add-recipe')} hitSlop={8} style={styles.addRecipeCircleButton}>
            <SymbolView name={{ ios: 'plus', android: 'add', web: 'add' }} size={20} tintColor="#ffffff" />
          </Pressable>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRow}>
          <Pressable onPress={() => setSelectedFilter(null)} style={styles.categoryCircleItem}>
            <View style={[styles.categoryImageWrapper, !selectedFilter && styles.categoryImageWrapperActive]}>
              <RecipeImage uri={ALL_CATEGORIES_IMAGE} style={styles.categoryImage} iconSize={16} />
            </View>
            <ThemedText type="caption" color={!selectedFilter ? theme.accent : theme.textSecondary} numberOfLines={2} style={styles.categoryLabel}>
              {t('recipes.allCategories')}
            </ThemedText>
          </Pressable>
          <Pressable onPress={() => setSelectedFilter(current => current === MY_RECIPES_FILTER ? null : MY_RECIPES_FILTER)} style={styles.categoryCircleItem}>
            <View style={[styles.categoryImageWrapper, selectedFilter === MY_RECIPES_FILTER && styles.myRecipesImageWrapperActive]}>
              <RecipeImage uri={MY_RECIPES_IMAGE} style={styles.categoryImage} iconSize={16} />
            </View>
            <ThemedText type="caption" color={theme.secondary} numberOfLines={2} style={styles.categoryLabel}>
              {t('recipes.myRecipes')}
            </ThemedText>
          </Pressable>
          <Pressable onPress={() => setSelectedFilter(current => current === 'favorites' ? null : 'favorites')} style={styles.categoryCircleItem}>
            <View style={[styles.categoryImageWrapper, selectedFilter === 'favorites' && styles.favoritesImageWrapperActive]}>
              <RecipeImage uri={FAVORITES_IMAGE} style={styles.categoryImage} iconSize={16} />
            </View>
            <ThemedText type="caption" color={FAVORITE_RED} numberOfLines={2} style={styles.categoryLabel}>
              {t('recipes.favorites')}
            </ThemedText>
          </Pressable>
          {categories.map(category => <Pressable key={category.id} onPress={() => setSelectedFilter(current => current === category.id ? null : category.id)} style={styles.categoryCircleItem}>
              <View style={[styles.categoryImageWrapper, selectedFilter === category.id && styles.categoryImageWrapperActive]}>
                <RecipeImage uri={category.imageUrl} style={styles.categoryImage} iconSize={16} />
              </View>
              <ThemedText type="caption" color={selectedFilter === category.id ? theme.accent : theme.textSecondary} numberOfLines={2} style={styles.categoryLabel}>
                {category.name}
              </ThemedText>
            </Pressable>)}
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

      {selectedFilter === MY_RECIPES_FILTER ? <View style={styles.section}>
          <View style={styles.paddedX}>
            <SectionHeader title={t('recipes.myRecipes')} />
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
        </View> : collections.map(({ category, rows }) => <View key={category.id} style={styles.section}>
          <View style={styles.paddedX}>
            <SectionHeader title={category.name} />
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
  addRecipeCircleButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.accent,
    alignItems: 'center',
    justifyContent: 'center'
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
    paddingLeft: CONTAINER_PADDING
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
