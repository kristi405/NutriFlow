import { useMemo, useState } from 'react';
import { Stack, useLocalSearchParams } from 'expo-router';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { SymbolView } from 'expo-symbols';
import { observer } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';
import { Alert, Modal, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { EmptyState } from '@/components/ui/empty-state';
import { MacroBar } from '@/components/ui/macro-bar';
import { LockedFeature } from '@/components/ui/locked-feature';
import { RecipeImage } from '@/components/ui/recipe-image';
import { ScreenScrollView } from '@/components/ui/screen-scroll-view';
import { Spacing } from '@/constants/theme';
import { getIngredientById } from '@/data/catalog';
import { useTheme } from '@/hooks/use-theme';
import { todayKey, weekContaining } from '@/lib/date';
import { guessIngredientImage, ingredientThumbUri } from '@/lib/ingredientImage';
import { buildShoppingList } from '@/lib/shoppingList';
import { mealPlanStore } from '@/store/mealPlanStore';
import { shoppingListStore } from '@/store/shoppingListStore';
import { subscriptionStore } from '@/store/subscriptionStore';

function escapeHtml(text) {
  return text.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
}

function buildShoppingListHtml(title, groups) {
  const sections = groups.map(group => `
    <h2>${escapeHtml(group.categoryName)}</h2>
    <ul>${group.items.map(item => `<li>${escapeHtml(item.name)}</li>`).join('')}</ul>
  `).join('');
  return `<html><head><meta charset="utf-8"><style>
    body { font-family: -apple-system, sans-serif; padding: 32px; color: #1c1c1e; }
    h1 { font-size: 24px; margin-bottom: 24px; }
    h2 { font-size: 16px; margin-top: 20px; margin-bottom: 8px; color: #1B5E20; }
    ul { margin: 0; padding-left: 20px; }
    li { font-size: 14px; padding: 4px 0; }
  </style></head><body>
    <h1>${escapeHtml(title)}</h1>
    ${sections}
  </body></html>`;
}

const CATEGORY_ICONS = {
  meat: 'fork.knife',
  fish: 'fish.fill',
  dairy: 'drop.fill',
  bakery: 'birthday.cake.fill',
  pantry: 'archivebox.fill',
  produce: 'leaf.fill',
  other: 'circle.grid.2x2.fill'
};

function ShoppingListScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { range } = useLocalSearchParams();
  const isWeek = range === 'week';
  const today = todayKey();
  // "Week" = the rest of the current week (today onward), same span the weekly menu generator fills.
  const days = isWeek ? weekContaining(today).filter(day => day >= today) : [today];
  const planItems = days.flatMap(day => mealPlanStore.itemsForShopping(day));
  const scopeKey = isWeek ? `week@${weekContaining(today)[0]}` : `today@${today}`;
  const baseGroups = buildShoppingList(planItems);
  // Manually-typed items (toothpaste, etc.) don't belong to any catalog
  // category, so they get their own group at the end instead of trying to
  // guess a category for them.
  const customEntries = shoppingListStore.customItemsFor(scopeKey);
  const groups = customEntries.length === 0 ? baseGroups : [...baseGroups, {
    categoryId: 'custom',
    categoryName: t('shoppingList.customCategory'),
    items: customEntries.map(entry => ({ ingredientId: entry.id, name: entry.name, isCustom: true }))
  }];
  // Only ids still on the current list count, so removing a recipe from the plan can't leave phantom checks.
  const checkedIds = new Set(shoppingListStore.checkedFor(scopeKey).filter(id => groups.some(group => group.items.some(item => item.ingredientId === id))));
  const totalCount = useMemo(() => groups.reduce((sum, group) => sum + group.items.length, 0), [groups]);

  const [isAddingItem, setIsAddingItem] = useState(false);
  const [newItemName, setNewItemName] = useState('');

  function toggleChecked(ingredientId) {
    shoppingListStore.toggle(scopeKey, ingredientId);
  }

  function handleCloseAddItem() {
    setIsAddingItem(false);
    setNewItemName('');
  }

  function handleConfirmAddItem() {
    const trimmed = newItemName.trim();
    if (!trimmed) return;
    shoppingListStore.addCustomItem(scopeKey, trimmed);
    handleCloseAddItem();
  }

  function handleRemoveCustomItem(id) {
    shoppingListStore.removeCustomItem(scopeKey, id);
  }

  async function handleShare() {
    const remainingGroups = groups.map(group => ({
      ...group,
      items: group.items.filter(item => !checkedIds.has(item.ingredientId))
    })).filter(group => group.items.length > 0);

    if (remainingGroups.length === 0) return;

    try {
      const html = buildShoppingListHtml(t('shoppingList.title'), remainingGroups);
      const { uri } = await Print.printToFileAsync({ html });
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: t('shoppingList.title') });
      } else {
        Alert.alert(t('common.errorTitle'), t('common.errorDefault'));
      }
    } catch {
      Alert.alert(t('common.errorTitle'), t('common.errorDefault'));
    }
  }

  if (!subscriptionStore.hasAccess) {
    return <ScreenScrollView gap={Spacing.four} horizontalPadding={20}>
        <LockedFeature message={t('paywall.lockedShopping')} />
      </ScreenScrollView>;
  }

  return <View style={styles.flex1}>
      <ScreenScrollView gap={Spacing.four} horizontalPadding={20} contentContainerStyle={styles.scrollContent}>
      {groups.length > 0 && <Stack.Screen options={{
      headerRight: () => <Pressable onPress={handleShare} hitSlop={8}>
            <SymbolView name="square.and.arrow.up" size={24} tintColor={theme.text} />
          </Pressable>
    }} />}

      {groups.length === 0 ? <EmptyState icon="cart" title={t('shoppingList.emptyTitle')} message={t(isWeek ? 'shoppingList.emptyMessageWeek' : 'shoppingList.emptyMessage')} /> : <>
          <View style={styles.progressCard}>
            <MacroBar label={t('shoppingList.progress')} value={checkedIds.size} target={totalCount} unit={t('shoppingList.items')} color={theme.accent} />
          </View>

          {checkedIds.size === totalCount && <View style={styles.allDoneBanner}>
              <SymbolView name="checkmark.circle.fill" size={18} tintColor={theme.accent} />
              <ThemedText type="smallBold" color={theme.accent}>{t('shoppingList.allDone')}</ThemedText>
            </View>}

          {groups.map(group => <View key={group.categoryId} style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.categoryIconWrapper}>
                  <SymbolView name={CATEGORY_ICONS[group.categoryId] ?? 'cart.fill'} size={16} tintColor={theme.accent} />
                </View>
                <ThemedText type="smallBold" color={theme.text} style={styles.sectionTitle}>{group.categoryName}</ThemedText>
                <View style={styles.countBadge}>
                  <ThemedText type="caption" color={theme.textSecondary}>{group.items.length}</ThemedText>
                </View>
              </View>
              <View style={styles.list}>
                {group.items.map((item, index) => {
              const isChecked = checkedIds.has(item.ingredientId);
              const ingredient = item.isCustom ? null : getIngredientById(item.ingredientId);
              return <Pressable key={item.ingredientId} onPress={() => toggleChecked(item.ingredientId)} style={[styles.row, index === group.items.length - 1 && styles.rowLast]}>
                      <SymbolView name={isChecked ? 'checkmark.circle.fill' : 'circle'} size={22} tintColor={isChecked ? theme.accent : theme.border} />
                      {item.isCustom ? <View style={[styles.customItemIcon, { backgroundColor: theme.accentSoft }, isChecked && styles.itemImageChecked]}>
                          <SymbolView name="cart.fill" size={16} tintColor={theme.accent} />
                        </View> : <RecipeImage uri={ingredientThumbUri(ingredient)} fallbackUri={guessIngredientImage(ingredient)} style={[styles.itemImage, isChecked && styles.itemImageChecked]} iconSize={18} />}
                      <View style={styles.itemNameWrapper}>
                        <ThemedText type="default" color={isChecked ? theme.textSecondary : theme.text} style={isChecked && styles.checkedText}>
                          {item.name}
                        </ThemedText>
                      </View>
                      {item.isCustom && <Pressable onPress={() => handleRemoveCustomItem(item.ingredientId)} hitSlop={8}>
                          <SymbolView name="xmark.circle.fill" size={20} tintColor={theme.border} />
                        </Pressable>}
                    </Pressable>;
            })}
              </View>
            </View>)}
        </>}
      </ScreenScrollView>

      <Pressable onPress={() => setIsAddingItem(true)} hitSlop={8} style={[styles.fab, { bottom: insets.bottom + Spacing.four, backgroundColor: theme.accent }]}>
        <SymbolView name="plus" size={28} tintColor="#ffffff" />
      </Pressable>

      <Modal visible={isAddingItem} transparent animationType="fade" onRequestClose={handleCloseAddItem}>
        <Pressable style={styles.amountBackdrop} onPress={handleCloseAddItem}>
          <Pressable style={[styles.amountCard, { backgroundColor: theme.background }]} onPress={event => event.stopPropagation()}>
            <ThemedText type="headline" color={theme.text}>{t('shoppingList.addItemTitle')}</ThemedText>
            <TextInput value={newItemName} onChangeText={setNewItemName} placeholder={t('shoppingList.addItemPlaceholder')} placeholderTextColor={theme.textSecondary + '80'} selectionColor="#1B5E20" autoFocus returnKeyType="done" onSubmitEditing={handleConfirmAddItem} style={[styles.addItemInput, { borderColor: theme.border, color: theme.text }]} />
            <View style={styles.amountActions}>
              <Pressable onPress={handleCloseAddItem} style={styles.amountCancel}>
                <ThemedText type="smallBold" color={theme.textSecondary}>{t('common.cancel')}</ThemedText>
              </Pressable>
              <Pressable onPress={handleConfirmAddItem} style={[styles.amountConfirm, { backgroundColor: theme.accent }]}>
                <ThemedText type="smallBold" color="#ffffff">{t('common.add')}</ThemedText>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>;
}

