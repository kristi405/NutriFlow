import { useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import { ThemedText } from '@/components/themed-text';
import { RecipeImage } from '@/components/ui/recipe-image';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { favoritesStore } from '@/store/favoritesStore';
import { Link } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
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
            <RecipeImage uri={recipe.imageUrl} style={styles.image} />
            {recipe.difficulty && <View style={styles.difficultyBadge}>
                <ThemedText type="caption" color="#ffffff">
                  {t(`recipes.difficulty.${recipe.difficulty}`, { defaultValue: recipe.difficulty })}
                </ThemedText>
              </View>}
            <Pressable onPress={() => favoritesStore.toggleFavorite(recipe.id)} hitSlop={8} style={styles.bookmarkButton}>
              <SymbolView name={isFavorite ? { ios: 'bookmark.fill', android: 'bookmark', web: 'bookmark' } : { ios: 'bookmark', android: 'bookmark_border', web: 'bookmark_border' }} size={18} tintColor={isFavorite ? theme.primary : theme.text} />
            </Pressable>
            <LinearGradient colors={['transparent', 'rgba(0, 0, 0, 0.85)']} style={styles.scrim} pointerEvents="none">
              <ThemedText type="caption" color="#ffffff" style={styles.title} numberOfLines={2}>
                {recipe.title}
              </ThemedText>
              <View style={styles.metaRow}>
                {!recipe.isUserRecipe && <View style={styles.metaItem}>
                    <SymbolView name={{ ios: 'clock', android: 'schedule', web: 'schedule' }} size={11} tintColor="#ffffff" />
                    <ThemedText type="caption" color="#ffffff">
                      {recipe.cookTimeText ?? `${totalTime} ${t('common.min')}`}
                    </ThemedText>
                  </View>}
                {calories !== undefined && <View style={styles.metaItem}>
                    <SymbolView name={{ ios: 'flame.fill', android: 'local_fire_department', web: 'local_fire_department' }} size={11} tintColor="#ffffff" />
                    <ThemedText type="caption" color="#ffffff">
                      {Math.round(calories)} {t('common.kcal')}
                    </ThemedText>
                  </View>}
              </View>
            </LinearGradient>
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
    aspectRatio: 3 / 4
  },
  image: {
    width: '100%',
    height: '100%'
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
  scrim: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: Spacing.two,
    paddingTop: Spacing.five,
    paddingBottom: Spacing.two,
    gap: 4
  },
  title: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700'
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3
  },
  pressed: {
    opacity: 0.85
  }
});
