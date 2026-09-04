import { useMemo, useState } from 'react';
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from 'expo-speech-recognition';
import { SymbolView } from 'expo-symbols';
import { observer } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';
import { Alert, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { EmptyState } from '@/components/ui/empty-state';
import { RecentRecipeRow } from '@/components/ui/recent-recipe-row';
import { RecipeCard } from '@/components/ui/recipe-card';
import { ScreenScrollView } from '@/components/ui/screen-scroll-view';
import { SectionHeader } from '@/components/ui/section-header';
import { Colors, LoginButtonGreen, Spacing } from '@/constants/theme';
import { getIngredientById } from '@/data/seed/ingredients';
import { CATEGORIES } from '@/data/seed/categories';
import { getRecipeById, RECIPES } from '@/data/seed/recipes';
import { calculateRecipeNutrition } from '@/lib/nutrition';
import { favoritesStore } from '@/store/favoritesStore';
import { recentlyViewedStore } from '@/store/recentlyViewedStore';

const theme = Colors.light;
const FAVORITE_RED = '#E0245E';

const CONTAINER_PADDING = 20;
const CARD_GAP = Spacing.three;

function chunkPairs(items) {
  const pairs = [];
  for (let index = 0; index < items.length; index += 2) {
    pairs.push(items.slice(index, index + 2));
  }
  return pairs;
}

function RecipesScreen() {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState(null);

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
    return RECIPES.filter(recipe => {
      const matchesQuery = !normalized || recipe.title.toLowerCase().includes(normalized);
      const matchesFilter = !selectedFilter || (selectedFilter === 'favorites' ? favoritesStore.isFavorite(recipe.id) : recipe.categoryId === selectedFilter);
      return matchesQuery && matchesFilter;
    });
  }, [query, selectedFilter, favoritesStore.favorites.length]);

  const collections = useMemo(() => CATEGORIES.map(category => ({
    category,
    rows: chunkPairs(filteredRecipes.filter(recipe => recipe.categoryId === category.id))
  })).filter(collection => collection.rows.length > 0), [filteredRecipes]);

  const recentlyViewed = recentlyViewedStore.recipeIds.map(getRecipeById).filter(Boolean);

  return <ScreenScrollView gap={Spacing.five} horizontalPadding={CONTAINER_PADDING}>
      <View style={styles.searchSection}>
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

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRow}>
          <Pressable onPress={() => setSelectedFilter(null)} style={[styles.categoryChip, !selectedFilter && styles.categoryChipActive]}>
            <ThemedText type="small" color={!selectedFilter ? '#ffffff' : theme.text}>
              {t('recipes.allCategories')}
            </ThemedText>
          </Pressable>
          <Pressable onPress={() => setSelectedFilter(current => current === 'favorites' ? null : 'favorites')} style={[styles.categoryChip, styles.favoritesChip, selectedFilter === 'favorites' && styles.favoritesChipActive]}>
            <SymbolView name={{ ios: 'heart.fill', android: 'favorite', web: 'favorite' }} size={13} tintColor={selectedFilter === 'favorites' ? '#ffffff' : FAVORITE_RED} />
            <ThemedText type="small" color={selectedFilter === 'favorites' ? '#ffffff' : FAVORITE_RED}>
              {t('recipes.favorites')}
            </ThemedText>
          </Pressable>
          {CATEGORIES.map(category => <Pressable key={category.id} onPress={() => setSelectedFilter(current => current === category.id ? null : category.id)} style={[styles.categoryChip, selectedFilter === category.id && styles.categoryChipActive]}>
              <ThemedText type="small" color={selectedFilter === category.id ? '#ffffff' : theme.text}>
                {category.name}
              </ThemedText>
            </Pressable>)}
        </ScrollView>
      </View>

      {recentlyViewed.length > 0 && <View style={styles.section}>
          <SectionHeader title={t('recipes.recentlyViewed')} actionLabel={t('common.clear')} onAction={() => recentlyViewedStore.clear()} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.recentRow}>
            {recentlyViewed.map(recipe => <RecentRecipeRow key={recipe.id} recipe={recipe} calories={calculateRecipeNutrition(recipe, getIngredientById).nutrition.calories} style={styles.recentCard} />)}
          </ScrollView>
        </View>}

      {collections.length === 0 ? <EmptyState icon={{ ios: 'magnifyingglass', android: 'search', web: 'search' }} title={t('recipes.noResults')} message={t('recipes.noResultsMessage')} /> : collections.map(({ category, rows }) => <View key={category.id} style={styles.section}>
          <SectionHeader title={category.name} />
          <View style={styles.rows}>
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

const styles = StyleSheet.create({
  searchSection: {
    gap: Spacing.three
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    backgroundColor: theme.backgroundElement,
    borderRadius: 22,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two
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
    backgroundColor: LoginButtonGreen
  },
  categoryRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    paddingRight: Spacing.two
  },
  categoryChip: {
    backgroundColor: theme.background,
    borderColor: theme.border,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one
  },
  categoryChipActive: {
    backgroundColor: LoginButtonGreen,
    borderColor: LoginButtonGreen
  },
  favoritesChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FCE4EC',
    borderColor: FAVORITE_RED
  },
  favoritesChipActive: {
    backgroundColor: FAVORITE_RED,
    borderColor: FAVORITE_RED
  },
  section: {
    gap: Spacing.three
  },
  rows: {
    gap: Spacing.three
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
    paddingRight: Spacing.two
  },
  recentCard: {
    width: 200
  }
});

export default observer(RecipesScreen);
