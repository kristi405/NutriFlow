import { SymbolView } from 'expo-symbols';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Colors, Spacing } from '@/constants/theme';
const theme = Colors.light;
export function AiInsightCard({
  insight
}) {
  return <View style={[styles.card, {
    backgroundColor: theme.background,
    borderColor: theme.border
  }]}>
      <SymbolView name={{ ios: 'sparkles', android: 'auto_awesome', web: 'auto_awesome' }} size={20} tintColor={theme.primary} />
      <ThemedText type="small" style={styles.text} color={theme.text}>
        {insight}
      </ThemedText>
    </View>;
}
const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.two,
    borderRadius: 20,
    borderWidth: 1,
    padding: Spacing.three
  },
  text: {
    flex: 1
  }
});
