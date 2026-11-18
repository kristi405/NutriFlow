import { router } from 'expo-router';
import { observer } from 'mobx-react-lite';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Linking, Pressable, StyleSheet, Switch, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ScreenScrollView } from '@/components/ui/screen-scroll-view';
import { SymbolView } from '@/components/ui/symbol-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { ensureNotificationPermission } from '@/lib/notifications';
import { FASTING_PROTOCOLS, fastingStore, shiftTime } from '@/store/fastingStore';
import { notificationsStore } from '@/store/notificationsStore';

const FASTING_COLOR = '#7B61FF';
const TIME_STEP_MINUTES = 30;
const NOTIFY_OPTIONS = ['notifyFastStart', 'notifyFastEnd', 'notifyGoal'];

function FastingSettingsScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { settings } = fastingStore;
  const [isPermissionDenied, setIsPermissionDenied] = useState(false);

  useEffect(() => {
    ensureNotificationPermission().then(granted => setIsPermissionDenied(!granted));
  }, []);

  async function toggleNotification(key, value) {
    fastingStore.updateSettings({ [key]: value });
    if (value) setIsPermissionDenied(!(await ensureNotificationPermission({ ask: true, channelName: t('fasting.notifications.channel') })));
  }

  function setEnabled(value) {
    fastingStore.updateSettings({ isEnabled: value });
    if (!value) router.back();
  }

  const switchColors = { trackColor: { false: theme.border, true: FASTING_COLOR }, thumbColor: '#ffffff' };

  return <ScreenScrollView gap={Spacing.three} horizontalPadding={20}>
      <View style={styles.card}>
        <View style={styles.row}>
          <View style={styles.flex1}>
            <ThemedText type="smallBold" color={theme.text}>{t('fasting.modeTitle')}</ThemedText>
            <ThemedText type="caption" color={theme.textSecondary}>{t('fasting.modeHint')}</ThemedText>
          </View>
          <Switch value={settings.isEnabled} onValueChange={setEnabled} {...switchColors} />
        </View>
      </View>

      <View style={styles.card}>
        <ThemedText type="smallBold" color={theme.text}>{t('fasting.protocolTitle')}</ThemedText>
        <View style={styles.protocolGrid}>
          {FASTING_PROTOCOLS.map(protocol => {
          const isActive = settings.protocolId === protocol.id;
          return <Pressable key={protocol.id} onPress={() => fastingStore.selectProtocol(protocol.id)} style={[styles.protocol, { borderColor: isActive ? FASTING_COLOR : theme.border, backgroundColor: isActive ? FASTING_COLOR + '14' : theme.background }]}>
                <ThemedText type="smallBold" color={isActive ? FASTING_COLOR : theme.text}>{t(`fasting.protocols.${protocol.id}.label`)}</ThemedText>
                <ThemedText type="caption" color={theme.textSecondary}>{t(`fasting.protocols.${protocol.id}.description`)}</ThemedText>
              </Pressable>;
        })}
        </View>
      </View>

      <View style={styles.card}>
        <ThemedText type="smallBold" color={theme.text}>{t('fasting.windowTitle')}</ThemedText>
        <ThemedText type="caption" color={theme.textSecondary}>{t('fasting.windowHint')}</ThemedText>
        <View style={styles.timeRow}>
          <Pressable onPress={() => fastingStore.updateSettings({ eatingStart: shiftTime(settings.eatingStart, -TIME_STEP_MINUTES) })} hitSlop={8} style={[styles.stepButton, { borderColor: theme.border }]} accessibilityLabel="-30">
            <SymbolView name={{ ios: 'minus', android: 'remove', web: 'remove' }} size={18} tintColor={theme.text} />
          </Pressable>
          <View style={styles.timeValue}>
            <ThemedText type="headline" color={FASTING_COLOR}>{settings.eatingStart} – {fastingStore.eatingEnd}</ThemedText>
            <ThemedText type="caption" color={theme.textSecondary}>{t('fasting.eatingHours', { hours: fastingStore.eatingHours })}</ThemedText>
          </View>
          <Pressable onPress={() => fastingStore.updateSettings({ eatingStart: shiftTime(settings.eatingStart, TIME_STEP_MINUTES) })} hitSlop={8} style={[styles.stepButton, { borderColor: theme.border }]} accessibilityLabel="+30">
            <SymbolView name={{ ios: 'plus', android: 'add', web: 'add' }} size={18} tintColor={theme.text} />
          </Pressable>
        </View>
      </View>

      <View style={styles.card}>
        <ThemedText type="smallBold" color={theme.text}>{t('fasting.notificationsTitle')}</ThemedText>
        {NOTIFY_OPTIONS.map(key => <View key={key} style={styles.row}>
            <View style={styles.flex1}>
              <ThemedText type="small" color={theme.text}>{t(`fasting.${key}`)}</ThemedText>
              <ThemedText type="caption" color={theme.textSecondary}>{t(`fasting.${key}Hint`, { start: settings.eatingStart, end: fastingStore.eatingEnd })}</ThemedText>
            </View>
            <Switch value={settings[key]} onValueChange={value => toggleNotification(key, value)} {...switchColors} />
          </View>)}
        {!notificationsStore.isEnabled && <ThemedText type="caption" color={theme.warning}>{t('fasting.notificationsOffInProfile')}</ThemedText>}
        {notificationsStore.isEnabled && isPermissionDenied && <Pressable onPress={() => Linking.openSettings()}>
            <ThemedText type="caption" color={theme.warning}>{t('fasting.notificationsDenied')}</ThemedText>
          </Pressable>}
      </View>
    </ScreenScrollView>;
}

export default observer(FastingSettingsScreen);

const createStyles = theme => StyleSheet.create({
  flex1: { flex: 1 },
  card: {
    backgroundColor: theme.background,
    borderColor: theme.border,
    borderWidth: 1,
    borderRadius: 20,
    padding: Spacing.three,
    gap: Spacing.two
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  protocolGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  protocol: { width: '48%', flexGrow: 1, borderWidth: 1.5, borderRadius: 14, padding: Spacing.two + 2, gap: 2 },
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  timeValue: { flex: 1, alignItems: 'center', gap: 2 },
  stepButton: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, alignItems: 'center', justifyContent: 'center' }
});
