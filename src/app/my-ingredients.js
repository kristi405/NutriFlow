import { pushOnce } from '@/lib/navigation';
import { SymbolView } from 'expo-symbols';
import { observer } from 'mobx-react-lite';
import { memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { EmptyState } from '@/components/ui/empty-state';
import { RecipeImage } from '@/components/ui/recipe-image';
import { ScreenFlatList } from '@/components/ui/screen-scroll-view';
import { Spacing } from '@/constants/theme';
import { getMyIngredients } from '@/data/catalog';
import { useTheme } from '@/hooks/use-theme';
import { guessIngredientImage, ingredientThumbUri } from '@/lib/ingredientImage';
import { formatUnit } from '@/lib/ingredientUnits';

const MyIngredientRow = memo(function MyIngredientRow({ ingredient, theme, styles }) {
  const { t } = useTranslation();
  return <Pressable onPress={() => pushOnce({ pathname: '/ingredient/[id]', params: { id: ingredient.id } })} style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}>
      <RecipeImage uri={ingredientThumbUri(ingredient)} fallbackUri={guessIngredientImage(ingredient)} style={styles.image} iconSize={20} />
      <View style={styles.flex1}>
        <ThemedText type="smallBold" color={theme.text} numberOfLines={1}>{ingredient.name}</ThemedText>
        <ThemedText type="caption" color={theme.textSecondary}>
          {Math.round(ingredient.per100g.nutrition.calories)} {t('common.kcal')} / 100g · {formatUnit(t, ingredient.defaultUnit)}
        </ThemedText>
        {ingredient.isPublished && <ThemedText type="caption" color={theme.accent}>{t('userContent.inCatalogBadge')}</ThemedText>}
      </View>
      <SymbolView name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }} size={14} tintColor={theme.textSecondary} />
    </Pressable>;
});

const keyExtractor = ingredient => ingredient.id;

/**
 * The user's own ingredients (private + already published to the catalog).
 * They come with the regular /app/sync, so this is just a filter over the
 * local catalog cache. Tap → ingredient screen (edit/delete live there).
 */
function MyIngredientsScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const myIngredients = getMyIngredients();
  // Copy before sorting — the list from data/catalog.js is a shared cache.
  const ingredients = useMemo(() => [...myIngredients].sort((a, b) => a.name.localeCompare(b.name)), [myIngredients]);
  const renderItem = useCallback(({ item }) => <MyIngredientRow ingredient={item} theme={theme} styles={styles} />, [theme, styles]);

  const addButton = <Pressable onPress={() => pushOnce('/ingredient-edit')} style={[styles.addButton, styles.header]}>
      <SymbolView name={{ ios: 'plus', android: 'add', web: 'add' }} size={16} tintColor="#ffffff" />
      <ThemedText type="smallBold" color="#ffffff">{t('userContent.createIngredient')}</ThemedText>
    </Pressable>;

  return <ScreenFlatList horizontalPadding={20} data={ingredients} keyExtractor={keyExtractor} renderItem={renderItem} ListHeaderComponent={addButton} ListEmptyComponent={<EmptyState icon={{ ios: 'leaf', android: 'eco', web: 'eco' }} title={t('userContent.myIngredientsEmptyTitle')} message={t('userContent.myIngredientsEmptyMessage')} />} />;
}

export default observer(MyIngredientsScreen);

const createStyles = theme => StyleSheet.create({
  flex1: {
    flex: 1
  },
  header: {
    marginBottom: Spacing.one
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
