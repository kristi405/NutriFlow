import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Colors, Spacing } from '@/constants/theme';

const theme = Colors.light;

export function MacroCard({ label, value, target, color, unit = 'g' }) {
  const progress = target > 0 ? Math.min(1, value / target) : 0;
  return <View style={[styles.card, {
    backgroundColor: theme.background,
    borderColor: theme.border
  }]}>
      <ThemedText type="caption" color={theme.textSecondary}>{label}</ThemedText>
      <ThemedText type="smallBold" color={theme.text}>
        {Math.round(value)}<ThemedText type="caption" color={theme.textSecondary}> / {Math.round(target)}{unit}</ThemedText>
      </ThemedText>
      <View style={[styles.track, {
      backgroundColor: theme.backgroundElement
    }]}>
        <View style={[styles.fill, {
        width: `${progress * 100}%`,
        backgroundColor: color
      }]} />
      </View>
    </View>;
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.four,
    gap: Spacing.two
  },
  track: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden'
  },
  fill: {
    height: '100%',
    borderRadius: 3
  }
});
