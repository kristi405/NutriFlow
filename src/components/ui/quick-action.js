import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Colors, Spacing } from '@/constants/theme';
const theme = Colors.light;
export function QuickAction({
  icon,
  label,
  onPress
}) {
  return <Pressable onPress={onPress} style={({
    pressed
  }) => [styles.container, pressed && styles.pressed]}>
      <View style={[styles.iconWrapper, {
      backgroundColor: theme.primarySoft
    }]}>
        <SymbolView name={icon} size={22} tintColor={theme.primary} />
      </View>
      <ThemedText type="caption" style={styles.label} color={theme.text} numberOfLines={2}>
        {label}
      </ThemedText>
    </Pressable>;
}
const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: Spacing.one,
    width: 72
  },
  iconWrapper: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center'
  },
  label: {
    textAlign: 'center'
  },
  pressed: {
    opacity: 0.7
  }
});
