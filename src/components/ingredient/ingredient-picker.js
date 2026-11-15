import { SymbolView } from 'expo-symbols';
import { observer } from 'mobx-react-lite';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import IngredientForm from '@/components/ingredient/ingredient-form';
import { ThemedText } from '@/components/themed-text';
import { RecipeImage } from '@/components/ui/recipe-image';
import { Spacing } from '@/constants/theme';
import { getIngredientById, getIngredients } from '@/data/catalog';
import { useTheme } from '@/hooks/use-theme';
import { guessIngredientImage, ingredientThumbUri } from '@/lib/ingredientImage';
import { defaultQuantityFor, formatUnit } from '@/lib/ingredientUnits';
import { unitsForIngredient } from '@/lib/userContent';

const MAX_RESULTS = 40;

/**
 * Full-screen ingredient chooser for the recipe editor (add-recipe and the
 * own-recipe edit mode of recipes/[id]).
 *
 * Lists catalog + the user's own ingredients (own ones marked "Mine"). When
 * the search finds nothing it offers to create an ingredient with that name —
 * the form opens in place, and the new ingredient goes straight to the
 * amount step. The amount step lets the user pick any unit the ingredient
 * converts from (g/kg/ml/l + its grams_per_unit keys), defaulting to its
 * default_unit.
 *
 * `onPick({ ingredient, quantity, unit })` — quantity is the raw typed string.
 * `excludeIds` — ingredients already in the recipe (the server allows each
 * ingredient only once per recipe).
 */
function IngredientPicker({ visible, onClose, onPick, excludeIds = [] }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const insets = useSafeAreaInsets();

  const [query, setQuery] = useState('');
  const [mode, setMode] = useState('search'); // 'search' | 'create'
  const [pendingIngredient, setPendingIngredient] = useState(null);
  const [pendingQuantity, setPendingQuantity] = useState('');
  const [pendingUnit, setPendingUnit] = useState('g');

  const ingredients = getIngredients();
  const excluded = useMemo(() => new Set(excludeIds), [excludeIds]);
  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const pool = ingredients.filter(ingredient => !excluded.has(ingredient.id) && (!normalized || ingredient.name.toLowerCase().includes(normalized)));
    // Own ingredients first — they're what the user most likely came back for.
    return pool.sort((a, b) => Number(b.isOwn) - Number(a.isOwn)).slice(0, MAX_RESULTS);
  }, [query, ingredients, excluded]);

  function reset() {
    setQuery('');
    setMode('search');
    setPendingIngredient(null);
  }

  function handleClose() {
    reset();
    onClose();
  }

  function startAmountStep(ingredient) {
    const unit = unitsForIngredient(ingredient).includes(ingredient.defaultUnit) ? ingredient.defaultUnit : 'g';
    setPendingIngredient(ingredient);
    setPendingUnit(unit);
    setPendingQuantity(defaultQuantityFor(unit));
  }

  function handleCreated(raw) {
    setMode('search');
    const created = getIngredientById(raw.id);
    if (created) startAmountStep(created);
  }

  function handleConfirm() {
    if (!pendingIngredient) return;
    onPick({ ingredient: pendingIngredient, quantity: pendingQuantity, unit: pendingUnit });
    reset();
    onClose();
  }

  const trimmedQuery = query.trim();

  return <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <View style={styles.backdrop}>
        <View style={[styles.sheet, { paddingTop: insets.top + Spacing.two }]}>
          <View style={styles.header}>
            <ThemedText type="smallBold" color={theme.text}>{mode === 'create' ? t('userContent.newIngredient') : t('recipes.addIngredientTitle')}</ThemedText>
            <Pressable onPress={mode === 'create' ? () => setMode('search') : handleClose} hitSlop={8} style={styles.closeButton}>
              <SymbolView name={{ ios: 'xmark', android: 'close', web: 'close' }} size={14} tintColor={theme.textSecondary} />
            </Pressable>
          </View>

          {mode === 'create' ? <ScrollView style={styles.flex1} keyboardShouldPersistTaps="handled" automaticallyAdjustKeyboardInsets contentContainerStyle={styles.formContent}>
              <IngredientForm initialName={trimmedQuery} onSaved={handleCreated} onCancel={() => setMode('search')} />
            </ScrollView> : <>
              <View style={styles.searchBox}>
                <SymbolView name={{ ios: 'magnifyingglass', android: 'search', web: 'search' }} size={16} tintColor={theme.textSecondary} />
                <TextInput value={query} onChangeText={setQuery} placeholder={t('recipes.searchIngredientsPlaceholder')} placeholderTextColor={theme.textSecondary} style={styles.searchInput} autoCorrect={false} />
              </View>
              {/* The sheet itself never resizes for the keyboard — the native,
                  frame-synced automaticallyAdjustKeyboardInsets only shifts
                  this list's content (see add-recipe.js history). */}
              <ScrollView style={styles.flex1} keyboardShouldPersistTaps="handled" automaticallyAdjustKeyboardInsets contentInsetAdjustmentBehavior="automatic">
                {results.length === 0 && <View style={styles.emptyBox}>
                    <ThemedText type="small" color={theme.textSecondary} style={styles.centerText}>{t('ingredients.noResultsTitle')}</ThemedText>
                  </View>}
                {results.map(ingredient => <Pressable key={ingredient.id} onPress={() => startAmountStep(ingredient)} style={styles.option}>
                    <RecipeImage uri={ingredientThumbUri(ingredient)} fallbackUri={guessIngredientImage(ingredient)} style={styles.optionImage} iconSize={20} />
                    <View style={styles.flex1}>
                      <View style={styles.nameRow}>
                        <ThemedText type="small" color={theme.text} numberOfLines={1} style={styles.flexShrink}>{ingredient.name}</ThemedText>
                        {ingredient.isOwn && <View style={styles.mineBadge}>
                            <ThemedText type="caption" color={theme.accent} style={styles.mineBadgeText}>{t('userContent.mineBadge')}</ThemedText>
                          </View>}
                      </View>
                      <ThemedText type="caption" color={theme.textSecondary}>{Math.round(ingredient.per100g.nutrition.calories)} {t('common.kcal')} / 100g</ThemedText>
                    </View>
                    <View style={styles.addIcon}>
                      <SymbolView name={{ ios: 'plus', android: 'add', web: 'add' }} size={12} tintColor={theme.accent} />
                    </View>
                  </Pressable>)}
                <Pressable onPress={() => setMode('create')} style={styles.createRow}>
                  <SymbolView name={{ ios: 'plus.circle.fill', android: 'add_circle', web: 'add_circle' }} size={20} tintColor={theme.accent} />
                  <ThemedText type="smallBold" color={theme.accent} style={styles.flexShrink}>
                    {trimmedQuery ? t('userContent.createIngredientNamed', { name: trimmedQuery }) : t('userContent.createIngredient')}
                  </ThemedText>
                </Pressable>
              </ScrollView>
            </>}
        </View>

        {pendingIngredient && <Pressable style={[StyleSheet.absoluteFill, styles.amountBackdrop]} onPress={() => setPendingIngredient(null)}>
            <Pressable style={[styles.amountCard, { backgroundColor: theme.background }]} onPress={event => event.stopPropagation()}>
              <View style={styles.amountHeader}>
                <RecipeImage uri={ingredientThumbUri(pendingIngredient)} fallbackUri={guessIngredientImage(pendingIngredient)} style={styles.optionImage} iconSize={20} />
                <View style={styles.flex1}>
                  <ThemedText type="smallBold" color={theme.text} numberOfLines={1}>{pendingIngredient.name}</ThemedText>
                  <ThemedText type="caption" color={theme.textSecondary}>{t('recipes.specifyAmountTitle')}</ThemedText>
                </View>
              </View>
              <View style={styles.amountQuantityBox}>
                <TextInput value={pendingQuantity} onChangeText={setPendingQuantity} keyboardType="decimal-pad" autoFocus style={styles.amountQuantityInput} />
                <ThemedText type="smallBold" color={theme.textSecondary}>{formatUnit(t, pendingUnit)}</ThemedText>
              </View>
              <View style={styles.unitRow}>
                {unitsForIngredient(pendingIngredient).map(unit => {
                const isActive = unit === pendingUnit;
                return <Pressable key={unit} onPress={() => setPendingUnit(unit)} style={[styles.unitChip, isActive && styles.unitChipActive]}>
                      <ThemedText type="caption" color={isActive ? '#ffffff' : theme.text}>{formatUnit(t, unit)}</ThemedText>
                    </Pressable>;
              })}
              </View>
              <View style={styles.amountActions}>
                <Pressable onPress={() => setPendingIngredient(null)} style={styles.amountCancel}>
                  <ThemedText type="smallBold" color={theme.textSecondary}>{t('common.cancel')}</ThemedText>
                </Pressable>
                <Pressable onPress={handleConfirm} style={styles.amountConfirm}>
                  <ThemedText type="smallBold" color="#ffffff">{t('common.add')}</ThemedText>
                </Pressable>
              </View>
            </Pressable>
          </Pressable>}
      </View>
    </Modal>;
}

