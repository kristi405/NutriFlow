import { SymbolView } from 'expo-symbols';
import { observer } from 'mobx-react-lite';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { getAllergenTags } from '@/data/catalog';
import { useTheme } from '@/hooks/use-theme';
import { formatUnit } from '@/lib/ingredientUnits';
import { BASIC_NUTRIENTS, createIngredient, EXTRA_NUTRIENTS, INGREDIENT_UNITS, isWeightUnit, updateIngredient } from '@/lib/userContent';

// Form field key (server name) → i18n label + unit shown next to the input.
const NUTRIENT_FIELDS = {
  calories: { labelKey: 'recipes.calories', unit: 'kcal' },
  protein: { labelKey: 'home.protein', unit: 'g' },
  fat: { labelKey: 'home.fat', unit: 'g' },
  carbs: { labelKey: 'home.carbs', unit: 'g' },
  fiber: { labelKey: 'recipes.fiber', unit: 'g' },
  sugar: { labelKey: 'recipes.sugar', unit: 'g' },
  saturated_fat: { labelKey: 'recipes.saturatedFat', unit: 'g' },
  cholesterol: { labelKey: 'recipes.cholesterol', unit: 'mg' },
  sodium: { labelKey: 'recipes.sodium', unit: 'mg' }
};

// Ingredient view model (catalogAdapter) keeps nutrients camelCased.
const VIEW_MODEL_KEY = { saturated_fat: 'saturatedFat' };

function toInputValue(number) {
  return number ? String(Math.round(Number(number) * 100) / 100) : '';
}

function parseNumber(value) {
  const number = Number(String(value).replace(',', '.'));
  return Number.isFinite(number) ? number : NaN;
}

/**
 * Create or edit the user's own ingredient (POST/PUT /app/ingredients).
 *
 * `ingredient` — the view model to edit (omit to create); `initialName`
 * pre-fills the name when creating (e.g. from a search query).
 * `onSaved(raw)` gets the server's ingredient row (already in the local cache).
 */
