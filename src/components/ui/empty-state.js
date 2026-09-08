import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
export function EmptyState({
  icon,
  title,
  message,
  actionLabel,
  onAction
}) {
  const theme = useTheme();
  return <View style={styles.container}>
      {icon && <SymbolView name={icon} size={40} tintColor={theme.textSecondary} />}
      <ThemedText type="headline" style={styles.centerText} color={theme.text}>
        {title}
      </ThemedText>
      <ThemedText type="small" color={theme.textSecondary} style={styles.centerText}>
        {message}
      </ThemedText>
      {actionLabel && onAction && <Pressable onPress={onAction} style={({
      pressed
    }) => [styles.button, {
      backgroundColor: theme.primary
    }, pressed && styles.pressed]}>
          <ThemedText type="smallBold" style={styles.buttonText}>
            {actionLabel}
          </ThemedText>
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
    borderRadius: 999
  },
  buttonText: {
    color: '#ffffff'
  },
  pressed: {
    opacity: 0.8
  }
});
