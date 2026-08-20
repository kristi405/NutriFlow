import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ThemedText } from '@/components/themed-text';
import { Colors, Spacing } from '@/constants/theme';
const theme = Colors.light;
export function NutritionScoreCard({
  score,
  explanation
}) {
  const { t } = useTranslation();
  const color = score >= 80 ? theme.success : score >= 50 ? theme.warning : theme.error;
  return <View style={[styles.card, {
    backgroundColor: theme.background,
    borderColor: theme.border
  }]}>
      <View style={styles.row}>
        <ThemedText type="smallBold" color={theme.text}>{t('nutrition.score')}</ThemedText>
        <ThemedText type="headline" color={color}>
          {score}
          <ThemedText type="small" color={theme.textSecondary}>
            {' '}
            / 100
          </ThemedText>
        </ThemedText>
      </View>
      <View style={[styles.track, {
      backgroundColor: theme.backgroundElement
    }]}>
        <View style={[styles.fill, {
        width: `${score}%`,
        backgroundColor: color
      }]} />
      </View>
      <ThemedText type="small" color={theme.textSecondary}>
        {explanation}
      </ThemedText>
    </View>;
}
const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: Spacing.three,
    gap: Spacing.two
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
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
