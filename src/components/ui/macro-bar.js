import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Colors, Spacing } from '@/constants/theme';
const theme = Colors.light;
export function MacroBar({
  label,
  value,
  target,
  unit = 'g',
  color
}) {
  const progress = target > 0 ? Math.min(1, value / target) : 0;
  const barColor = color ?? theme.primary;
  return <View style={styles.container}>
      <View style={styles.labelRow}>
        <ThemedText type="small" color={theme.text}>{label}</ThemedText>
        <ThemedText type="small" color={theme.textSecondary}>
          {Math.round(value)} / {Math.round(target)} {unit}
        </ThemedText>
      </View>
      <View style={[styles.track, {
      backgroundColor: theme.backgroundElement
    }]}>
        <View style={[styles.fill, {
        width: `${progress * 100}%`,
        backgroundColor: barColor
      }]} />
      </View>
    </View>;
}
const styles = StyleSheet.create({
  container: {
    gap: Spacing.one
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  track: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden'
  },
  fill: {
    height: '100%',
    borderRadius: 4
  }
});
