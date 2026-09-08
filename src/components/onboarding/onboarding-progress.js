import { StyleSheet, View } from 'react-native';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export function OnboardingProgress({
  step,
  totalSteps
}) {
  const theme = useTheme();
  return <View style={styles.row}>
      {Array.from({
      length: totalSteps
    }).map((_, index) => <View key={index} style={[styles.segment, {
      backgroundColor: index <= step ? theme.primary : theme.backgroundElement
    }]} />)}
    </View>;
}
const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: Spacing.one
  },
  segment: {
    flex: 1,
    height: 4,
    borderRadius: 2
  }
});
