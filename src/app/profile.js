import { useMemo, useState } from 'react';
import { ThemedText } from '@/components/themed-text';
import { PremiumCard } from '@/components/ui/premium-card';
import { ScreenScrollView } from '@/components/ui/screen-scroll-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { authStore } from '@/store/authStore';
import { foodLogStore } from '@/store/foodLogStore';
import { mealPlanStore } from '@/store/mealPlanStore';
import { profileStore } from '@/store/profileStore';
import { notificationsStore } from '@/store/notificationsStore';
import { themeStore } from '@/store/themeStore';
import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { observer } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';
import { Alert, Linking, Modal, Pressable, StyleSheet, Switch, TextInput, View } from 'react-native';

const GOAL_LABEL_KEYS = {
  'lose-weight': 'onboarding.goal.loseWeight',
  'maintain-weight': 'onboarding.goal.maintainWeight',
  'gain-weight': 'onboarding.goal.gainWeight',
  'build-muscle': 'onboarding.goal.buildMuscle',
  'eat-healthier': 'onboarding.goal.eatHealthier',
  'general-health': 'onboarding.goal.generalHealth'
};
const ACTIVITY_LABEL_KEYS = {
  sedentary: 'onboarding.activity.sedentary',
  light: 'onboarding.activity.light',
  moderate: 'onboarding.activity.moderate',
  active: 'onboarding.activity.active',
  'very-active': 'onboarding.activity.veryActive',
  'extra-active': 'onboarding.activity.extraActive'
};
const DIETARY_TAG_KEYS = {
  vegetarian: 'vegetarian',
  vegan: 'vegan',
  pescatarian: 'pescatarian',
  'gluten-free': 'glutenFree',
  'dairy-free': 'dairyFree',
  'low-carb': 'lowCarb',
  'high-protein': 'highProtein'
};
const ALLERGEN_TAG_KEYS = {
  gluten: 'gluten',
  dairy: 'dairy',
  egg: 'egg',
  fish: 'fish',
  shellfish: 'shellfish',
  'tree nuts': 'treeNuts',
  peanuts: 'peanuts',
  soy: 'soy',
  sesame: 'sesame'
};

const SUPPORT_EMAIL = '5507151kr@gmail.com';

// No real destinations wired up yet — tapping shows a "coming soon" alert until real links are provided.
const CONTACT_LINKS = [{ key: 'website', labelKey: 'profile.contactWebsite', icon: { ios: 'globe', android: 'public', web: 'public' } }, { key: 'linkedin', labelKey: 'profile.contactLinkedIn', icon: { ios: 'briefcase.fill', android: 'work', web: 'work' } }, { key: 'instagram', labelKey: 'profile.contactInstagram', icon: { ios: 'camera.fill', android: 'photo_camera', web: 'photo_camera' } }, { key: 'tiktok', labelKey: 'profile.contactTikTok', icon: { ios: 'music.note', android: 'music_note', web: 'music_note' } }];

function ProfileScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const profile = profileStore.profile;
  const account = authStore.currentUser;
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [helpMessage, setHelpMessage] = useState('');

  if (!profile) return null;

  function showComingSoon(feature) {
    Alert.alert(feature, t('home.comingSoon'));
  }

  function handleSendHelp() {
    const body = helpMessage.trim();
    if (!body) return;
    const url = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(t('profile.helpEmailSubject'))}&body=${encodeURIComponent(body)}`;
    Linking.canOpenURL(url).then(supported => {
      if (!supported) {
        Alert.alert(t('common.errorTitle'), t('common.errorDefault'));
        return;
      }
      Linking.openURL(url);
      setIsHelpModalOpen(false);
      setHelpMessage('');
    }).catch(() => {
      Alert.alert(t('common.errorTitle'), t('common.errorDefault'));
    });
  }

  function handleSignOut() {
    Alert.alert(t('profile.signOutConfirmTitle'), t('profile.signOutConfirmMessage'), [{ text: t('common.cancel'), style: 'cancel' }, {
      text: t('profile.signOut'),
      style: 'destructive',
      onPress: () => authStore.logout()
    }]);
  }

  const memberSinceLabel = account?.ctime ? new Date(account.ctime).toLocaleDateString(undefined, {
    month: 'short',
    year: 'numeric'
  }) : '—';

  const goalType = profile.goal?.type;
  const goalLabel = goalType ? t(GOAL_LABEL_KEYS[goalType] ?? '', { defaultValue: goalType }) : '—';
  const activityLabel = profile.activityLevel ? t(ACTIVITY_LABEL_KEYS[profile.activityLevel] ?? '', { defaultValue: profile.activityLevel }) : '—';

  const infoRows = [{
    icon: { ios: 'flag.fill', android: 'flag', web: 'flag' },
    label: t('profile.goal'),
    value: goalLabel
  }, {
    icon: { ios: 'birthday.cake.fill', android: 'cake', web: 'cake' },
    label: t('onboarding.personalInfo.age'),
    value: profile.age
  }, {
    icon: { ios: 'ruler.fill', android: 'straighten', web: 'straighten' },
    label: t('onboarding.personalInfo.height'),
    value: `${profile.heightCm} cm`
  }, {
    icon: { ios: 'scalemass.fill', android: 'monitor_weight', web: 'monitor_weight' },
    label: t('onboarding.personalInfo.weight'),
    value: `${profile.weightKg} ${t('common.kg')}`
  }, {
    icon: { ios: 'target', android: 'target', web: 'target' },
    label: t('onboarding.personalInfo.targetWeight'),
    value: profile.targetWeightKg !== undefined ? `${profile.targetWeightKg} ${t('common.kg')}` : '—'
  }, {
    icon: { ios: 'figure.walk', android: 'directions_walk', web: 'directions_walk' },
    label: t('profile.activityLevel'),
    value: activityLabel
  }];

  const dietaryTags = profile.preferences?.dietaryTags ?? [];
  const allergies = profile.preferences?.allergies ?? [];

  return <ScreenScrollView gap={Spacing.three}>
      <View style={styles.heroSection}>
        <View style={styles.avatarWrapper}>
          <View style={styles.avatar}>
            <SymbolView name={{ ios: 'person.fill', android: 'person', web: 'person' }} size={44} tintColor={theme.accent} />
          </View>
          <Pressable onPress={() => showComingSoon(t('profile.editPhoto'))} hitSlop={8} style={styles.avatarEditBadge}>
            <SymbolView name={{ ios: 'pencil', android: 'edit', web: 'edit' }} size={15} tintColor="#ffffff" />
          </Pressable>
        </View>
        <ThemedText type="headline" color={theme.text}>{profile.name}</ThemedText>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <SymbolView name={{ ios: 'fork.knife', android: 'restaurant_menu', web: 'restaurant_menu' }} size={20} tintColor={theme.accent} />
          <ThemedText type="smallBold" color={theme.text} style={styles.statValue}>{foodLogStore.entries.length}</ThemedText>
          <ThemedText type="caption" color={theme.textSecondary} style={styles.statLabel}>{t('profile.mealsLogged')}</ThemedText>
        </View>
        <View style={styles.statCard}>
          <SymbolView name={{ ios: 'calendar', android: 'calendar_month', web: 'calendar_month' }} size={20} tintColor={theme.secondary} />
          <ThemedText type="smallBold" color={theme.text} style={styles.statValue}>{mealPlanStore.items.length}</ThemedText>
          <ThemedText type="caption" color={theme.textSecondary} style={styles.statLabel}>{t('profile.mealsPlanned')}</ThemedText>
        </View>
        <View style={styles.statCard}>
          <SymbolView name={{ ios: 'star', android: 'star', web: 'star' }} size={20} tintColor="#FFC107" />
          <ThemedText type="smallBold" color={theme.text} style={styles.statValue}>{memberSinceLabel}</ThemedText>
          <ThemedText type="caption" color={theme.textSecondary} style={styles.statLabel}>{t('profile.memberSince')}</ThemedText>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <View style={styles.cardTitleRow}>
            <SymbolView name={{ ios: 'target', android: 'target', web: 'target' }} size={16} tintColor={theme.accent} />
            <ThemedText type="smallBold" color={theme.text}>{t('profile.personalGoals')}</ThemedText>
          </View>
          <Pressable onPress={() => router.push('/edit-personal-goals')} hitSlop={8} style={styles.personalGoalsEditButton}>
            <SymbolView name={{ ios: 'pencil', android: 'edit', web: 'edit' }} size={15} tintColor={theme.accent} />
          </Pressable>
        </View>
        <View style={styles.infoList}>
          {infoRows.map(row => <View key={row.label} style={styles.infoRow}>
              <View style={styles.infoRowLeft}>
                <SymbolView name={row.icon} size={14} tintColor={theme.textSecondary} />
                <ThemedText type="small" color={theme.textSecondary}>{row.label}</ThemedText>
              </View>
              <ThemedText type="small" color={theme.text}>{row.value}</ThemedText>
            </View>)}
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <View style={styles.cardTitleRow}>
            <SymbolView name={{ ios: 'fork.knife', android: 'restaurant_menu', web: 'restaurant_menu' }} size={16} tintColor={theme.accent} />
            <ThemedText type="smallBold" color={theme.text}>{t('profile.dietPreferences')}</ThemedText>
          </View>
          <Pressable onPress={() => router.push('/edit-diet-preferences')} hitSlop={8} style={styles.personalGoalsEditButton}>
            <SymbolView name={{ ios: 'pencil', android: 'edit', web: 'edit' }} size={15} tintColor={theme.accent} />
          </Pressable>
        </View>
        <View style={styles.preferenceGroup}>
          <View style={styles.preferenceLabelRow}>
            <SymbolView name={{ ios: 'leaf.fill', android: 'eco', web: 'eco' }} size={13} tintColor={theme.textSecondary} />
            <ThemedText type="caption" color={theme.textSecondary}>{t('profile.dietary')}</ThemedText>
          </View>
          <View style={styles.chipRow}>
            {dietaryTags.length === 0 ? <ThemedText type="small" color={theme.textSecondary}>{t('profile.noneSet')}</ThemedText> : dietaryTags.map(tag => <View key={tag} style={styles.chip}>
                  <ThemedText type="caption" color="#ffffff">
                    {t(`onboarding.preferences.${DIETARY_TAG_KEYS[tag] ?? tag}`, { defaultValue: tag })}
                  </ThemedText>
                </View>)}
          </View>
        </View>
        <View style={styles.preferenceGroup}>
          <View style={styles.preferenceLabelRow}>
            <SymbolView name={{ ios: 'exclamationmark.triangle.fill', android: 'warning', web: 'warning' }} size={13} tintColor={theme.textSecondary} />
            <ThemedText type="caption" color={theme.textSecondary}>{t('profile.allergies')}</ThemedText>
          </View>
          <View style={styles.chipRow}>
            {allergies.length === 0 ? <ThemedText type="small" color={theme.textSecondary}>{t('profile.noneSet')}</ThemedText> : allergies.map(tag => <View key={tag} style={styles.chip}>
                  <ThemedText type="caption" color="#ffffff">
                    {t(`onboarding.preferences.${ALLERGEN_TAG_KEYS[tag] ?? tag}`, { defaultValue: tag })}
                  </ThemedText>
                </View>)}
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.cardTitleRow}>
          <SymbolView name={{ ios: 'gearshape.fill', android: 'settings', web: 'settings' }} size={16} tintColor={theme.accent} />
          <ThemedText type="smallBold" color={theme.text}>{t('profile.settings')}</ThemedText>
        </View>
        <View style={styles.settingsList}>
          <SettingsRow styles={styles} theme={theme} icon={{ ios: 'bell.fill', android: 'notifications', web: 'notifications' }} label={t('profile.notifications')} right={<Switch value={notificationsStore.isEnabled} onValueChange={value => notificationsStore.setEnabled(value)} trackColor={{
          false: theme.textSecondary,
          true: theme.accent
        }} ios_backgroundColor={theme.textSecondary} thumbColor="#ffffff" />} />
          <SettingsRow styles={styles} theme={theme} icon={{ ios: 'moon.fill', android: 'dark_mode', web: 'dark_mode' }} label={t('profile.darkMode')} right={<Switch value={themeStore.isDarkMode} onValueChange={value => themeStore.setDarkMode(value)} trackColor={{
          false: theme.textSecondary,
          true: theme.accent
        }} ios_backgroundColor={theme.textSecondary} thumbColor="#ffffff" />} />
          <SettingsRow styles={styles} theme={theme} icon={{ ios: 'globe', android: 'language', web: 'language' }} label={t('profile.language')} onPress={() => router.push('/select-language')} />
          <SettingsRow styles={styles} theme={theme} icon={{ ios: 'lock.fill', android: 'lock', web: 'lock' }} label={t('profile.privacySecurity')} onPress={() => router.push('/privacy-policy')} />
          <SettingsRow styles={styles} theme={theme} icon={{ ios: 'questionmark.circle.fill', android: 'help', web: 'help' }} label={t('profile.helpSupport')} onPress={() => setIsHelpModalOpen(true)} last />
        </View>
      </View>

      <PremiumCard />

      <Pressable onPress={handleSignOut} style={styles.signOutButton}>
        <ThemedText type="smallBold" color={theme.error}>{t('profile.signOut')}</ThemedText>
      </Pressable>

      <Modal visible={isHelpModalOpen} transparent animationType="slide" onRequestClose={() => setIsHelpModalOpen(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setIsHelpModalOpen(false)}>
          <Pressable style={styles.modalSheet} onPress={event => event.stopPropagation()}>
            <View style={styles.modalHeader}>
              <View>
                <ThemedText type="smallBold" color={theme.text}>{t('profile.helpModalTitle')}</ThemedText>
                <ThemedText type="caption" color={theme.textSecondary}>{t('profile.helpModalSubtitle')}</ThemedText>
              </View>
              <Pressable onPress={() => setIsHelpModalOpen(false)} hitSlop={8} style={styles.personalGoalsEditButton}>
                <SymbolView name={{ ios: 'xmark', android: 'close', web: 'close' }} size={16} tintColor={theme.accent} />
              </Pressable>
            </View>

            <View style={styles.contactsRow}>
              {CONTACT_LINKS.map(contact => <Pressable key={contact.key} onPress={() => showComingSoon(t(contact.labelKey))} style={styles.contactButton}>
                  <View style={styles.contactIconWrapper}>
                    <SymbolView name={contact.icon} size={18} tintColor={theme.accent} />
                  </View>
                  <ThemedText type="caption" color={theme.textSecondary}>{t(contact.labelKey)}</ThemedText>
                </Pressable>)}
            </View>

            <TextInput value={helpMessage} onChangeText={setHelpMessage} placeholder={t('profile.helpMessagePlaceholder')} placeholderTextColor={theme.textSecondary} multiline numberOfLines={5} style={styles.helpInput} />

            <Pressable onPress={handleSendHelp} style={styles.helpSendButton}>
              <ThemedText type="default" color="#ffffff" style={styles.helpSendButtonText}>{t('common.send')}</ThemedText>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </ScreenScrollView>;
}

function SettingsRow({ styles, theme, icon, label, onPress, right, last }) {
  const content = <View style={[styles.settingsRow, !last && styles.settingsRowBorder]}>
      <View style={styles.settingsRowLeft}>
        <SymbolView name={icon} size={16} tintColor={theme.textSecondary} />
        <ThemedText type="small" color={theme.text}>{label}</ThemedText>
      </View>
      {right ?? <SymbolView name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }} size={14} tintColor={theme.textSecondary} />}
    </View>;
  if (!onPress) return content;
  return <Pressable onPress={onPress}>{content}</Pressable>;
}

export default observer(ProfileScreen);

const createStyles = theme => StyleSheet.create({
  heroSection: {
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.two
  },
  avatarWrapper: {
    width: 112,
    height: 112
  },
  avatar: {
    width: 112,
    height: 112,
    borderRadius: 56,
    // Always a light mint backdrop (not theme.primarySoft) so the icon stays visible in dark mode too.
    backgroundColor: '#E3F4EA',
    alignItems: 'center',
    justifyContent: 'center'
  },
  avatarEditBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.accent,
    borderWidth: 2,
    borderColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center'
  },
  personalGoalsEditButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: theme.accentSoft,
    alignItems: 'center',
    justifyContent: 'center'
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.two
  },
  statCard: {
    flex: 1,
    gap: Spacing.one,
    alignItems: 'center',
    backgroundColor: theme.background,
    borderColor: theme.border,
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.one
  },
  statValue: {
    width: '100%',
    textAlign: 'center'
  },
  statLabel: {
    width: '100%',
    textAlign: 'center'
  },
  card: {
    gap: Spacing.three,
    backgroundColor: theme.background,
    borderColor: theme.border,
    borderWidth: 1,
    borderRadius: 20,
    padding: Spacing.three
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one
  },
  infoList: {
    gap: Spacing.two
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  infoRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one
  },
  preferenceGroup: {
    gap: Spacing.two
  },
  preferenceLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.one
  },
  chip: {
    backgroundColor: theme.accent,
    borderRadius: 999,
    paddingHorizontal: Spacing.two,
    paddingVertical: 4
  },
  settingsList: {
    gap: 0
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.two
  },
  settingsRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: theme.border
  },
  settingsRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two
  },
  signOutButton: {
    alignItems: 'center',
    backgroundColor: theme.background,
    borderColor: theme.error,
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: Spacing.three,
    marginBottom: Spacing.four
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end'
  },
  modalSheet: {
    backgroundColor: theme.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: Spacing.four,
    paddingBottom: Spacing.six,
    gap: Spacing.three
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two
  },
  contactsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  contactButton: {
    alignItems: 'center',
    gap: Spacing.one
  },
  contactIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.accentSoft,
    alignItems: 'center',
    justifyContent: 'center'
  },
  helpInput: {
    borderColor: theme.border,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    fontSize: 16,
    color: theme.text,
    minHeight: 120,
    textAlignVertical: 'top'
  },
  helpSendButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.accent,
    borderRadius: 16,
    paddingVertical: Spacing.three
  },
  helpSendButtonText: {
    fontWeight: '700'
  }
});
