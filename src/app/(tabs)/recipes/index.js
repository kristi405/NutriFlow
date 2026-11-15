import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { pushOnce } from '@/lib/navigation';
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from 'expo-speech-recognition';
import { SymbolView } from 'expo-symbols';
import { observer } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Alert, Animated, Easing, Image as RNImage, Modal, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { EmptyState } from '@/components/ui/empty-state';
import { LockedFeature } from '@/components/ui/locked-feature';
import { RecipeCard } from '@/components/ui/recipe-card';
import { RecipeImage } from '@/components/ui/recipe-image';
import { ScreenFlatList } from '@/components/ui/screen-scroll-view';
import { SectionHeader } from '@/components/ui/section-header';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { getCategories, getRecipeCalories, getRecipes } from '@/data/catalog';
import { authStore } from '@/store/authStore';
import { catalogStore } from '@/store/catalogStore';
import { favoritesStore } from '@/store/favoritesStore';
import { myRecipesStore } from '@/store/myRecipesStore';
import { localeStore } from '@/store/localeStore';

const FAVORITE_RED = '#E0245E';
const MY_RECIPES_FILTER = 'my-recipes';

// Matching photos for the non-category filter chips (all/my recipes/favorites),
// so they get the same round-photo treatment as the real categories below.
const ALL_CATEGORIES_IMAGE = RNImage.resolveAssetSource(require('../../../../assets/images/all-recipes-category.png')).uri;
const MY_RECIPES_IMAGE = RNImage.resolveAssetSource(require('../../../../assets/images/my-recipes-category.png')).uri;
const FAVORITES_IMAGE = RNImage.resolveAssetSource(require('../../../../assets/images/favorites-category.png')).uri;

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

// One row of two recipe cards. observer() also memoizes it: `pair` arrays are
// rebuilt only when the filtered list changes and recipe objects are cached by
// data/catalog.js; calories are observed so they follow ingredient updates.
const RecipePairRow = observer(function RecipePairRow({ pair, showCalories, styles }) {
  return <View style={[styles.row, styles.paddedX]}>
      {pair.map(recipe => <View key={recipe.id} style={styles.cardSlot}>
          <RecipeCard recipe={recipe} calories={showCalories ? getRecipeCalories(recipe) : undefined} style={styles.cardFill} />
        </View>)}
      {pair.length === 1 && <View style={styles.cardSlot} />}
    </View>;
});

const keyExtractor = item => item.key;

/**
 * Recipes tab. Everything comes from the local catalog cache (/app/sync fills
 * it in the background), so the screen opens instantly and works offline;
 * search/filters are local. The collections are flattened into one
 * virtualized FlatList — section headers and two-card rows — instead of
 * rendering every card up front.
 */
function RecipesScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const isGuest = authStore.isGuest;
  const [query, setQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState(null);
  const [isGuestLockVisible, setIsGuestLockVisible] = useState(false);
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
  }, [query, selectedFilter, favoritesStore.favorites.length, myRecipesStore.recipes, recipes]);

  // Flattened list items: a section header followed by its rows of two cards.
  const listItems = useMemo(() => {
    const items = [];
    const addSection = (key, title, right, recipesInSection) => {
      items.push({ type: 'section', key: `section-${key}`, title, right, isFirst: items.length === 0 });
      chunkPairs(recipesInSection).forEach((pair, index) => items.push({ type: 'pair', key: `${key}-${pair.map(recipe => recipe.id).join('-')}`, pair, isFirst: index === 0 }));
    };
    if (selectedFilter === MY_RECIPES_FILTER) {
      const normalized = query.trim().toLowerCase();
      const mine = myRecipesStore.recipes.filter(recipe => !normalized || recipe.title.toLowerCase().includes(normalized));
      items.push({ type: 'section', key: 'section-mine', title: t('recipes.myRecipes'), right: 'add', isFirst: true });
      if (mine.length === 0) items.push({ type: 'myEmpty', key: 'my-empty' });
      else chunkPairs(mine).forEach((pair, index) => items.push({ type: 'pair', key: `mine-${pair.map(recipe => recipe.id).join('-')}`, pair, isFirst: index === 0 }));
      return items;
    }
    categories.forEach(category => {
      const inCategory = filteredRecipes.filter(recipe => recipe.categoryId === category.id);
      if (inCategory.length > 0) addSection(category.id, category.name, !isGuest && items.length === 0 ? 'add' : undefined, inCategory);
    });
    return items;
  }, [selectedFilter, query, myRecipesStore.recipes, categories, filteredRecipes, isGuest, t]);

  const addRecipeButton = useMemo(() => <Pressable onPress={() => pushOnce('/add-recipe')} hitSlop={8} accessibilityLabel={t('recipes.addRecipe')} style={({ pressed }) => [styles.addRecipeButton, pressed && styles.addRecipeButtonPressed]}>
      <SymbolView name={{ ios: 'plus', android: 'add', web: 'add' }} size={16} tintColor="#ffffff" />
      <ThemedText type="smallBold" color="#ffffff" style={styles.addRecipeLabel}>{t('recipes.addRecipe')}</ThemedText>
    </Pressable>, [styles, t]);

  // Rows fade/slide in together when the filter changes (shared animated value).
  const contentAnimStyle = useMemo(() => ({ opacity: contentAnim, transform: [{ translateY: contentAnim.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }] }), [contentAnim]);
  // Guests have no nutrition data (guest /sync omits ingredients) and no My Recipes.
  const showCalories = !isGuest;

  const renderItem = useCallback(({ item }) => {
    let content;
    if (item.type === 'section') {
      content = <View style={[styles.paddedX, styles.sectionHeader, !item.isFirst && styles.sectionSpacing]}>
          <SectionHeader title={item.title} right={item.right === 'add' ? addRecipeButton : undefined} />
        </View>;
    } else if (item.type === 'myEmpty') {
      content = <View style={styles.paddedX}>
          <EmptyState icon={{ ios: 'book.closed', android: 'menu_book', web: 'menu_book' }} title={t('recipes.myRecipesEmptyTitle')} message={t('recipes.myRecipesEmptyMessage')} actionLabel={t('recipes.addRecipe')} onAction={() => pushOnce('/add-recipe')} />
        </View>;
    } else {
      content = <View style={!item.isFirst && styles.rowSpacing}>
          <RecipePairRow pair={item.pair} showCalories={showCalories} styles={styles} />
        </View>;
    }
    return <Animated.View style={contentAnimStyle}>{content}</Animated.View>;
  }, [styles, addRecipeButton, contentAnimStyle, showCalories, t]);

  function handleRefresh() {
    // The backend now reports deletions in the delta too (deletedIds), so a
    // plain sync is enough — no need to force a full re-fetch just to catch
    // removed recipes. `manual: true` silently caps rapid repeat taps — no
    // spinner flash, no message, the extra tap just does nothing.
    catalogStore.sync(authStore.token, localeStore.language, { manual: true });
  }

  const listHeader = <View style={styles.listHeader}>
      <View style={styles.searchSection}>
        <View style={styles.searchRow}>
          <Pressable onPress={handleRefresh} disabled={catalogStore.isSyncing} hitSlop={8} accessibilityLabel={t('recipes.refresh')} style={[styles.refreshButton, catalogStore.isSyncing && styles.refreshButtonActive]}>
            {catalogStore.isSyncing ? <ActivityIndicator size="small" color={theme.accent} /> : <SymbolView name={{ ios: 'arrow.clockwise', android: 'refresh', web: 'refresh' }} size={18} tintColor={theme.accent} />}
          </Pressable>
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
          {!isGuest && <PulseItem active={selectedFilter === MY_RECIPES_FILTER} onPress={() => setSelectedFilter(current => current === MY_RECIPES_FILTER ? null : MY_RECIPES_FILTER)} style={styles.categoryCircleItem}>
            <View style={[styles.categoryImageWrapper, selectedFilter === MY_RECIPES_FILTER && styles.myRecipesImageWrapperActive]}>
              <RecipeImage uri={MY_RECIPES_IMAGE} style={styles.categoryImage} iconSize={16} />
            </View>
            <ThemedText type="caption" color={theme.secondary} numberOfLines={2} style={styles.categoryLabel}>
              {t('recipes.myRecipes')}
            </ThemedText>
          </PulseItem>}
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

      <View style={[styles.paddedX, styles.ingredientsBannerWrapper]}>
          <Pressable onPress={() => isGuest ? setIsGuestLockVisible(true) : pushOnce('/ingredients')} style={({ pressed }) => [styles.ingredientsBanner, { backgroundColor: theme.background, borderColor: theme.accent, opacity: pressed ? 0.85 : 1 }]}>
            <View style={[styles.ingredientsBannerIcon, { backgroundColor: theme.accentSoft }]}>
              <SymbolView name={{ ios: 'leaf.fill', android: 'eco', web: 'eco' }} size={20} tintColor={theme.accent} />
            </View>
            <View style={styles.ingredientsBannerTextGroup}>
              <ThemedText type="smallBold" color={theme.text}>{t('ingredients.title')}</ThemedText>
              <ThemedText type="caption" color={theme.textSecondary}>{t('ingredients.bannerSubtitle')}</ThemedText>
            </View>
            <View style={[styles.ingredientsBannerChevron, { backgroundColor: theme.accentSoft }]}>
              <SymbolView name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }} size={13} tintColor={theme.accent} />
            </View>
          </Pressable>
        </View>
    </View>;

  return <>
      <ScreenFlatList isTabScreen gap={0} horizontalPadding={0} data={listItems} keyExtractor={keyExtractor} renderItem={renderItem} ListHeaderComponent={listHeader} ListEmptyComponent={<View style={styles.paddedX}>
            <EmptyState icon={{ ios: 'magnifyingglass', android: 'search', web: 'search' }} title={t('recipes.noResults')} message={t('recipes.noResultsMessage')} />
          </View>} />

      <Modal visible={isGuestLockVisible} transparent animationType="fade" onRequestClose={() => setIsGuestLockVisible(false)}>
        <Pressable style={styles.guestLockBackdrop} onPress={() => setIsGuestLockVisible(false)}>
          <Pressable style={styles.guestLockCardWrapper} onPress={event => event.stopPropagation()}>
            <LockedFeature title={t('auth.guestLockedTitle')} message={t('auth.guestLockedIngredientsCatalog')} actionLabel={t('auth.signIn')} actionIcon={{ ios: 'person.fill', android: 'person', web: 'person' }} onAction={() => {
            setIsGuestLockVisible(false);
            authStore.exitGuestMode();
          }} />
          </Pressable>
        </Pressable>
      </Modal>
    </>;
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
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.accentSoft
  },
  refreshButtonActive: {
    opacity: 0.6
  },
  ingredientsBannerWrapper: {
    marginVertical: -Spacing.two
  },
  ingredientsBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    height: 60,
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: Spacing.three,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2
  },
  ingredientsBannerIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center'
  },
  ingredientsBannerTextGroup: {
    flex: 1,
    gap: 2
  },
  ingredientsBannerChevron: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center'
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
    borderWidth: 1.5,
    borderColor: 'transparent',
    padding: 3
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
  listHeader: {
    gap: Spacing.five,
    marginBottom: Spacing.five
  },
  sectionHeader: {
    marginBottom: Spacing.three
  },
  sectionSpacing: {
    marginTop: Spacing.five
  },
  rowSpacing: {
    marginTop: Spacing.two
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
  guestLockBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.four
  },
  guestLockCardWrapper: {
    width: '100%'
  }
});

export default observer(RecipesScreen);
