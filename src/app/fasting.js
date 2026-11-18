import { Stack } from 'expo-router';
import { observer } from 'mobx-react-lite';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { ProgressRing } from '@/components/fasting/progress-ring';
import { ThemedText } from '@/components/themed-text';
import { ScreenScrollView } from '@/components/ui/screen-scroll-view';
import { SymbolView } from '@/components/ui/symbol-view';
import { Spacing } from '@/constants/theme';
import { useNow } from '@/hooks/useNow';
import { useTheme } from '@/hooks/use-theme';
import { fastProgress, formatClock, formatHours, scheduleStatus, stageFor, timeOf } from '@/lib/fasting';
import { pushOnce } from '@/lib/navigation';
import { ensureNotificationPermission } from '@/lib/notifications';
import { FASTING_PROTOCOLS, fastingStore } from '@/store/fastingStore';

const FASTING_COLOR = '#7B61FF';
const EATING_COLOR = '#4CAF50';
const HISTORY_LIMIT = 14;
const SHIFT_OPTIONS = [-15, -30, -60];

function Disclaimer({ theme, styles }) {
  const { t } = useTranslation();
  return <View style={[styles.disclaimer, { backgroundColor: theme.warning + '14', borderColor: theme.warning + '55' }]}>
      <SymbolView name={{ ios: 'exclamationmark.triangle.fill', android: 'warning', web: 'warning' }} size={16} tintColor={theme.warning} />
      <ThemedText type="caption" color={theme.text} style={styles.flex1}>{t('fasting.disclaimer')}</ThemedText>
    </View>;
}

/** Shown until the user turns fasting on: what it is + the health warning. */
function FastingIntro({ theme, styles }) {
  const { t } = useTranslation();
  async function handleEnable() {
    fastingStore.updateSettings({ isEnabled: true, acceptedDisclaimerAt: new Date().toISOString() });
    await ensureNotificationPermission({ ask: true, channelName: t('fasting.notifications.channel') });
  }
  return <ScreenScrollView gap={Spacing.three} horizontalPadding={20}>
      <View style={[styles.card, styles.introCard]}>
        <View style={[styles.introIcon, { backgroundColor: FASTING_COLOR + '22' }]}>
          <SymbolView name={{ ios: 'clock', android: 'schedule', web: 'schedule' }} size={32} tintColor={FASTING_COLOR} />
        </View>
        <ThemedText type="headline" color={theme.text} style={styles.center}>{t('fasting.introTitle')}</ThemedText>
        <ThemedText type="small" color={theme.textSecondary} style={styles.center}>{t('fasting.introText')}</ThemedText>
      </View>
      <View style={styles.card}>
        {FASTING_PROTOCOLS.slice(1, 4).map(protocol => <View key={protocol.id} style={styles.introRow}>
            <ThemedText type="smallBold" color={FASTING_COLOR} style={styles.introProtocol}>{t(`fasting.protocols.${protocol.id}.label`)}</ThemedText>
            <ThemedText type="caption" color={theme.textSecondary} style={styles.flex1}>{t(`fasting.protocols.${protocol.id}.description`)}</ThemedText>
          </View>)}
      </View>
      <Disclaimer theme={theme} styles={styles} />
      <Pressable onPress={handleEnable} style={({ pressed }) => [styles.primaryButton, { backgroundColor: FASTING_COLOR }, pressed && styles.pressed]}>
        <ThemedText type="smallBold" color="#ffffff">{t('fasting.enable')}</ThemedText>
      </Pressable>
      <ThemedText type="caption" color={theme.textSecondary} style={styles.center}>{t('fasting.enableHint')}</ThemedText>
    </ScreenScrollView>;
}

function FastingScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const now = useNow(1000);
  const [showShift, setShowShift] = useState(false);
  const { settings, activeFast, stats } = fastingStore;

  if (!settings.isEnabled) {
    return <>
        <Stack.Screen options={{ headerRight: undefined }} />
        <FastingIntro theme={theme} styles={styles} />
      </>;
  }

  const running = activeFast ? fastProgress(activeFast, now) : null;
  const schedule = running ? null : scheduleStatus(now);
  const stage = running ? stageFor(running.elapsedHours) : null;
  const ringColor = running ? FASTING_COLOR : EATING_COLOR;

  function handleStart() {
    fastingStore.startFast();
    setShowShift(false);
  }

  function handleEnd() {
    if (running && !running.isGoalReached) {
      Alert.alert(t('fasting.endEarlyTitle'), t('fasting.endEarlyMessage', { done: formatHours(running.elapsedHours), goal: activeFast.targetHours }), [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('fasting.endFast'), style: 'destructive', onPress: () => fastingStore.endFast() }
      ]);
      return;
    }
    fastingStore.endFast();
  }

  function handleDelete(fast) {
    Alert.alert(t('fasting.deleteTitle'), undefined, [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.delete'), style: 'destructive', onPress: () => fastingStore.removeFast(fast.id) }
    ]);
  }

  const settingsButton = <Pressable onPress={() => pushOnce('/fasting-settings')} hitSlop={8} accessibilityLabel={t('fasting.settingsTitle')}>
      <SymbolView name={{ ios: 'gearshape.fill', android: 'settings', web: 'settings' }} size={22} tintColor={theme.text} />
    </Pressable>;

  return <ScreenScrollView gap={Spacing.three} horizontalPadding={20}>
      <Stack.Screen options={{ headerRight: () => settingsButton }} />

      <View style={[styles.card, styles.timerCard]}>
        <ProgressRing progress={running ? running.progress : 1 - schedule.remainingMs / ((schedule.phase === 'eating' ? fastingStore.eatingHours : settings.fastingHours) * 3600000)} color={ringColor} trackColor={ringColor + '22'}>
          <ThemedText type="caption" color={theme.textSecondary}>{running ? t('fasting.fastingNow') : schedule.phase === 'eating' ? t('fasting.eatingWindow') : t('fasting.scheduledFast')}</ThemedText>
          <ThemedText type="title" color={theme.text} style={styles.clock}>{running ? formatClock(running.elapsedMs) : formatClock(schedule.remainingMs)}</ThemedText>
          <ThemedText type="caption" color={theme.textSecondary} style={styles.center}>
            {running ? running.isGoalReached ? t('fasting.goalReached', { hours: activeFast.targetHours }) : t('fasting.untilGoal', { time: formatClock(running.remainingMs) }) : schedule.phase === 'eating' ? t('fasting.windowClosesAt', { time: timeOf(schedule.closesAt) }) : t('fasting.windowOpensAt', { time: timeOf(schedule.opensAt) })}
          </ThemedText>
        </ProgressRing>

        {running && <View style={styles.timesRow}>
            <View style={styles.timeCell}>
              <ThemedText type="caption" color={theme.textSecondary}>{t('fasting.started')}</ThemedText>
              <ThemedText type="smallBold" color={theme.text}>{timeOf(new Date(activeFast.startedAt))}</ThemedText>
            </View>
            <View style={styles.timeCell}>
              <ThemedText type="caption" color={theme.textSecondary}>{t('fasting.goal', { hours: activeFast.targetHours })}</ThemedText>
              <ThemedText type="smallBold" color={theme.text}>{timeOf(running.goalAt)}</ThemedText>
            </View>
          </View>}

        {stage && <View style={[styles.stage, { backgroundColor: FASTING_COLOR + '14' }]}>
            <ThemedText type="smallBold" color={FASTING_COLOR}>{t(`fasting.stages.${stage.id}.title`)}</ThemedText>
            <ThemedText type="caption" color={theme.textSecondary}>{t(`fasting.stages.${stage.id}.description`)}</ThemedText>
          </View>}

        {!running && schedule.phase === 'fasting' && <ThemedText type="caption" color={theme.textSecondary} style={styles.center}>{t('fasting.notStartedHint')}</ThemedText>}

        <Pressable onPress={running ? handleEnd : handleStart} style={({ pressed }) => [styles.primaryButton, styles.fullWidth, { backgroundColor: running ? theme.text : FASTING_COLOR }, pressed && styles.pressed]}>
          <ThemedText type="smallBold" color={running ? theme.background : '#ffffff'}>{running ? t('fasting.endFast') : t('fasting.startFast', { hours: settings.fastingHours })}</ThemedText>
        </Pressable>

        {running && (showShift ? <View style={styles.shiftRow}>
              <ThemedText type="caption" color={theme.textSecondary}>{t('fasting.startedEarlier')}</ThemedText>
              {SHIFT_OPTIONS.map(minutes => <Pressable key={minutes} onPress={() => fastingStore.shiftActiveStart(minutes)} style={[styles.chip, { borderColor: theme.border }]}>
                  <ThemedText type="caption" color={theme.text}>{t('fasting.minutesShort', { minutes })}</ThemedText>
                </Pressable>)}
            </View> : <Pressable onPress={() => setShowShift(true)} hitSlop={6}>
              <ThemedText type="caption" color={FASTING_COLOR}>{t('fasting.editStart')}</ThemedText>
            </Pressable>)}
      </View>

      <Pressable onPress={() => pushOnce('/fasting-settings')} style={({ pressed }) => [styles.card, styles.scheduleRow, pressed && styles.pressed]}>
        <View style={styles.flex1}>
          <ThemedText type="smallBold" color={theme.text}>{t(`fasting.protocols.${settings.protocolId}.label`)}</ThemedText>
          <ThemedText type="caption" color={theme.textSecondary}>{t('fasting.eatingWindowRange', { from: settings.eatingStart, to: fastingStore.eatingEnd })}</ThemedText>
        </View>
        <SymbolView name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }} size={14} tintColor={theme.textSecondary} />
      </Pressable>

      <View style={styles.statsRow}>
        {[{ key: 'streak', value: stats.streak }, { key: 'count', value: stats.count }, { key: 'longest', value: formatHours(stats.longestHours) }].map(item => <View key={item.key} style={[styles.card, styles.statCard]}>
            <ThemedText type="headline" color={FASTING_COLOR}>{item.value}</ThemedText>
            <ThemedText type="caption" color={theme.textSecondary} style={styles.center}>{t(`fasting.stats.${item.key}`)}</ThemedText>
          </View>)}
      </View>

      {fastingStore.completedFasts.length > 0 && <View style={styles.card}>
          <ThemedText type="smallBold" color={theme.text}>{t('fasting.history')}</ThemedText>
          {fastingStore.completedFasts.slice(0, HISTORY_LIMIT).map(fast => {
          const hours = (new Date(fast.endedAt) - new Date(fast.startedAt)) / 3600000;
          const reached = hours >= fast.targetHours;
          return <View key={fast.id} style={[styles.historyRow, { borderTopColor: theme.border }]}>
                <SymbolView name={reached ? { ios: 'checkmark.circle.fill', android: 'check_circle', web: 'check_circle' } : { ios: 'circle', android: 'radio_button_unchecked', web: 'radio_button_unchecked' }} size={20} tintColor={reached ? FASTING_COLOR : theme.border} />
                <View style={styles.flex1}>
                  <ThemedText type="small" color={theme.text}>{new Date(fast.startedAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })} · {timeOf(new Date(fast.startedAt))}–{timeOf(new Date(fast.endedAt))}</ThemedText>
                  <ThemedText type="caption" color={theme.textSecondary}>{t('fasting.historyDuration', { hours: formatHours(hours), goal: fast.targetHours })}</ThemedText>
                </View>
                <Pressable onPress={() => handleDelete(fast)} hitSlop={8}>
                  <SymbolView name={{ ios: 'trash', android: 'delete', web: 'delete' }} size={16} tintColor={theme.textSecondary} />
                </Pressable>
              </View>;
        })}
        </View>}

      <Disclaimer theme={theme} styles={styles} />
    </ScreenScrollView>;
}

