import { router, useLocalSearchParams } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { observer } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { EmptyState } from '@/components/ui/empty-state';
import { RecipeImage } from '@/components/ui/recipe-image';
import { ScreenScrollView } from '@/components/ui/screen-scroll-view';
import { Spacing } from '@/constants/theme';
import { getIngredientById, getRecipeById } from '@/data/catalog';
import { useTheme } from '@/hooks/use-theme';
import { guessIngredientImage, ingredientThumbUri } from '@/lib/ingredientImage';
import { formatNutrientAmount, MINERAL_ROWS, NUTRIENT_ROWS, nonZeroRows, VITAMIN_ROWS } from '@/lib/nutrientRows';
import { deleteIngredient, isIngredientInUseError } from '@/lib/userContent';

// Same per-macro colors as the recipe detail screen and the ingredient
// form, so a macro reads the same way everywhere it shows up in the app.
const WATER_BLUE = '#2F80ED';
const FAT_ORANGE = '#F2994A';
const CARBS_PURPLE = '#9B51E0';

function IngredientDetailScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const STATS = [
    { key: 'calories', labelKey: 'recipes.calories', unit: 'common.kcal', color: theme.primary },
    { key: 'protein', labelKey: 'home.protein', unit: 'g', color: WATER_BLUE },
    { key: 'fat', labelKey: 'home.fat', unit: 'g', color: FAT_ORANGE },
    { key: 'carbs', labelKey: 'home.carbs', unit: 'g', color: CARBS_PURPLE }
  ];
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

  return <ScreenScrollView gap={Spacing.four} horizontalPadding={20} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <RecipeImage uri={ingredientThumbUri(ingredient)} fallbackUri={guessIngredientImage(ingredient)} style={[styles.headerImage, { borderColor: theme.border }]} iconSize={30} />
        <View style={styles.flex1}>
          <ThemedText type="title" style={styles.title} color={theme.text} numberOfLines={2}>{ingredient.name}</ThemedText>
          <ThemedText type="small" color={theme.textSecondary}>{t('ingredients.perAmount', { amount: per100Label })}</ThemedText>
          {(ingredient.isEditable || ingredient.isPublished) && <View style={styles.badgeRow}>
              {ingredient.isEditable && <View style={[styles.badge, { backgroundColor: theme.accentSoft }]}>
                  <ThemedText type="caption" color={theme.accent} style={styles.badgeText}>{t('userContent.myIngredientNote')}</ThemedText>
                </View>}
              {ingredient.isPublished && <View style={[styles.badge, { backgroundColor: theme.accentSoft }]}>
                  <ThemedText type="caption" color={theme.accent} style={styles.badgeText}>{t('userContent.ingredientPublished')}</ThemedText>
                </View>}
            </View>}
        </View>
      </View>

      {ingredient.isEditable && <View style={styles.actionsRow}>
          <Pressable onPress={() => router.push({ pathname: '/ingredient-edit', params: { id: ingredient.id } })} style={[styles.actionButton, { backgroundColor: theme.accent }]}>
            <SymbolView name={{ ios: 'pencil', android: 'edit', web: 'edit' }} size={15} tintColor="#ffffff" />
            <ThemedText type="smallBold" color="#ffffff">{t('common.edit')}</ThemedText>
          </Pressable>
          <Pressable onPress={handleDelete} style={[styles.actionButton, { borderColor: theme.error, borderWidth: 1.5 }]}>
            <SymbolView name={{ ios: 'trash', android: 'delete', web: 'delete' }} size={15} tintColor={theme.error} />
            <ThemedText type="smallBold" color={theme.error}>{t('common.delete')}</ThemedText>
          </Pressable>
        </View>}

      {ingredient.tags.length > 0 && <View style={[styles.sectionCard, { backgroundColor: theme.background, borderColor: theme.border }]}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIcon, { backgroundColor: theme.accentSoft }]}>
              <SymbolView name={{ ios: 'exclamationmark.triangle.fill', android: 'warning', web: 'warning' }} size={14} tintColor={theme.warning} />
            </View>
            <ThemedText type="smallBold" color={theme.text}>{t('userContent.allergens')}</ThemedText>
          </View>
          <View style={styles.chipRow}>
            {ingredient.tags.map(tag => <View key={tag.id} style={[styles.chip, { backgroundColor: theme.accentSoft, borderColor: theme.warning }]}>
                <ThemedText type="caption" color={theme.warning}>{tag.name}</ThemedText>
              </View>)}
          </View>
        </View>}

      <View style={[styles.statsCard, { backgroundColor: theme.background, borderColor: theme.border }]}>
        {STATS.map(stat => <View key={stat.key} style={styles.statItem}>
            <ThemedText type="smallBold" color={stat.color}>
              {formatNutrientAmount(nutrition[stat.key])} {stat.unit === 'common.kcal' ? t('common.kcal') : stat.unit}
            </ThemedText>
            <ThemedText type="caption" color={stat.color}>{t(stat.labelKey)}</ThemedText>
          </View>)}
      </View>

      <View style={[styles.sectionCard, { backgroundColor: theme.background, borderColor: theme.border }]}>
        <View style={styles.sectionHeader}>
          <View style={[styles.sectionIcon, { backgroundColor: theme.primarySoft }]}>
            <SymbolView name={{ ios: 'chart.pie.fill', android: 'pie_chart', web: 'pie_chart' }} size={14} tintColor={theme.primary} />
          </View>
          <ThemedText type="smallBold" color={theme.text}>{t('recipes.nutrients')}</ThemedText>
        </View>
        {nonZeroRows(NUTRIENT_ROWS, nutrition).map((row, index, visibleRows) => <View key={row.key} style={[styles.listRow, { borderBottomColor: theme.border }, index === visibleRows.length - 1 && styles.listRowLast]}>
            <ThemedText type="small" color={theme.text}>{t(row.labelKey)}</ThemedText>
            <ThemedText type="small" color={theme.textSecondary}>{formatNutrientAmount(nutrition[row.key])} {row.unit}</ThemedText>
          </View>)}
      </View>

      <View style={[styles.sectionCard, { backgroundColor: theme.background, borderColor: theme.border }]}>
        <View style={styles.sectionHeader}>
          <View style={[styles.sectionIcon, { backgroundColor: theme.accentSoft }]}>
            <SymbolView name={{ ios: 'leaf.fill', android: 'eco', web: 'eco' }} size={14} tintColor={theme.accent} />
          </View>
          <ThemedText type="smallBold" color={theme.text}>{t('recipes.vitamins')}</ThemedText>
        </View>
        {nonZeroRows(VITAMIN_ROWS, vitamins).map((row, index, visibleRows) => <View key={row.key} style={[styles.listRow, { borderBottomColor: theme.border }, index === visibleRows.length - 1 && styles.listRowLast]}>
            <ThemedText type="small" color={theme.text}>{t(row.labelKey)}</ThemedText>
            <ThemedText type="small" color={theme.textSecondary}>{formatNutrientAmount(vitamins[row.key])} {row.unit}</ThemedText>
          </View>)}
      </View>

      <View style={[styles.sectionCard, { backgroundColor: theme.background, borderColor: theme.border }]}>
        <View style={styles.sectionHeader}>
          <View style={[styles.sectionIcon, { backgroundColor: theme.accentSoft }]}>
            <SymbolView name={{ ios: 'scalemass.fill', android: 'monitor_weight', web: 'monitor_weight' }} size={14} tintColor={theme.accent} />
          </View>
          <ThemedText type="smallBold" color={theme.text}>{t('recipes.minerals')}</ThemedText>
        </View>
        {nonZeroRows(MINERAL_ROWS, minerals).map((row, index, visibleRows) => <View key={row.key} style={[styles.listRow, { borderBottomColor: theme.border }, index === visibleRows.length - 1 && styles.listRowLast]}>
            <ThemedText type="small" color={theme.text}>{t(row.labelKey)}</ThemedText>
            <ThemedText type="small" color={theme.textSecondary}>{formatNutrientAmount(minerals[row.key])} {row.unit}</ThemedText>
          </View>)}
      </View>
    </ScreenScrollView>;
}

export default observer(IngredientDetailScreen);

const styles = StyleSheet.create({
  // On Android, ScreenScrollView adds the status-bar inset on top of the
  // native header's own padding for pushed screens — double-counted, since
  // the header already sits below the status bar. Only Spacing.two is needed.
  content: {
    paddingTop: Spacing.two,
    paddingBottom: Spacing.six
  },
  flex1: {
    flex: 1
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three
  },
  headerImage: {
    width: 72,
    height: 72,
    borderRadius: 20,
    borderWidth: 1
  },
  title: {
    fontSize: 24,
    lineHeight: 29
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.one,
    marginTop: Spacing.one
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: Spacing.two + 2,
    paddingVertical: 3
  },
  badgeText: {
    fontWeight: '700'
  },
  actionsRow: {
    flexDirection: 'row',
    gap: Spacing.two
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 14,
    paddingVertical: Spacing.two + 2
  },
  sectionCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: Spacing.four,
    gap: Spacing.three
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two
  },
  sectionIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center'
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
