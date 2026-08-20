import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
export function NutritionCard({
  label,
  value,
  unit
}) {
  const theme = useTheme();
  return <View style={[styles.card, {
    backgroundColor: theme.backgroundElement
  }]}>
      <ThemedText type="headline">
        {value}
        {unit && <ThemedText type="small" themeColor="textSecondary">
            {' '}
            {unit}
          </ThemedText>}
      </ThemedText>
      <ThemedText type="caption" themeColor="textSecondary">
        {label}
      </ThemedText>
    </View>;
}
const styles = StyleSheet.create({
  card: {
    flexBasis: '31%',
    flexGrow: 1,
    borderRadius: 16,
    padding: Spacing.three,
    gap: 2
  }
});
