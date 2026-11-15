import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/** Compact two-way "Все / Мои" segmented switch for an ingredient list — same
 * look wherever an ingredient picker needs to narrow results to the user's
 * own ingredients (recipe editor, swap, snack picker). */
export function MineFilterToggle({ value, onChange }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return <View style={styles.track}>
      <Pressable onPress={() => onChange(false)} style={[styles.option, !value && styles.optionActive]}>
        <ThemedText type="caption" color={!value ? '#ffffff' : theme.textSecondary} style={styles.label}>{t('common.all')}</ThemedText>
      </Pressable>
      <Pressable onPress={() => onChange(true)} style={[styles.option, value && styles.optionActive]}>
        <ThemedText type="caption" color={value ? '#ffffff' : theme.text} style={styles.label}>{t('userContent.mineBadge')}</ThemedText>
      </Pressable>
    </View>;
}

const createStyles = theme => StyleSheet.create({
  track: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    backgroundColor: theme.accentSoft,
    borderRadius: 999,
    padding: 3,
    gap: 2
  },
  option: {
    paddingHorizontal: Spacing.three,
    paddingVertical: 6,
    borderRadius: 999
  },
  optionActive: {
    backgroundColor: theme.accent
  },
  label: {
    fontWeight: '700'
  }
});