export default observer(ShoppingListScreen);

const createStyles = theme => StyleSheet.create({
  progressCard: {
    backgroundColor: theme.background,
    borderColor: theme.secondary,
    borderWidth: 2,
    borderRadius: 20,
    padding: Spacing.three
  },
  allDoneBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    backgroundColor: theme.accentSoft,
    borderRadius: 16,
    padding: Spacing.three
  },
  section: {
    gap: Spacing.two
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two
  },
  categoryIconWrapper: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.accentSoft,
    alignItems: 'center',
    justifyContent: 'center'
  },
  sectionTitle: {
    flex: 1
  },
  countBadge: {
    backgroundColor: theme.backgroundElement,
    borderRadius: 999,
    paddingHorizontal: Spacing.two,
    paddingVertical: 2
  },
  list: {
    backgroundColor: theme.background,
    borderColor: theme.border,
    borderWidth: 1,
    borderRadius: 16,
    overflow: 'hidden'
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    borderBottomWidth: 1,
    borderColor: theme.border
  },
  rowLast: {
    borderBottomWidth: 0
  },
  itemNameWrapper: {
    flex: 1
  },
  checkedText: {
    textDecorationLine: 'line-through'
  },
  itemImage: {
    width: 32,
    height: 32,
    borderRadius: 8
  },
  itemImageChecked: {
    opacity: 0.5
  },
  flex1: {
    flex: 1
  },
  scrollContent: {
    paddingTop: Spacing.three,
    paddingBottom: Spacing.six
  },
  customItemIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center'
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
  addItemInput: {
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    fontSize: 16
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
    borderRadius: 14,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two
  }
});
