import { pushOnce } from '@/lib/navigation';
import { SymbolView } from '@/components/ui/symbol-view';
import { observer } from 'mobx-react-lite';
import { memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
      <View style={styles.chevronButton}>
        <SymbolView name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }} size={14} tintColor={theme.textSecondary} />
      </View>
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
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const myIngredients = getMyIngredients();
  // Copy before sorting — the list from data/catalog.js is a shared cache.
  const ingredients = useMemo(() => [...myIngredients].sort((a, b) => a.name.localeCompare(b.name)), [myIngredients]);
  const renderItem = useCallback(({ item }) => <MyIngredientRow ingredient={item} theme={theme} styles={styles} />, [theme, styles]);

  return <View style={styles.flex1}>
      <ScreenFlatList horizontalPadding={20} contentContainerStyle={styles.listContent} data={ingredients} keyExtractor={keyExtractor} renderItem={renderItem} ListEmptyComponent={<EmptyState icon={{ ios: 'leaf', android: 'eco', web: 'eco' }} title={t('userContent.myIngredientsEmptyTitle')} message={t('userContent.myIngredientsEmptyMessage')} />} />
      <Pressable onPress={() => pushOnce('/ingredient-edit')} hitSlop={8} style={[styles.fab, { bottom: insets.bottom + Spacing.four, backgroundColor: theme.accent }]}>
        <SymbolView name={{ ios: 'plus', android: 'add', web: 'add' }} size={30} weight="semibold" tintColor="#ffffff" />
      </Pressable>
    </View>;
}

export default observer(MyIngredientsScreen);

const createStyles = theme => StyleSheet.create({
  flex1: {
    flex: 1
  },
  listContent: {
    paddingTop: Spacing.three,
    paddingBottom: Spacing.six
  },
  fab: {
    position: 'absolute',
    right: Spacing.four,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5
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
  },
  chevronButton: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center'
  }
});
