import { useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import { ThemedText } from '@/components/themed-text';
import { RecipeImage } from '@/components/ui/recipe-image';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { favoritesStore } from '@/store/favoritesStore';
import { Link } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
function RecipeCardComponent({
  recipe,
  calories,
  style
}) {
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const totalTime = recipe.prepTimeMinutes + recipe.cookTimeMinutes;
  const isFavorite = favoritesStore.isFavorite(recipe.id);
  return <Link href={{
    pathname: '/recipes/[id]',
    params: {
      id: recipe.id
    }
  }} asChild>
      <Pressable style={StyleSheet.flatten([styles.card, style])}>
        {({ pressed }) => <View style={[styles.cardInner, pressed && styles.pressed]}>
            <View style={styles.imageWrapper}>
              <RecipeImage uri={recipe.imageUrl} style={styles.image} />
              {recipe.difficulty && <View style={styles.difficultyBadge}>
                  <ThemedText type="caption" color="#ffffff">
                    {t(`recipes.difficulty.${recipe.difficulty}`, { defaultValue: recipe.difficulty })}
                  </ThemedText>
                </View>}
              <Pressable onPress={() => favoritesStore.toggleFavorite(recipe.id)} hitSlop={8} style={styles.bookmarkButton}>
                <SymbolView name={isFavorite ? { ios: 'bookmark.fill', android: 'bookmark', web: 'bookmark' } : { ios: 'bookmark', android: 'bookmark_border', web: 'bookmark_border' }} size={18} tintColor={isFavorite ? theme.primary : theme.text} />
              </Pressable>
            </View>
            <View style={styles.body}>
              <ThemedText type="caption" color={theme.text} style={styles.title} numberOfLines={2}>
                {recipe.title}
              </ThemedText>
              <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                  <SymbolView name={{ ios: 'clock', android: 'schedule', web: 'schedule' }} size={11} tintColor={theme.textSecondary} />
                  <ThemedText type="caption" color={theme.textSecondary}>
                    {totalTime} {t('common.min')}
                  </ThemedText>
                </View>
                {calories !== undefined && <View style={styles.calorieBadge}>
                    <ThemedText type="caption" color={theme.primary}>
                      {Math.round(calories)} {t('common.kcal')}
                    </ThemedText>
                  </View>}
              </View>
            </View>
          </View>}
      </Pressable>
    </Link>;
}
export const RecipeCard = observer(RecipeCardComponent);
const createStyles = theme => StyleSheet.create({
  card: {
    backgroundColor: theme.background,
    borderColor: theme.border,
    borderWidth: 1,
    borderRadius: 16,
    overflow: 'hidden'
  },
  cardInner: {
    gap: Spacing.two
  },
  imageWrapper: {
    width: '100%'
  },
  image: {
    width: '100%',
    aspectRatio: 4 / 3,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15
  },
  difficultyBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3
  },
  bookmarkButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  body: {
    paddingHorizontal: Spacing.two,
    paddingBottom: Spacing.two,
    gap: 4
  },
  title: {
    height: 40,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
    marginBottom: Spacing.one
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3
  },
  calorieBadge: {
    backgroundColor: theme.primarySoft,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3
  },
  pressed: {
    opacity: 0.85
  }
});