export default observer(IngredientPicker);

const createStyles = theme => StyleSheet.create({
  flex1: {
    flex: 1
  },
  flexShrink: {
    flexShrink: 1
  },
  centerText: {
    textAlign: 'center'
  },
  backdrop: {
    flex: 1,
    backgroundColor: theme.background
  },
  sheet: {
    flex: 1,
    backgroundColor: theme.background,
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.six,
    gap: Spacing.three
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  closeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.accentSoft,
    alignItems: 'center',
    justifyContent: 'center'
  },
  formContent: {
    paddingBottom: Spacing.six
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    backgroundColor: theme.background,
    borderColor: theme.border,
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    lineHeight: 20,
    color: theme.text,
    paddingVertical: 2
  },
  emptyBox: {
    paddingVertical: Spacing.four
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.four,
    borderBottomWidth: 1,
    borderBottomColor: theme.border
  },
  optionImage: {
    width: 48,
    height: 48,
    borderRadius: 12
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two
  },
  mineBadge: {
    backgroundColor: theme.accentSoft,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 1
  },
  mineBadgeText: {
    fontWeight: '700'
  },
  addIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.accentSoft,
    alignItems: 'center',
    justifyContent: 'center'
  },
  createRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.four
  },
  amountBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.five
  },
  amountCard: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 24,
    padding: Spacing.four,
    gap: Spacing.three
  },
  amountHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three
  },
  amountQuantityBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    backgroundColor: theme.accentSoft,
    borderRadius: 14,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three
  },
  amountQuantityInput: {
    flex: 1,
    color: theme.text,
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 20,
    paddingVertical: Spacing.two
  },
  unitRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6
  },
  unitChip: {
    borderWidth: 1.5,
    borderColor: theme.border,
    borderRadius: 999,
    paddingHorizontal: Spacing.two + 2,
    paddingVertical: 4
  },
  unitChipActive: {
    backgroundColor: theme.accent,
    borderColor: theme.accent
  },
  amountActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: Spacing.two
  },
  amountCancel: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two
  },
  amountConfirm: {
    backgroundColor: theme.accent,
    borderRadius: 14,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two
  }
});
