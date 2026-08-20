import { StyleSheet, View } from 'react-native';
import { Colors, Spacing } from '@/constants/theme';

const theme = Colors.light;

export function OnboardingProgress({
  step,
  totalSteps
}) {
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
