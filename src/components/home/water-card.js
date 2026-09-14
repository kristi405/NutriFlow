import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
const WATER_BLUE = '#2F80ED';
const WATER_TRACK = '#DCEBFC';
const QUICK_AMOUNTS_ML = [100, 250, 500];
export function WaterCard({
  consumedMl,
  targetMl,
  onAdd
}) {
  const { t } = useTranslation();
  const theme = useTheme();
  const progress = targetMl > 0 ? Math.min(1, consumedMl / targetMl) : 0;
  // Matches exactly (rounded to 1 decimal place, same precision shown below) — not just "at or over".
  const goalReached = targetMl > 0 && (consumedMl / 1000).toFixed(1) === (targetMl / 1000).toFixed(1);
  return <View style={[styles.card, {
    backgroundColor: theme.background,
    borderColor: goalReached ? WATER_BLUE : theme.border
  }]}>
      <View style={styles.headerRow}>
        <View style={styles.titleRow}>
          <SymbolView name={{ ios: 'drop.fill', android: 'water_drop', web: 'water_drop' }} size={16} tintColor={WATER_BLUE} />
          <ThemedText type="smallBold" color={theme.text}>{t('nutrition.water')}</ThemedText>
          {goalReached && <SymbolView name={{ ios: 'star.fill', android: 'star', web: 'star' }} size={14} tintColor="#FFC107" />}
        </View>
        <View style={styles.headerRight}>
          <ThemedText type="small" color={theme.textSecondary}>
            {(consumedMl / 1000).toFixed(1)} / {(targetMl / 1000).toFixed(1)} L
          </ThemedText>
          <Pressable onPress={() => onAdd(-Math.min(100, consumedMl))} hitSlop={8} disabled={consumedMl <= 0}>
            <SymbolView name={{ ios: 'minus.circle', android: 'remove_circle', web: 'remove_circle' }} size={18} tintColor={consumedMl <= 0 ? theme.border : WATER_BLUE} />
          </Pressable>
        </View>
      </View>
      <View style={[styles.track, {
      backgroundColor: WATER_TRACK
    }]}>
        <View style={[styles.fill, {
        width: `${progress * 100}%`,
        backgroundColor: WATER_BLUE
      }]} />
      </View>
      <View style={styles.buttonRow}>
        {QUICK_AMOUNTS_ML.map(amount => <Pressable key={amount} onPress={() => onAdd(amount)} style={({
        pressed
      }) => [styles.quickButton, {
        borderColor: theme.border
      }, pressed && styles.pressed]}>
            <ThemedText type="caption" color={theme.text}>+{amount} ml</ThemedText>
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
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  headerRight: {
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
  },
  buttonRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginTop: Spacing.one
  },
  quickButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.one,
    borderRadius: 10,
    borderWidth: 1
  },
  pressed: {
    opacity: 0.7
  }
});
