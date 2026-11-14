import { router, useLocalSearchParams } from 'expo-router';
import { observer } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { EmptyState } from '@/components/ui/empty-state';
import { ScreenScrollView } from '@/components/ui/screen-scroll-view';
import { Spacing } from '@/constants/theme';
import { getIngredientById, getRecipeById } from '@/data/catalog';
import { useTheme } from '@/hooks/use-theme';
import { formatNutrientAmount, MINERAL_ROWS, NUTRIENT_ROWS, nonZeroRows, VITAMIN_ROWS } from '@/lib/nutrientRows';
import { deleteIngredient, isIngredientInUseError } from '@/lib/userContent';

const STATS = [
  { key: 'calories', labelKey: 'recipes.calories', unit: 'common.kcal' },
  { key: 'protein', labelKey: 'home.protein', unit: 'g' },
  { key: 'fat', labelKey: 'home.fat', unit: 'g' },
  { key: 'carbs', labelKey: 'home.carbs', unit: 'g' }
];

function IngredientDetailScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const { id } = useLocalSearchParams();
  const ingredient = getIngredientById(id);

  if (!ingredient) {
    return <ScreenScrollView>
        <EmptyState icon={{ ios: 'leaf', android: 'eco', web: 'eco' }} title={t('common.errorTitle')} message={t('common.errorDefault')} />
      </ScreenScrollView>;
  }

  const { nutrition, vitamins, minerals } = ingredient.per100g;

  async function performDelete() {
    try {
      await deleteIngredient(ingredient.id);
      router.back();
    } catch (error) {
      if (isIngredientInUseError(error)) {
        // 409: still part of some recipe — list them so the user knows where
        // to remove it first.
        const titles = (error.data?.recipeIds ?? []).map(recipeId => getRecipeById(recipeId)?.title).filter(Boolean);
        Alert.alert(t('userContent.ingredientInUseTitle'), t('userContent.ingredientInUseMessage', { recipes: titles.length ? titles.map(title => `• ${title}`).join('\n') : error.message }));
        return;
      }
      Alert.alert(t('common.errorTitle'), error.status === 0 ? t('userContent.offline') : error.message);
    }
  }

  function handleDelete() {
    Alert.alert(t('userContent.deleteIngredientTitle'), t('userContent.deleteIngredientMessage'), [{ text: t('common.cancel'), style: 'cancel' }, { text: t('common.delete'), style: 'destructive', onPress: performDelete }]);
  }
  const per100Label = ingredient.defaultUnit === 'ml' || ingredient.defaultUnit === 'l' ? '100 ml' : '100 g';

  return <ScreenScrollView gap={Spacing.three} horizontalPadding={20} contentContainerStyle={styles.content}>
      <View>
        <ThemedText type="title" style={styles.title} color={theme.text}>{ingredient.name}</ThemedText>
        <ThemedText type="small" color={theme.textSecondary}>{t('ingredients.perAmount', { amount: per100Label })}</ThemedText>
        {ingredient.isEditable && <ThemedText type="caption" color={theme.accent}>{t('userContent.myIngredientNote')}</ThemedText>}
        {ingredient.isPublished && <ThemedText type="caption" color={theme.accent}>{t('userContent.ingredientPublished')}</ThemedText>}
      </View>

      {ingredient.isEditable && <View style={styles.actionsRow}>
          <Pressable onPress={() => router.push({ pathname: '/ingredient-edit', params: { id: ingredient.id } })} style={[styles.actionButton, { backgroundColor: theme.accent }]}>
            <ThemedText type="smallBold" color="#ffffff">{t('common.edit')}</ThemedText>
          </Pressable>
          <Pressable onPress={handleDelete} style={[styles.actionButton, { borderColor: theme.error, borderWidth: 1.5 }]}>
            <ThemedText type="smallBold" color={theme.error}>{t('common.delete')}</ThemedText>
          </Pressable>
        </View>}

      {ingredient.tags.length > 0 && <View style={styles.chipRow}>
          {ingredient.tags.map(tag => <View key={tag.id} style={[styles.chip, { backgroundColor: theme.accentSoft, borderColor: theme.warning }]}>
              <ThemedText type="caption" color={theme.warning}>{tag.name}</ThemedText>
            </View>)}
        </View>}

      <View style={[styles.statsCard, { backgroundColor: theme.background, borderColor: theme.border }]}>
        {STATS.map(stat => <View key={stat.key} style={styles.statItem}>
            <ThemedText type="smallBold" color={theme.text}>
              {formatNutrientAmount(nutrition[stat.key])} {stat.unit === 'common.kcal' ? t('common.kcal') : stat.unit}
            </ThemedText>
            <ThemedText type="caption" color={theme.textSecondary}>{t(stat.labelKey)}</ThemedText>
          </View>)}
      </View>

      <View style={styles.nutrientsGroup}>
        <View style={[styles.card, { backgroundColor: theme.background, borderColor: theme.border }]}>
          <ThemedText type="headline" color={theme.text} style={styles.cardTitle}>{t('recipes.nutrients')}</ThemedText>
          {nonZeroRows(NUTRIENT_ROWS, nutrition).map((row, index, visibleRows) => <View key={row.key} style={[styles.listRow, { borderBottomColor: theme.border }, index === visibleRows.length - 1 && styles.listRowLast]}>
              <ThemedText type="small" color={theme.text}>{t(row.labelKey)}</ThemedText>
              <ThemedText type="small" color={theme.textSecondary}>{formatNutrientAmount(nutrition[row.key])} {row.unit}</ThemedText>
            </View>)}
        </View>

        <View style={[styles.card, { backgroundColor: theme.background, borderColor: theme.border }]}>
          <ThemedText type="headline" color={theme.text} style={styles.cardTitle}>{t('recipes.vitamins')}</ThemedText>
          {nonZeroRows(VITAMIN_ROWS, vitamins).map((row, index, visibleRows) => <View key={row.key} style={[styles.listRow, { borderBottomColor: theme.border }, index === visibleRows.length - 1 && styles.listRowLast]}>
              <ThemedText type="small" color={theme.text}>{t(row.labelKey)}</ThemedText>
              <ThemedText type="small" color={theme.textSecondary}>{formatNutrientAmount(vitamins[row.key])} {row.unit}</ThemedText>
            </View>)}
        </View>

        <View style={[styles.card, { backgroundColor: theme.background, borderColor: theme.border }]}>
          <ThemedText type="headline" color={theme.text} style={styles.cardTitle}>{t('recipes.minerals')}</ThemedText>
          {nonZeroRows(MINERAL_ROWS, minerals).map((row, index, visibleRows) => <View key={row.key} style={[styles.listRow, { borderBottomColor: theme.border }, index === visibleRows.length - 1 && styles.listRowLast]}>
              <ThemedText type="small" color={theme.text}>{t(row.labelKey)}</ThemedText>
              <ThemedText type="small" color={theme.textSecondary}>{formatNutrientAmount(minerals[row.key])} {row.unit}</ThemedText>
            </View>)}
        </View>
      </View>
    </ScreenScrollView>;
}

export default observer(IngredientDetailScreen);

const styles = StyleSheet.create({
  // On Android, ScreenScrollView adds the status-bar inset on top of the
  // native header's own padding for pushed screens — double-counted, since
  // the header already sits below the status bar. Only Spacing.two is needed.
  content: {
    paddingTop: Spacing.two
  },
  title: {
    fontSize: 26,
    lineHeight: 32
  },
  actionsRow: {
    flexDirection: 'row',
    gap: Spacing.two
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    paddingVertical: Spacing.two + 2
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two
  },
  chip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: Spacing.three,
    paddingVertical: 4
  },
  statsCard: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: Spacing.three
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 2
  },
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: Spacing.three
  },
  cardTitle: {
    marginBottom: Spacing.two
  },
  nutrientsGroup: {
    gap: Spacing.three
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.two,
    borderBottomWidth: 1,
    borderBottomColor: 'transparent'
  },
  listRowLast: {
    borderBottomWidth: 0
  }
});
