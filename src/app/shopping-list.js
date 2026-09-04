import { useMemo, useState } from 'react';
import { Stack } from 'expo-router';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { SymbolView } from 'expo-symbols';
import { observer } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { EmptyState } from '@/components/ui/empty-state';
import { MacroBar } from '@/components/ui/macro-bar';
import { ScreenScrollView } from '@/components/ui/screen-scroll-view';
import { Colors, LoginButtonGreen, LoginIconBackground, Spacing } from '@/constants/theme';
import { todayKey } from '@/lib/date';
import { buildShoppingList } from '@/lib/shoppingList';
import { mealPlanStore } from '@/store/mealPlanStore';

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

const theme = Colors.light;

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
  const [checkedIds, setCheckedIds] = useState(() => new Set());
  const planItems = mealPlanStore.itemsForDate(todayKey());
  const groups = buildShoppingList(planItems);
  const totalCount = useMemo(() => groups.reduce((sum, group) => sum + group.items.length, 0), [groups]);

  function toggleChecked(ingredientId) {
    setCheckedIds(current => {
      const next = new Set(current);
      if (next.has(ingredientId)) next.delete(ingredientId);else next.add(ingredientId);
      return next;
    });
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

  return <ScreenScrollView gap={Spacing.four} horizontalPadding={20}>
      {groups.length > 0 && <Stack.Screen options={{
      headerRight: () => <Pressable onPress={handleShare} hitSlop={8}>
            <SymbolView name="square.and.arrow.up" size={20} tintColor={theme.text} />
          </Pressable>
    }} />}

      {groups.length === 0 ? <EmptyState icon="cart" title={t('shoppingList.emptyTitle')} message={t('shoppingList.emptyMessage')} /> : <>
          <View style={styles.progressCard}>
            <MacroBar label={t('shoppingList.progress')} value={checkedIds.size} target={totalCount} unit={t('shoppingList.items')} color={LoginButtonGreen} />
          </View>

          {checkedIds.size === totalCount && <View style={styles.allDoneBanner}>
              <SymbolView name="checkmark.circle.fill" size={18} tintColor={LoginButtonGreen} />
              <ThemedText type="smallBold" color={LoginButtonGreen}>{t('shoppingList.allDone')}</ThemedText>
            </View>}

          {groups.map(group => <View key={group.categoryId} style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.categoryIconWrapper}>
                  <SymbolView name={CATEGORY_ICONS[group.categoryId] ?? 'cart.fill'} size={16} tintColor={LoginButtonGreen} />
                </View>
                <ThemedText type="smallBold" color={theme.text} style={styles.sectionTitle}>{group.categoryName}</ThemedText>
                <View style={styles.countBadge}>
                  <ThemedText type="caption" color={theme.textSecondary}>{group.items.length}</ThemedText>
                </View>
              </View>
              <View style={styles.list}>
                {group.items.map((item, index) => {
              const isChecked = checkedIds.has(item.ingredientId);
              return <Pressable key={item.ingredientId} onPress={() => toggleChecked(item.ingredientId)} style={[styles.row, index === group.items.length - 1 && styles.rowLast]}>
                      <SymbolView name={isChecked ? 'checkmark.circle.fill' : 'circle'} size={22} tintColor={isChecked ? LoginButtonGreen : theme.border} />
                      <ThemedText type="default" color={isChecked ? theme.textSecondary : theme.text} style={isChecked && styles.checkedText}>
                        {item.name}
                      </ThemedText>
                    </Pressable>;
            })}
              </View>
            </View>)}
        </>}
    </ScreenScrollView>;
}

export default observer(ShoppingListScreen);

const styles = StyleSheet.create({
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
    backgroundColor: LoginIconBackground,
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
    backgroundColor: LoginIconBackground,
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
  checkedText: {
    textDecorationLine: 'line-through'
  }
});
