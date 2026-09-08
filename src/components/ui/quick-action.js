import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
export function QuickAction({
  icon,
  label,
  onPress,
  color
}) {
  const theme = useTheme();
  const resolvedColor = color ?? theme.primary;
  return <Pressable onPress={onPress} style={({
    pressed
  }) => [styles.container, pressed && styles.pressed]}>
      <View style={[styles.iconWrapper, {
      backgroundColor: `${resolvedColor}1F`,
      borderColor: `${resolvedColor}66`
    }]}>
        <SymbolView name={icon} size={26} tintColor={resolvedColor} />
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
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1.5,
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