function IngredientForm({ ingredient, initialName = '', onSaved, onCancel }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const allergenTags = getAllergenTags();

  const [name, setName] = useState(ingredient?.name ?? initialName);
  const [unit, setUnit] = useState(ingredient?.defaultUnit ?? 'g');
  const [gramsPerUnitByUnit, setGramsPerUnitByUnit] = useState(() => {
    const entries = Object.entries(ingredient?.gramsPerUnit ?? {}).map(([key, grams]) => [key, toInputValue(grams)]);
    return Object.fromEntries(entries);
  });
  const [nutrients, setNutrients] = useState(() => {
    const source = ingredient?.per100g?.nutrition ?? {};
    return Object.fromEntries([...BASIC_NUTRIENTS, ...EXTRA_NUTRIENTS].map(key => [key, toInputValue(source[VIEW_MODEL_KEY[key] ?? key])]));
  });
  const [tagIds, setTagIds] = useState(() => ingredient?.tags?.map(tag => tag.id) ?? []);
  const [showMore, setShowMore] = useState(() => EXTRA_NUTRIENTS.some(key => nutrients[key]));
  const [showValidation, setShowValidation] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [serverError, setServerError] = useState(null);

  const needsUnitWeight = !isWeightUnit(unit);
  const unitWeight = parseNumber(gramsPerUnitByUnit[unit] ?? '');
  const nameError = showValidation && !name.trim();
  const unitWeightError = showValidation && needsUnitWeight && !(unitWeight > 0);
  const invalidNutrients = Object.entries(nutrients).filter(([, value]) => value !== '' && !(parseNumber(value) >= 0)).map(([key]) => key);

  function setNutrient(key, value) {
    setNutrients(current => ({ ...current, [key]: value }));
  }

  function toggleTag(id) {
    setTagIds(current => current.includes(id) ? current.filter(tagId => tagId !== id) : [...current, id]);
  }

  async function handleSave() {
    setShowValidation(true);
    setServerError(null);
    if (!name.trim() || (needsUnitWeight && !(unitWeight > 0)) || invalidNutrients.length > 0) return;

    // Keep weights of other units the ingredient already had, so recipe lines
    // using them stay valid; only the current unit's weight is taken from the form.
    const gramsPerUnit = {};
    for (const [key, value] of Object.entries(gramsPerUnitByUnit)) {
      const grams = parseNumber(value);
      if (!isWeightUnit(key) && grams > 0) gramsPerUnit[key] = grams;
    }
    const form = {
      name,
      defaultUnit: unit,
      gramsPerUnit,
      nutrients: Object.fromEntries(Object.entries(nutrients).map(([key, value]) => [key, value === '' ? 0 : parseNumber(value)])),
      tagIds
    };

    setIsSaving(true);
    try {
      const raw = ingredient ? await updateIngredient(ingredient.id, form) : await createIngredient(form);
      onSaved?.(raw);
    } catch (error) {
      setServerError(error.status === 0 ? t('userContent.offline') : error.message);
    } finally {
      setIsSaving(false);
    }
  }

  function renderNutrientInput(key) {
    const field = NUTRIENT_FIELDS[key];
    const hasError = showValidation && invalidNutrients.includes(key);
    return <View key={key} style={styles.nutrientCell}>
        <ThemedText type="caption" color={theme.textSecondary} numberOfLines={1}>{t(field.labelKey)}</ThemedText>
        <View style={[styles.inputRow, hasError && styles.inputError]}>
          <TextInput value={nutrients[key]} onChangeText={value => setNutrient(key, value)} keyboardType="decimal-pad" placeholder="0" placeholderTextColor={theme.textSecondary} style={styles.numberInput} />
          <ThemedText type="caption" color={theme.textSecondary}>{field.unit === 'kcal' ? t('common.kcal') : field.unit}</ThemedText>
        </View>
      </View>;
  }

  return <View style={styles.container}>
      <View style={styles.field}>
        <ThemedText type="small" color={theme.textSecondary}>{t('userContent.ingredientName')}</ThemedText>
        <TextInput value={name} onChangeText={setName} maxLength={100} placeholder={t('userContent.ingredientNamePlaceholder')} placeholderTextColor={theme.textSecondary} style={[styles.textInput, nameError && styles.inputError]} />
        {nameError && <ThemedText type="caption" color={theme.error}>{t('userContent.nameRequired')}</ThemedText>}
      </View>

      <View style={styles.field}>
        <ThemedText type="small" color={theme.textSecondary}>{t('ingredients.measuredIn')}</ThemedText>
        <View style={styles.chipRow}>
          {INGREDIENT_UNITS.map(option => {
          const isActive = option === unit;
          return <Pressable key={option} onPress={() => setUnit(option)} style={[styles.chip, isActive && styles.chipActive]}>
                <ThemedText type="smallBold" color={isActive ? '#ffffff' : theme.text}>{formatUnit(t, option)}</ThemedText>
              </Pressable>;
        })}
        </View>
        {needsUnitWeight && <View style={styles.unitWeightRow}>
            <ThemedText type="small" color={theme.text} style={styles.flex1}>{t('userContent.unitWeight', { unit: formatUnit(t, unit) })}</ThemedText>
            <View style={[styles.inputRow, styles.unitWeightInput, unitWeightError && styles.inputError]}>
              <TextInput value={gramsPerUnitByUnit[unit] ?? ''} onChangeText={value => setGramsPerUnitByUnit(current => ({ ...current, [unit]: value }))} keyboardType="decimal-pad" placeholder="0" placeholderTextColor={theme.textSecondary} style={styles.numberInput} />
              <ThemedText type="caption" color={theme.textSecondary}>g</ThemedText>
            </View>
          </View>}
        {unitWeightError && <ThemedText type="caption" color={theme.error}>{t('userContent.unitWeightRequired')}</ThemedText>}
      </View>

      <View style={styles.field}>
        <ThemedText type="small" color={theme.textSecondary}>{t('userContent.nutrientsPer100')}</ThemedText>
        <View style={styles.nutrientGrid}>{BASIC_NUTRIENTS.map(renderNutrientInput)}</View>
        <Pressable onPress={() => setShowMore(current => !current)} style={styles.moreToggle} hitSlop={6}>
          <ThemedText type="smallBold" color={theme.accent}>{t('userContent.moreNutrients')}</ThemedText>
          <SymbolView name={showMore ? { ios: 'chevron.up', android: 'expand_less', web: 'expand_less' } : { ios: 'chevron.down', android: 'expand_more', web: 'expand_more' }} size={14} tintColor={theme.accent} />
        </Pressable>
        {showMore && <View style={styles.nutrientGrid}>{EXTRA_NUTRIENTS.map(renderNutrientInput)}</View>}
        {showValidation && invalidNutrients.length > 0 && <ThemedText type="caption" color={theme.error}>{t('userContent.nutrientsInvalid')}</ThemedText>}
      </View>

      {allergenTags.length > 0 && <View style={styles.field}>
          <ThemedText type="small" color={theme.textSecondary}>{t('userContent.allergens')}</ThemedText>
          <View style={styles.chipRow}>
            {allergenTags.map(tag => {
            const isActive = tagIds.includes(tag.id);
            return <Pressable key={tag.id} onPress={() => toggleTag(tag.id)} style={[styles.chip, isActive && styles.allergenChipActive]}>
                  <ThemedText type="small" color={isActive ? theme.warning : theme.text}>{tag.name}</ThemedText>
                </Pressable>;
          })}
          </View>
        </View>}

      {serverError && <ThemedText type="small" color={theme.error}>{serverError}</ThemedText>}

      <View style={styles.actions}>
        {onCancel && <Pressable onPress={onCancel} style={styles.cancelButton} disabled={isSaving}>
            <ThemedText type="smallBold" color={theme.textSecondary}>{t('common.cancel')}</ThemedText>
          </Pressable>}
        <Pressable onPress={handleSave} disabled={isSaving} style={[styles.saveButton, isSaving && styles.saveButtonBusy]}>
          {isSaving ? <ActivityIndicator color="#ffffff" /> : <ThemedText type="smallBold" color="#ffffff">{ingredient ? t('common.save') : t('userContent.createIngredient')}</ThemedText>}
        </Pressable>
      </View>
    </View>;
}

