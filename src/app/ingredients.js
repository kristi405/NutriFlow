import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { observer } from 'mobx-react-lite';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { EmptyState } from '@/components/ui/empty-state';
import { RecipeImage } from '@/components/ui/recipe-image';
import { ScreenScrollView } from '@/components/ui/screen-scroll-view';
import { TagFilterSheet } from '@/components/ui/tag-filter-sheet';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { getIngredients } from '@/data/catalog';
import { guessIngredientImage } from '@/lib/ingredientImage';
import { ensurePremium } from '@/lib/premium';

function IngredientsScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const [query, setQuery] = useState('');
  const [selectedTagIds, setSelectedTagIds] = useState([]);
  const [isTagSheetOpen, setIsTagSheetOpen] = useState(false);

  const ingredients = getIngredients();

  // Tag options are whatever the ingredients themselves carry (currently just
  // allergens — the backend has no other ingredient tag type), counted so the
  // most common ones sort to the top of the filter sheet.
  const tagOptions = useMemo(() => {
    const byId = new Map();
    for (const ingredient of ingredients) {
      for (const tag of ingredient.tags) {
        const entry = byId.get(tag.id) ?? { id: tag.id, name: tag.name, count: 0 };
        entry.count += 1;
        byId.set(tag.id, entry);
      }
    }
    return [...byId.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  }, [ingredients]);

  const visibleIngredients = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return ingredients.filter(ingredient => {
      const matchesQuery = !normalized || ingredient.name.toLowerCase().includes(normalized);
      const matchesTags = selectedTagIds.length === 0 || ingredient.tags.some(tag => selectedTagIds.includes(tag.id));
      return matchesQuery && matchesTags;
    }).sort((a, b) => a.name.localeCompare(b.name));
  }, [ingredients, query, selectedTagIds]);

  const selectedTags = selectedTagIds.map(id => tagOptions.find(tag => tag.id === id)).filter(Boolean);
  const hasFilters = query.trim().length > 0 || selectedTagIds.length > 0;

  function clearFilters() {
    setQuery('');
    setSelectedTagIds([]);
  }

  return <ScreenScrollView gap={Spacing.three} horizontalPadding={20}>
      <View style={styles.searchRow}>
        <View style={[styles.searchBar, { backgroundColor: theme.backgroundElement }]}>
          <SymbolView name={{ ios: 'magnifyingglass', android: 'search', web: 'search' }} size={16} tintColor={theme.textSecondary} />
          <TextInput value={query} onChangeText={setQuery} placeholder={t('ingredients.searchPlaceholder')} placeholderTextColor={theme.textSecondary} style={[styles.searchInput, { color: theme.text }]} returnKeyType="search" />
          {query.length > 0 && <Pressable onPress={() => setQuery('')} hitSlop={8}>
              <SymbolView name={{ ios: 'xmark.circle.fill', android: 'cancel', web: 'cancel' }} size={18} tintColor={theme.textSecondary} />
            </Pressable>}
        </View>
        <Pressable onPress={() => setIsTagSheetOpen(true)} accessibilityLabel={t('common.selectTags')} style={[styles.filterButton, { borderColor: selectedTagIds.length ? theme.accent : theme.border, backgroundColor: selectedTagIds.length ? theme.accentSoft : theme.background }]}>
          <SymbolView name={{ ios: 'line.3.horizontal.decrease', android: 'filter_list', web: 'filter_list' }} size={18} tintColor={selectedTagIds.length ? theme.accent : theme.textSecondary} />
          {selectedTagIds.length > 0 && <View style={[styles.filterBadge, { backgroundColor: theme.accent }]}>
              <ThemedText type="caption" color="#ffffff" style={styles.filterBadgeText}>{selectedTagIds.length}</ThemedText>
            </View>}
        </Pressable>
      </View>

      {selectedTags.length > 0 && <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
          {selectedTags.map(tag => <Pressable key={tag.id} onPress={() => setSelectedTagIds(current => current.filter(id => id !== tag.id))} style={[styles.chip, { backgroundColor: theme.accentSoft, borderColor: theme.accent }]}>
              <ThemedText type="caption" color={theme.accent}>{tag.name}</ThemedText>
              <SymbolView name={{ ios: 'xmark', android: 'close', web: 'close' }} size={10} tintColor={theme.accent} />
            </Pressable>)}
        </ScrollView>}

      <ThemedText type="caption" color={theme.textSecondary}>{t('ingredients.count', { count: visibleIngredients.length })}</ThemedText>

      {visibleIngredients.length === 0 ? <EmptyState icon={{ ios: 'magnifyingglass', android: 'search', web: 'search' }} title={t('ingredients.noResultsTitle')} message={t('ingredients.noResultsMessage')} actionLabel={hasFilters ? t('articles.clearFilters') : undefined} onAction={hasFilters ? clearFilters : undefined} /> : <View style={styles.list}>
          {visibleIngredients.map(ingredient => <Pressable key={ingredient.id} onPress={() => ensurePremium() && router.push({ pathname: '/ingredient/[id]', params: { id: ingredient.id } })} style={({ pressed }) => [styles.row, { backgroundColor: theme.background, borderColor: theme.border, opacity: pressed ? 0.85 : 1 }]}>
              <RecipeImage uri={guessIngredientImage(ingredient)} style={styles.thumbnail} iconSize={18} />
              <View style={styles.rowBody}>
                <ThemedText type="smallBold" color={theme.text} numberOfLines={1}>{ingredient.name}</ThemedText>
                {ingredient.tags.length > 0 && <View style={styles.allergenRow}>
                    {ingredient.tags.map(tag => <ThemedText key={tag.id} type="caption" color={theme.warning} numberOfLines={1}>{tag.name}</ThemedText>)}
                  </View>}
              </View>
              <ThemedText type="caption" color={theme.textSecondary}>
                {Math.round(ingredient.per100g.nutrition.calories)} {t('common.kcal')} / 100{ingredient.defaultUnit === 'ml' || ingredient.defaultUnit === 'l' ? 'ml' : 'g'}
              </ThemedText>
              <SymbolView name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }} size={14} tintColor={theme.textSecondary} />
            </Pressable>)}
        </View>}

      <TagFilterSheet visible={isTagSheetOpen} tags={tagOptions} selectedIds={selectedTagIds} onChange={setSelectedTagIds} onClose={() => setIsTagSheetOpen(false)} />
    </ScreenScrollView>;
}

export default observer(IngredientsScreen);

const styles = StyleSheet.create({
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderRadius: 22,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two
  },
  searchInput: {
    flex: 1,
    fontSize: 16
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center'
  },
  filterBadgeText: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700'
  },
  chipRow: {
    flexDirection: 'row',
    gap: Spacing.two
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: Spacing.three,
    paddingVertical: 4
  },
  list: {
    gap: Spacing.two
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    borderWidth: 1,
    borderRadius: 16,
    padding: Spacing.two
  },
  thumbnail: {
    width: 44,
    height: 44,
    borderRadius: 12
  },
  rowBody: {
    flex: 1,
    gap: 2
  },
  allergenRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6
  }
});
