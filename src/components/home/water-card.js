import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ThemedText } from '@/components/themed-text';
import { Colors, Spacing } from '@/constants/theme';
const theme = Colors.light;
const QUICK_AMOUNTS_ML = [250, 500, 750];
export function WaterCard({
  consumedMl,
  targetMl,
  onAdd
}) {
  const { t } = useTranslation();
  const progress = targetMl > 0 ? Math.min(1, consumedMl / targetMl) : 0;
  return <View style={[styles.card, {
    backgroundColor: theme.background,
    borderColor: theme.border
  }]}>
      <View style={styles.headerRow}>
        <ThemedText type="smallBold" color={theme.text}>{t('nutrition.water')}</ThemedText>
        <ThemedText type="small" color={theme.textSecondary}>
          {(consumedMl / 1000).toFixed(1)} / {(targetMl / 1000).toFixed(1)} L
        </ThemedText>
      </View>
      <View style={[styles.track, {
      backgroundColor: theme.backgroundElement
    }]}>
        <View style={[styles.fill, {
        width: `${progress * 100}%`,
        backgroundColor: theme.secondary
      }]} />
      </View>
      <View style={styles.buttonRow}>
        {QUICK_AMOUNTS_ML.map(amount => <Pressable key={amount} onPress={() => onAdd(amount)} style={({
        pressed
      }) => [styles.quickButton, {
        borderColor: theme.border
      }, pressed && styles.pressed]}>
            <ThemedText type="small" color={theme.text}>+{amount} ml</ThemedText>
          </Pressable>)}
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
  },
  buttonRow: {
    flexDirection: 'row',
    gap: Spacing.two
  },
  quickButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.two,
    borderRadius: 12,
    borderWidth: 1
  },
  pressed: {
    opacity: 0.7
  }
});