export default observer(IngredientForm);

const createStyles = theme => StyleSheet.create({
  container: {
    gap: Spacing.four
  },
  flex1: {
    flex: 1
  },
  field: {
    gap: Spacing.two
  },
  textInput: {
    backgroundColor: theme.background,
    borderColor: theme.border,
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two + 2,
    fontSize: 16,
    color: theme.text
  },
  inputError: {
    borderColor: theme.error
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two
  },
  chip: {
    borderWidth: 1.5,
    borderColor: theme.border,
    backgroundColor: theme.background,
    borderRadius: 999,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one + 2
  },
  chipActive: {
    backgroundColor: theme.accent,
    borderColor: theme.accent
  },
  allergenChipActive: {
    borderColor: theme.warning,
    backgroundColor: theme.accentSoft
  },
  unitWeightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two
  },
  unitWeightInput: {
    width: 110
  },
  nutrientGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two
  },
  nutrientCell: {
    width: '48.5%',
    gap: 4
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: theme.background,
    borderColor: theme.border,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: Spacing.two + 2
  },
  numberInput: {
    flex: 1,
    paddingVertical: Spacing.two,
    fontSize: 16,
    fontWeight: '600',
    color: theme.text
  },
  moreToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start'
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: Spacing.two
  },
  cancelButton: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two
  },
  saveButton: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.accent,
    borderRadius: 14,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two + 4,
    minHeight: 46
  },
  saveButtonBusy: {
    opacity: 0.7
  }
});
