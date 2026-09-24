import { useEffect, useState } from 'react';
import { Image } from 'expo-image';
import { Stack, useLocalSearchParams } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { observer } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { EmptyState } from '@/components/ui/empty-state';
import { ScreenScrollView } from '@/components/ui/screen-scroll-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { articleStore } from '@/store/articleStore';
import { localeStore } from '@/store/localeStore';

function formatDate(dateString) {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
}

function ArticleScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const { id } = useLocalSearchParams();
  const cached = articleStore.todayArticle?.id === id ? articleStore.todayArticle : null;
  const [article, setArticle] = useState(cached);
  const [isLoading, setIsLoading] = useState(!cached);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (cached) return;
    setIsLoading(true);
    setError(false);
    articleStore.fetchById(id, localeStore.language).then(setArticle).catch(() => setError(true)).finally(() => setIsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (isLoading) {
    return <View style={styles.centerFlex}>
        <ActivityIndicator color={theme.accent} />
      </View>;
  }

  if (error || !article) {
    return <View style={styles.centerFlex}>
        <EmptyState icon={{ ios: 'newspaper', android: 'article', web: 'article' }} title={t('article.notFoundTitle')} message={t('article.notFoundMessage')} />
      </View>;
  }

  const isFavorite = articleStore.isFavorite(article.id);
  return <>
      <Stack.Screen options={{
      headerRight: () => <Pressable onPress={() => articleStore.toggleFavorite(article.id)} hitSlop={10}>
            <SymbolView name={isFavorite ? { ios: 'heart.fill', android: 'favorite', web: 'favorite' } : { ios: 'heart', android: 'favorite_border', web: 'favorite_border' }} size={22} tintColor={isFavorite ? '#E0245E' : theme.textSecondary} />
          </Pressable>
    }} />
      <ScreenScrollView gap={Spacing.three} horizontalPadding={20}>
      {article.imageUrl && <Image source={{ uri: article.imageUrl }} style={styles.heroImage} contentFit="cover" />}
      <ThemedText type="title" style={styles.title} color={theme.text}>
        {article.title}
      </ThemedText>
      {article.publishedAt && <ThemedText type="caption" color={theme.textSecondary}>
          {formatDate(article.publishedAt)}
        </ThemedText>}
      <ThemedText type="default" color={theme.text} style={styles.body}>
        {article.body}
      </ThemedText>
    </ScreenScrollView>
    </>;
}

export default observer(ArticleScreen);

const styles = StyleSheet.create({
  centerFlex: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  heroImage: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 20
  },
  title: {
    fontSize: 26,
    lineHeight: 32
  },
  body: {
    lineHeight: 24
  }
});
