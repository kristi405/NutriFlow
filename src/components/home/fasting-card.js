import { observer } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { SymbolView } from '@/components/ui/symbol-view';
import { Spacing } from '@/constants/theme';
import { useNow } from '@/hooks/useNow';
import { useTheme } from '@/hooks/use-theme';
import { fastProgress, formatClock, scheduleStatus, timeOf } from '@/lib/fasting';
import { pushOnce } from '@/lib/navigation';
import { fastingStore } from '@/store/fastingStore';

const FASTING_COLOR = '#7B61FF';

/** Fasting mode off: a small invitation that leads to turning it on (can be hidden). */
function FastingPromo({ theme }) {
  const { t } = useTranslation();
  return <Pressable onPress={() => pushOnce('/fasting')} style={({ pressed }) => [styles.card, styles.promo, { backgroundColor: theme.background, borderColor: FASTING_COLOR + '66' }, pressed && styles.pressed]}>
      <View style={[styles.promoIcon, { backgroundColor: FASTING_COLOR + '1F' }]}>
        <SymbolView name={{ ios: 'clock', android: 'schedule', web: 'schedule' }} size={20} tintColor={FASTING_COLOR} />
      </View>
      <View style={styles.flex1}>
        <ThemedText type="smallBold" color={theme.text}>{t('fasting.title')}</ThemedText>
        <ThemedText type="caption" color={theme.textSecondary}>{t('fasting.homePromo')}</ThemedText>
      </View>
      <Pressable onPress={fastingStore.hideHomePromo} hitSlop={10} accessibilityLabel={t('fasting.homePromoHide')}>
        <SymbolView name={{ ios: 'xmark', android: 'close', web: 'close' }} size={14} tintColor={theme.textSecondary} />
      </Pressable>
    </Pressable>;
}

// observer of its own: it reads the running fast from the store.
const FastingStatus = observer(function FastingStatus({ theme }) {
  const { t } = useTranslation();
  const now = useNow(30000);
  const fast = fastingStore.activeFast;
  const running = fast ? fastProgress(fast, now) : null;
  const schedule = running ? null : scheduleStatus(now);

  return <Pressable onPress={() => pushOnce('/fasting')} style={({ pressed }) => [styles.card, { backgroundColor: theme.background, borderColor: running ? FASTING_COLOR : theme.border }, pressed && styles.pressed]}>
      <View style={styles.headerRow}>
        <SymbolView name={{ ios: 'clock', android: 'schedule', web: 'schedule' }} size={16} tintColor={FASTING_COLOR} />
        <ThemedText type="smallBold" color={theme.text} style={styles.flex1}>{t('fasting.title')}</ThemedText>
        <ThemedText type="small" color={theme.textSecondary}>
          {running ? formatClock(running.elapsedMs).slice(0, 5) : schedule.phase === 'eating' ? t('fasting.windowClosesAt', { time: timeOf(schedule.closesAt) }) : t('fasting.windowOpensAt', { time: timeOf(schedule.opensAt) })}
        </ThemedText>
      </View>
      {running ? <>
          <View style={[styles.track, { backgroundColor: FASTING_COLOR + '22' }]}>
            <View style={[styles.fill, { width: `${Math.min(100, running.progress * 100)}%`, backgroundColor: FASTING_COLOR }]} />
          </View>
          <ThemedText type="caption" color={theme.textSecondary}>
            {running.isGoalReached ? t('fasting.goalReached', { hours: fast.targetHours }) : t('fasting.goalAt', { hours: fast.targetHours, time: timeOf(running.goalAt) })}
          </ThemedText>
        </> : <View style={styles.row}>
          <ThemedText type="caption" color={theme.textSecondary} style={styles.flex1}>
            {schedule.phase === 'eating' ? t('fasting.eatingWindow') : t('fasting.notStartedHint')}
          </ThemedText>
          <Pressable onPress={() => fastingStore.startFast()} hitSlop={6} style={[styles.button, { backgroundColor: FASTING_COLOR }]}>
            <ThemedText type="caption" color="#ffffff" style={styles.buttonText}>{t('fasting.start')}</ThemedText>
          </Pressable>
        </View>}
    </Pressable>;
});

/**
 * Home entry point for intermittent fasting: the live status when the mode is
 * on, otherwise an invitation to try it (until hidden — the mode stays
 * reachable from the profile).
 */
function FastingCardComponent() {
  const theme = useTheme();
  if (!fastingStore.isEnabled) return fastingStore.isHomePromoHidden ? null : <FastingPromo theme={theme} />;
  return <FastingStatus theme={theme} />;
}

export const FastingCard = observer(FastingCardComponent);

const styles = StyleSheet.create({
  flex1: { flex: 1 },
  pressed: { opacity: 0.85 },
  card: { borderRadius: 20, borderWidth: 1, padding: Spacing.three, gap: Spacing.two },
  promo: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  promoIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  track: { height: 8, borderRadius: 4, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 4 },
  button: { borderRadius: 999, paddingHorizontal: Spacing.three, paddingVertical: 6 },
  buttonText: { fontWeight: '700' }
});
