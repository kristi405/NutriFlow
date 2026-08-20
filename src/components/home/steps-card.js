import { SymbolView } from 'expo-symbols';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Colors, Spacing } from '@/constants/theme';
import { useStepCount } from '@/hooks/useStepCount';

const theme = Colors.light;
const DAILY_STEP_GOAL = 10000;

export function StepsCard() {
  const { t } = useTranslation();
  const { steps, available } = useStepCount();

  if (!available) return null;

  const progress = Math.min(1, steps / DAILY_STEP_GOAL);

  return <View style={[styles.card, {
    backgroundColor: theme.background,
    borderColor: theme.border
  }]}>
      <View style={styles.headerRow}>
        <View style={styles.titleRow}>
          <SymbolView name="figure.walk" size={18} tintColor={theme.primary} />
          <ThemedText type="smallBold" color={theme.text}>{t('home.steps')}</ThemedText>
        </View>
        <ThemedText type="small" color={theme.textSecondary}>
          {steps.toLocaleString()} / {DAILY_STEP_GOAL.toLocaleString()}
        </ThemedText>
      </View>
      <View style={[styles.track, {
      backgroundColor: theme.backgroundElement
    }]}>
        <View style={[styles.fill, {
        width: `${progress * 100}%`,
        backgroundColor: theme.primary
      }]} />
      </View>
    </View>;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: Spacing.three,
    gap: Spacing.two
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one
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
