import { SymbolView } from 'expo-symbols';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { ALLERGEN_LABEL_KEYS } from '@/lib/allergens';

// Shows which of the user's allergens a dish contains. Renders nothing when safe.
export function AllergenWarning({ allergens }) {
  const { t } = useTranslation();
  const theme = useTheme();
  if (!allergens || allergens.length === 0) return null;
  const names = allergens.map(tag => t(`onboarding.preferences.${ALLERGEN_LABEL_KEYS[tag] ?? tag}`, { defaultValue: tag })).join(', ');
  return <View style={styles.row}>
      <SymbolView name={{ ios: 'exclamationmark.triangle.fill', android: 'warning', web: 'warning' }} size={12} tintColor={theme.error} />
      <ThemedText type="caption" color={theme.error} numberOfLines={1} style={styles.text}>
        {t('allergens.containsWarning', { allergens: names })}
      </ThemedText>
    </View>;
}
const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one
  },
  text: {
    flexShrink: 1
  }
});
