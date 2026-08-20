import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ThemedText } from '@/components/themed-text';
import { Colors, Spacing } from '@/constants/theme';
const theme = Colors.light;
export function ErrorState({
  message,
  onRetry
}) {
  const { t } = useTranslation();
  return <View style={styles.container}>
      <ThemedText type="headline" style={styles.centerText} color={theme.error}>
        {t('common.errorTitle')}
      </ThemedText>
      <ThemedText type="small" color={theme.textSecondary} style={styles.centerText}>
        {message ?? t('common.errorDefault')}
      </ThemedText>
      {onRetry && <Pressable onPress={onRetry} style={({
      pressed
    }) => [styles.button, {
      borderColor: theme.border
    }, pressed && styles.pressed]}>
          <ThemedText type="smallBold" color={theme.text}>{t('common.retry')}</ThemedText>
        </Pressable>}
    </View>;
}
const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.five
  },
  centerText: {
    textAlign: 'center'
  },
  button: {
    marginTop: Spacing.two,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderRadius: 999,
    borderWidth: 1
  },
  pressed: {
    opacity: 0.7
  }
});
