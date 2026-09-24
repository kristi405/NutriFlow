import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
// precise: one decimal below 10 — small vitamin/mineral amounts (e.g. 0.9 mg) would otherwise round to 0/1.
function format(amount, precise) {
  if (!precise || amount >= 10) return String(Math.round(amount));
  return String(Math.round(amount * 10) / 10);
}

export function MacroBar({
  label,
  value,
  target,
  unit = 'g',
  color,
  precise = false
}) {
  const theme = useTheme();
  const progress = target > 0 ? Math.min(1, value / target) : 0;
  const barColor = color ?? theme.primary;
  return <View style={styles.container}>
      <View style={styles.labelRow}>
        <ThemedText type="small" color={theme.text}>{label}</ThemedText>
        <ThemedText type="small" color={theme.textSecondary}>
          {format(value, precise)} / {format(target, precise)} {unit}
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
