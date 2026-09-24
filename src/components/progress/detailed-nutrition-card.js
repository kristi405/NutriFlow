import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { MacroBar } from '@/components/ui/macro-bar';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

// Same rows/units the recipe screen shows. Fiber's target is personalised
// (targets.fiber); the rest are general adult daily values / limits, used only
// to draw "% of reference" bars — not medical guidance.
const NUTRIENT_ROWS = [
  { key: 'fiber', unit: 'g' },
  { key: 'sugar', unit: 'g', target: 50 },
  { key: 'saturatedFat', unit: 'g', target: 20 },
  { key: 'cholesterol', unit: 'mg', target: 300 },
  { key: 'sodium', unit: 'mg', target: 2300 },
  { key: 'omega3', unit: 'g', target: 1.6 },
  { key: 'omega6', unit: 'g', target: 17 }
];
const VITAMIN_ROWS = [
  { key: 'vitaminA', unit: 'mcg' }, { key: 'vitaminB1', unit: 'mg' }, { key: 'vitaminB2', unit: 'mg' },
  { key: 'vitaminB3', unit: 'mg' }, { key: 'vitaminB5', unit: 'mg' }, { key: 'vitaminB6', unit: 'mg' },
  { key: 'vitaminB7', unit: 'mcg' }, { key: 'vitaminB9', unit: 'mcg' }, { key: 'vitaminB12', unit: 'mcg' },
  { key: 'vitaminC', unit: 'mg' }, { key: 'vitaminD', unit: 'mcg' }, { key: 'vitaminE', unit: 'mg' },
  { key: 'vitaminK', unit: 'mcg' }
];
const MINERAL_ROWS = [
  { key: 'calcium', unit: 'mg' }, { key: 'iron', unit: 'mg' }, { key: 'magnesium', unit: 'mg' },
  { key: 'phosphorus', unit: 'mg' }, { key: 'potassium', unit: 'mg' }, { key: 'zinc', unit: 'mg' },
  { key: 'copper', unit: 'mg' }, { key: 'manganese', unit: 'mg' }, { key: 'selenium', unit: 'mcg' },
  { key: 'iodine', unit: 'mcg' }
];

export function DetailedNutritionCard({ total, targets }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const sections = [{
    key: 'nutrients',
    title: t('recipes.nutrients'),
    color: theme.warning,
    rows: NUTRIENT_ROWS.map(row => ({ ...row, value: total.nutrition?.[row.key] ?? 0, target: row.key === 'fiber' ? targets.fiber : row.target }))
  }, {
    key: 'vitamins',
    title: t('recipes.vitamins'),
    color: theme.accent,
    rows: VITAMIN_ROWS.map(row => ({ ...row, value: total.vitamins?.[row.key] ?? 0, target: targets.vitamins[row.key] }))
  }, {
    key: 'minerals',
    title: t('recipes.minerals'),
    color: theme.secondary,
    rows: MINERAL_ROWS.map(row => ({ ...row, value: total.minerals?.[row.key] ?? 0, target: targets.minerals[row.key] }))
  }];

  return <View style={styles.card}>
      <ThemedText type="smallBold" color={theme.text}>{t('progress.detailedNutrition')}</ThemedText>
      {sections.map(section => <View key={section.key} style={styles.section}>
          <ThemedText type="caption" color={theme.textSecondary} style={styles.sectionTitle}>{section.title}</ThemedText>
          {section.rows.map(row => <MacroBar key={row.key} label={t(`recipes.${row.key}`)} value={row.value} target={row.target} unit={row.unit} color={section.color} precise />)}
        </View>)}
    </View>;
}

const createStyles = theme => StyleSheet.create({
  card: {
    gap: Spacing.three,
    backgroundColor: theme.background,
    borderColor: theme.accent,
    shadowColor: theme.accent,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderRadius: 20,
    padding: Spacing.three
  },
  section: {
    gap: Spacing.two
  },
  sectionTitle: {
    fontWeight: '700',
    textTransform: 'uppercase'
  }
});
