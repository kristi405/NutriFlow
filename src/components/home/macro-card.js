import { SymbolView } from 'expo-symbols';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Colors, Spacing } from '@/constants/theme';

const theme = Colors.light;

export function MacroCard({ label, value, target, color, unit = 'g', detailed, trackColor }) {
  const { t } = useTranslation();
  const progress = target > 0 ? Math.min(1, value / target) : 0;
  const goalReached = target > 0 && value >= target;
  if (detailed) {
    return <View style={[styles.card, styles.cardDetailed, {
      backgroundColor: theme.background,
      borderColor: goalReached ? color : theme.border
    }]}>
        <View style={styles.labelRow}>
          <View style={[styles.dot, {
          backgroundColor: color
        }]} />
          <ThemedText type="caption" color={theme.textSecondary}>{label}</ThemedText>
          {goalReached && <SymbolView name="star.fill" size={12} tintColor="#FFC107" />}
        </View>
        <View style={styles.valueGroup}>
          <View style={styles.valueRow}>
            <ThemedText type="headline" color={theme.text}>{Math.round(value)}</ThemedText>
            <ThemedText type="smallBold" color={theme.text}>{unit}</ThemedText>
          </View>
          <ThemedText type="caption" color={theme.textSecondary}>
            {t('common.of')} {Math.round(target)}{unit}
          </ThemedText>
        </View>
        <View style={[styles.track, {
        backgroundColor: trackColor ?? theme.backgroundElement
      }]}>
          <View style={[styles.fill, {
          width: `${progress * 100}%`,
          backgroundColor: color
        }]} />
        </View>
      </View>;
  }
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
  cardDetailed: {
    paddingTop: Spacing.three,
    paddingBottom: Spacing.three,
    paddingLeft: Spacing.three,
    gap: 6
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4
  },
  valueGroup: {
    gap: 1
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 3
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
