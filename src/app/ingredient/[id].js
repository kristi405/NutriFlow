import { useLocalSearchParams } from 'expo-router';
import { observer } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { EmptyState } from '@/components/ui/empty-state';
import { ScreenScrollView } from '@/components/ui/screen-scroll-view';
import { Spacing } from '@/constants/theme';
import { getIngredientById } from '@/data/catalog';
import { useTheme } from '@/hooks/use-theme';
import { formatUnit } from '@/lib/ingredientUnits';
import { formatNutrientAmount, MINERAL_ROWS, NUTRIENT_ROWS, VITAMIN_ROWS } from '@/lib/nutrientRows';

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
  // Weight/volume-measured ingredients (g, kg, ml, l) convert 1:1 with the
  // nutrient table below and have nothing else to show; count-style units
  // (piece, tbsp, ...) need their own gram weight spelled out.
  const unitConversions = Object.entries(ingredient.gramsPerUnit);
  const per100Label = ingredient.defaultUnit === 'ml' || ingredient.defaultUnit === 'l' ? '100 ml' : '100 g';

  return <ScreenScrollView gap={Spacing.three} horizontalPadding={20} contentContainerStyle={styles.content}>
      <View>
        <ThemedText type="title" style={styles.title} color={theme.text}>{ingredient.name}</ThemedText>
        <ThemedText type="small" color={theme.textSecondary}>{t('ingredients.perAmount', { amount: per100Label })}</ThemedText>
      </View>

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

      <View style={[styles.card, { backgroundColor: theme.background, borderColor: theme.border }]}>
        <ThemedText type="headline" color={theme.text} style={styles.cardTitle}>{t('ingredients.measuredIn')}</ThemedText>
        <View style={[styles.listRow, { borderBottomColor: theme.border }]}>
          <ThemedText type="small" color={theme.text}>{t('ingredients.defaultUnit')}</ThemedText>
          <ThemedText type="small" color={theme.textSecondary}>{formatUnit(t, ingredient.defaultUnit)}</ThemedText>
        </View>
        {unitConversions.map(([unit, grams], index) => <View key={unit} style={[styles.listRow, { borderBottomColor: theme.border }, index === unitConversions.length - 1 && styles.listRowLast]}>
            <ThemedText type="small" color={theme.text}>1 {formatUnit(t, unit)}</ThemedText>
            <ThemedText type="small" color={theme.textSecondary}>{grams} g</ThemedText>
          </View>)}
      </View>

      <View style={styles.nutrientsGroup}>
        <View style={[styles.card, { backgroundColor: theme.background, borderColor: theme.border }]}>
          <ThemedText type="headline" color={theme.text} style={styles.cardTitle}>{t('recipes.nutrients')}</ThemedText>
          {NUTRIENT_ROWS.map((row, index) => <View key={row.key} style={[styles.listRow, { borderBottomColor: theme.border }, index === NUTRIENT_ROWS.length - 1 && styles.listRowLast]}>
              <ThemedText type="small" color={theme.text}>{t(row.labelKey)}</ThemedText>
              <ThemedText type="small" color={theme.textSecondary}>{formatNutrientAmount(nutrition[row.key])} {row.unit}</ThemedText>
            </View>)}
        </View>

        <View style={[styles.card, { backgroundColor: theme.background, borderColor: theme.border }]}>
          <ThemedText type="headline" color={theme.text} style={styles.cardTitle}>{t('recipes.vitamins')}</ThemedText>
          {VITAMIN_ROWS.map((row, index) => <View key={row.key} style={[styles.listRow, { borderBottomColor: theme.border }, index === VITAMIN_ROWS.length - 1 && styles.listRowLast]}>
              <ThemedText type="small" color={theme.text}>{t(row.labelKey)}</ThemedText>
              <ThemedText type="small" color={theme.textSecondary}>{formatNutrientAmount(vitamins[row.key])} {row.unit}</ThemedText>
            </View>)}
        </View>

        <View style={[styles.card, { backgroundColor: theme.background, borderColor: theme.border }]}>
          <ThemedText type="headline" color={theme.text} style={styles.cardTitle}>{t('recipes.minerals')}</ThemedText>
          {MINERAL_ROWS.map((row, index) => <View key={row.key} style={[styles.listRow, { borderBottomColor: theme.border }, index === MINERAL_ROWS.length - 1 && styles.listRowLast]}>
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
