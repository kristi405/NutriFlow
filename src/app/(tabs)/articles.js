import { Image } from 'expo-image';
import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { observer } from 'mobx-react-lite';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { TagFilterSheet } from '@/components/articles/tag-filter-sheet';
import { ThemedText } from '@/components/themed-text';
import { EmptyState } from '@/components/ui/empty-state';
import { ScreenScrollView } from '@/components/ui/screen-scroll-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { articleStore } from '@/store/articleStore';
import { localeStore } from '@/store/localeStore';

const FAVORITE_RED = '#E0245E';

function ArticlesScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [selectedTagIds, setSelectedTagIds] = useState([]);
  const [isTagSheetOpen, setIsTagSheetOpen] = useState(false);

  const { articles, isLoadingArticles, hasArticlesError, favoriteIds } = articleStore;
  const language = localeStore.language;

  useEffect(() => {
    articleStore.loadArticles(language);
  }, [language]);

  // Tag options come from the articles themselves (the API has no tag filter
  // and this keeps the list to tags that actually lead somewhere). Counted
  // within the current All/Favorites view; selected tags stay listed even at
  // zero so they can always be unselected.
  const baseArticles = useMemo(() => showFavoritesOnly ? articles.filter(article => favoriteIds.includes(article.id)) : articles, [articles, showFavoritesOnly, favoriteIds]);

  const tagOptions = useMemo(() => {
    const byId = new Map();
    for (const article of baseArticles) {
      for (const tag of article.tags) {
        const entry = byId.get(tag.id) ?? { id: tag.id, name: tag.name, count: 0 };
        entry.count += 1;
        byId.set(tag.id, entry);
      }
    }
    for (const tag of articles.flatMap(article => article.tags)) {
      if (selectedTagIds.includes(tag.id) && !byId.has(tag.id)) byId.set(tag.id, { id: tag.id, name: tag.name, count: 0 });
    }
    return [...byId.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  }, [baseArticles, articles, selectedTagIds]);

  // A tag filter matches articles that have ANY of the selected tags.
  const visibleArticles = useMemo(() => selectedTagIds.length === 0 ? baseArticles : baseArticles.filter(article => article.tags.some(tag => selectedTagIds.includes(tag.id))), [baseArticles, selectedTagIds]);

  const selectedTags = selectedTagIds.map(id => tagOptions.find(tag => tag.id === id)).filter(Boolean);
  const hasFilters = showFavoritesOnly || selectedTagIds.length > 0;

  function clearFilters() {
    setShowFavoritesOnly(false);
    setSelectedTagIds([]);
  }

  function renderBody() {
    if (articles.length === 0 && isLoadingArticles) {
      return <View style={styles.centered}><ActivityIndicator color={theme.accent} /></View>;
    }
    if (articles.length === 0) {
      return hasArticlesError ? <EmptyState icon={{ ios: 'wifi.slash', android: 'wifi_off', web: 'wifi_off' }} title={t('articles.loadFailedTitle')} message={t('articles.loadFailedMessage')} actionLabel={t('articles.retry')} onAction={() => articleStore.loadArticles(language)} /> : <EmptyState icon={{ ios: 'newspaper', android: 'article', web: 'article' }} title={t('articles.emptyTitle')} message={t('articles.emptyMessage')} />;
    }
    if (visibleArticles.length === 0) {
      const onlyFavorites = showFavoritesOnly && selectedTagIds.length === 0;
      return <EmptyState icon={{ ios: onlyFavorites ? 'heart' : 'magnifyingglass', android: onlyFavorites ? 'favorite_border' : 'search', web: onlyFavorites ? 'favorite_border' : 'search' }} title={t(onlyFavorites ? 'articles.noFavoritesTitle' : 'articles.noResultsTitle')} message={t(onlyFavorites ? 'articles.noFavoritesMessage' : 'articles.noResultsMessage')} actionLabel={hasFilters ? t('articles.clearFilters') : undefined} onAction={hasFilters ? clearFilters : undefined} />;
    }
    return <View style={styles.list}>
        {visibleArticles.map(article => {
        const isFavorite = favoriteIds.includes(article.id);
        return <Pressable key={article.id} onPress={() => router.push({ pathname: '/article/[id]', params: { id: article.id } })} style={({ pressed }) => [styles.card, { backgroundColor: theme.background, borderColor: theme.border, opacity: pressed ? 0.85 : 1 }]}>
              {article.imageUrl ? <Image source={{ uri: article.imageUrl }} style={styles.thumbnail} contentFit="cover" /> : <View style={[styles.thumbnail, styles.thumbnailFallback, { backgroundColor: theme.accentSoft }]}>
                  <SymbolView name={{ ios: 'newspaper.fill', android: 'article', web: 'article' }} size={22} tintColor={theme.accent} />
                </View>}
              <View style={styles.cardBody}>
                <ThemedText type="smallBold" color={theme.text} numberOfLines={2}>{article.title}</ThemedText>
                {article.excerpt ? <ThemedText type="caption" color={theme.textSecondary} numberOfLines={2}>{article.excerpt}</ThemedText> : null}
              </View>
              <Pressable onPress={() => articleStore.toggleFavorite(article.id)} hitSlop={10}>
                <SymbolView name={isFavorite ? { ios: 'heart.fill', android: 'favorite', web: 'favorite' } : { ios: 'heart', android: 'favorite_border', web: 'favorite_border' }} size={20} tintColor={isFavorite ? FAVORITE_RED : theme.textSecondary} />
              </Pressable>
            </Pressable>;
      })}
      </View>;
  }

  return <ScreenScrollView gap={Spacing.three} horizontalPadding={20}>
      <ThemedText type="title" style={styles.title} color={theme.text}>{t('articles.title')}</ThemedText>
      <View style={styles.segmentRow}>
        {[{ key: false, label: t('articles.all') }, { key: true, label: t('articles.favorites') }].map(option => {
        const isActive = showFavoritesOnly === option.key;
        return <Pressable key={String(option.key)} onPress={() => setShowFavoritesOnly(option.key)} style={[styles.segment, { borderColor: isActive ? theme.accent : theme.border, backgroundColor: isActive ? theme.accent : theme.background }]}>
              <ThemedText type="small" color={isActive ? '#ffffff' : theme.text}>{option.label}</ThemedText>
            </Pressable>;
      })}
        <Pressable onPress={() => setIsTagSheetOpen(true)} style={[styles.segment, styles.tagsButton, { borderColor: selectedTagIds.length ? theme.accent : theme.border, backgroundColor: theme.background }]}>
          <SymbolView name={{ ios: 'line.3.horizontal.decrease', android: 'filter_list', web: 'filter_list' }} size={14} tintColor={selectedTagIds.length ? theme.accent : theme.textSecondary} />
          <ThemedText type="small" color={selectedTagIds.length ? theme.accent : theme.text}>
            {selectedTagIds.length ? `${t('articles.tags')} · ${selectedTagIds.length}` : t('articles.tags')}
          </ThemedText>
        </Pressable>
      </View>

      {selectedTags.length > 0 && <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
          {selectedTags.map(tag => <Pressable key={tag.id} onPress={() => setSelectedTagIds(current => current.filter(id => id !== tag.id))} style={[styles.chip, { backgroundColor: theme.accentSoft, borderColor: theme.accent }]}>
              <ThemedText type="caption" color={theme.accent}>{tag.name}</ThemedText>
              <SymbolView name={{ ios: 'xmark', android: 'close', web: 'close' }} size={10} tintColor={theme.accent} />
            </Pressable>)}
        </ScrollView>}

      {renderBody()}

      <TagFilterSheet visible={isTagSheetOpen} tags={tagOptions} selectedIds={selectedTagIds} onChange={setSelectedTagIds} onClose={() => setIsTagSheetOpen(false)} />
    </ScreenScrollView>;
}

export default observer(ArticlesScreen);

const styles = StyleSheet.create({
  title: {
    fontSize: 32,
    lineHeight: 38
  },
  centered: {
    paddingVertical: Spacing.six,
    alignItems: 'center'
  },
  segmentRow: {
    flexDirection: 'row',
    gap: Spacing.two
  },
  segment: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one
  },
  tagsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginLeft: 'auto'
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
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    borderRadius: 20,
    borderWidth: 1,
    padding: Spacing.three
  },
  thumbnail: {
    width: 56,
    height: 56,
    borderRadius: 14
  },
  thumbnailFallback: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  cardBody: {
    flex: 1,
    gap: 2
  }
});
