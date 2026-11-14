import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { observer } from 'mobx-react-lite';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { EmptyState } from '@/components/ui/empty-state';
import { RecipeImage } from '@/components/ui/recipe-image';
import { ScreenScrollView } from '@/components/ui/screen-scroll-view';
import { Spacing } from '@/constants/theme';
import { getMyIngredients } from '@/data/catalog';
import { useTheme } from '@/hooks/use-theme';
import { guessIngredientImage } from '@/lib/ingredientImage';
import { formatUnit } from '@/lib/ingredientUnits';

/**
 * The user's own ingredients (private + already published to the catalog).
 * They come with the regular /app/sync, so this is just a filter over the
 * local catalog cache. Tap → ingredient screen (edit/delete live there).
 */
function MyIngredientsScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const ingredients = getMyIngredients().sort((a, b) => a.name.localeCompare(b.name));

  const addButton = <Pressable onPress={() => router.push('/ingredient-edit')} style={styles.addButton}>
      <SymbolView name={{ ios: 'plus', android: 'add', web: 'add' }} size={16} tintColor="#ffffff" />
      <ThemedText type="smallBold" color="#ffffff">{t('userContent.createIngredient')}</ThemedText>
    </Pressable>;

  return <ScreenScrollView gap={Spacing.three} horizontalPadding={20}>
      {addButton}
      {ingredients.length === 0 ? <EmptyState icon={{ ios: 'leaf', android: 'eco', web: 'eco' }} title={t('userContent.myIngredientsEmptyTitle')} message={t('userContent.myIngredientsEmptyMessage')} /> : ingredients.map(ingredient => <Pressable key={ingredient.id} onPress={() => router.push({ pathname: '/ingredient/[id]', params: { id: ingredient.id } })} style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}>
            <RecipeImage uri={ingredient.imageUrl ?? guessIngredientImage(ingredient)} style={styles.image} iconSize={20} />
            <View style={styles.flex1}>
              <ThemedText type="smallBold" color={theme.text} numberOfLines={1}>{ingredient.name}</ThemedText>
              <ThemedText type="caption" color={theme.textSecondary}>
                {Math.round(ingredient.per100g.nutrition.calories)} {t('common.kcal')} / 100g · {formatUnit(t, ingredient.defaultUnit)}
              </ThemedText>
              {ingredient.isPublished && <ThemedText type="caption" color={theme.accent}>{t('userContent.inCatalogBadge')}</ThemedText>}
            </View>
            <SymbolView name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }} size={14} tintColor={theme.textSecondary} />
          </Pressable>)}
    </ScreenScrollView>;
}

export default observer(MyIngredientsScreen);

const createStyles = theme => StyleSheet.create({
  flex1: {
    flex: 1
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    backgroundColor: theme.accent,
    borderRadius: 14,
    paddingVertical: Spacing.two + 4
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    backgroundColor: theme.background,
    borderColor: theme.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: Spacing.three
  },
  rowPressed: {
    opacity: 0.85
  },
  image: {
    width: 44,
    height: 44,
    borderRadius: 12
  }
});
