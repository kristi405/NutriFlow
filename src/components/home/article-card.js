import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export function ArticleCard({ article, onPress }) {
  const { t } = useTranslation();
  const theme = useTheme();
  if (!article) return null;

  return <Pressable onPress={onPress} style={({ pressed }) => [styles.card, {
    backgroundColor: theme.background,
    borderColor: theme.border,
    opacity: pressed ? 0.85 : 1
  }]}>
      {article.imageUrl ? <Image source={{ uri: article.imageUrl }} style={styles.thumbnail} contentFit="cover" /> : <View style={[styles.thumbnail, styles.thumbnailFallback, { backgroundColor: theme.accentSoft }]}>
          <SymbolView name={{ ios: 'newspaper.fill', android: 'article', web: 'article' }} size={22} tintColor={theme.accent} />
        </View>}
      <View style={styles.body}>
        <View style={styles.badgeRow}>
          <SymbolView name={{ ios: 'sparkles', android: 'auto_awesome', web: 'auto_awesome' }} size={12} tintColor={theme.accent} />
          <ThemedText type="caption" color={theme.accent} style={styles.badgeText}>
            {t('home.articleOfTheDay')}
          </ThemedText>
        </View>
        <ThemedText type="smallBold" color={theme.text} numberOfLines={2}>
          {article.title}
        </ThemedText>
        {article.excerpt && <ThemedText type="caption" color={theme.textSecondary} numberOfLines={2}>
            {article.excerpt}
          </ThemedText>}
      </View>
      <SymbolView name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }} size={16} tintColor={theme.textSecondary} />
    </Pressable>;
}

const styles = StyleSheet.create({
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
  body: {
    flex: 1,
    gap: 2
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2
  },
  badgeText: {
    fontWeight: '700',
    textTransform: 'uppercase'
  }
});
