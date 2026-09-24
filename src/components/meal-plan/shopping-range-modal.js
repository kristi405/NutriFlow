import { SymbolView } from 'expo-symbols';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export function ShoppingRangeModal({ visible, onSelect, onClose }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const options = [{
    key: 'today',
    icon: { ios: 'sun.max.fill', android: 'today', web: 'today' },
    title: t('mealPlan.shoppingRangeToday'),
    hint: t('mealPlan.shoppingRangeTodayHint')
  }, {
    key: 'week',
    icon: { ios: 'calendar', android: 'date_range', web: 'date_range' },
    title: t('mealPlan.shoppingRangeWeek'),
    hint: t('mealPlan.shoppingRangeWeekHint')
  }];

  return <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.card} onPress={event => event.stopPropagation()}>
          <View style={styles.header}>
            <View style={styles.headerText}>
              <ThemedText type="headline" color={theme.text}>{t('mealPlan.shoppingRangeTitle')}</ThemedText>
              <ThemedText type="small" color={theme.textSecondary}>{t('mealPlan.shoppingRangeSubtitle')}</ThemedText>
            </View>
            <Pressable onPress={onClose} hitSlop={8} accessibilityLabel={t('common.close')}>
              <SymbolView name={{ ios: 'xmark.circle.fill', android: 'cancel', web: 'cancel' }} size={24} tintColor={theme.textSecondary} />
            </Pressable>
          </View>
          {options.map(option => <Pressable key={option.key} onPress={() => onSelect(option.key)} style={({ pressed }) => [styles.option, pressed && styles.pressed]}>
              <View style={styles.optionIcon}>
                <SymbolView name={option.icon} size={22} tintColor={theme.accent} />
              </View>
              <View style={styles.optionText}>
                <ThemedText type="smallBold" color={theme.text}>{option.title}</ThemedText>
                <ThemedText type="caption" color={theme.textSecondary}>{option.hint}</ThemedText>
              </View>
              <SymbolView name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }} size={14} tintColor={theme.textSecondary} />
            </Pressable>)}
        </Pressable>
      </Pressable>
    </Modal>;
}

const createStyles = theme => StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.four
  },
  card: {
    width: '100%',
    maxWidth: 380,
    gap: Spacing.three,
    backgroundColor: theme.background,
    borderRadius: 24,
    padding: Spacing.four
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.two
  },
  headerText: {
    flex: 1,
    gap: 2
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    borderWidth: 1,
    borderColor: theme.accent,
    backgroundColor: theme.accentSoft,
    borderRadius: 16,
    padding: Spacing.three
  },
  optionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.background,
    alignItems: 'center',
    justifyContent: 'center'
  },
  optionText: {
    flex: 1,
    gap: 2
  },
  pressed: {
    opacity: 0.8
  }
});