export default observer(FastingScreen);

const createStyles = theme => StyleSheet.create({
  flex1: { flex: 1 },
  center: { textAlign: 'center' },
  pressed: { opacity: 0.85 },
  fullWidth: { alignSelf: 'stretch' },
  card: {
    backgroundColor: theme.background,
    borderColor: theme.border,
    borderWidth: 1,
    borderRadius: 20,
    padding: Spacing.three,
    gap: Spacing.two
  },
  introCard: { alignItems: 'center', gap: Spacing.two, paddingVertical: Spacing.four },
  introIcon: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center' },
  introRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  introProtocol: { width: 52 },
  disclaimer: { flexDirection: 'row', gap: Spacing.two, borderWidth: 1, borderRadius: 14, padding: Spacing.three },
  primaryButton: { alignItems: 'center', justifyContent: 'center', borderRadius: 14, paddingVertical: Spacing.three },
  timerCard: { alignItems: 'center', gap: Spacing.three, paddingVertical: Spacing.four },
  clock: { fontVariant: ['tabular-nums'] },
  timesRow: { flexDirection: 'row', alignSelf: 'stretch', justifyContent: 'space-around' },
  timeCell: { alignItems: 'center', gap: 2 },
  stage: { alignSelf: 'stretch', borderRadius: 14, padding: Spacing.three, gap: 2 },
  shiftRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: Spacing.two, justifyContent: 'center' },
  chip: { borderWidth: 1, borderRadius: 999, paddingHorizontal: Spacing.three, paddingVertical: 4 },
  scheduleRow: { flexDirection: 'row', alignItems: 'center' },
  statsRow: { flexDirection: 'row', gap: Spacing.two },
  statCard: { flex: 1, alignItems: 'center', gap: 2 },
  historyRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, borderTopWidth: StyleSheet.hairlineWidth, paddingTop: Spacing.two }
});
