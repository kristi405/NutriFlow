import { useMemo, useState } from 'react';
import { ThemedText } from '@/components/themed-text';
import { PremiumCard } from '@/components/ui/premium-card';
import { ScreenScrollView } from '@/components/ui/screen-scroll-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useKeyboardHeight } from '@/hooks/useKeyboardHeight';
import { deletePhoto, pickProfilePhoto } from '@/lib/profilePhoto';
import { PersonAvatar } from '@/components/people/person-avatar';
import { authStore } from '@/store/authStore';
import { foodLogStore } from '@/store/foodLogStore';
import { mealPlanStore } from '@/store/mealPlanStore';
import { peopleStore } from '@/store/peopleStore';
import { removeFamilyMember } from '@/store/peopleActions';
import { profileStore } from '@/store/profileStore';
import { notificationsStore } from '@/store/notificationsStore';
import { themeStore } from '@/store/themeStore';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { observer } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';
import { Alert, Linking, Modal, Pressable, StyleSheet, Switch, TextInput, View } from 'react-native';

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
  const profile = profileStore.activeProfile;
  const account = authStore.currentUser;
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [helpMessage, setHelpMessage] = useState('');
  const keyboardHeight = useKeyboardHeight();

  if (!profile) return null;

  async function handlePickPhoto(source) {
    try {
      const uri = await pickProfilePhoto(source);
      if (!uri) return;
      deletePhoto(profile.photoUri);
      profileStore.updateProfile({ photoUri: uri });
    } catch {
      Alert.alert(t('common.errorTitle'), t('common.errorDefault'));
    }
  }

  function handleEditPhoto() {
    const actions = [{ text: t('recipes.takePhoto'), onPress: () => handlePickPhoto('camera') }, { text: t('recipes.chooseFromLibrary'), onPress: () => handlePickPhoto('library') }];
    if (profile.photoUri) {
      actions.push({ text: t('profile.removePhoto'), style: 'destructive', onPress: () => {
        deletePhoto(profile.photoUri);
        profileStore.updateProfile({ photoUri: null });
      } });
    }
    actions.push({ text: t('common.cancel'), style: 'cancel' });
    Alert.alert(t('profile.editPhoto'), undefined, actions);
  }

  function handleRemovePerson(member) {
    Alert.alert(t('people.removeTitle', { name: member.profile.name }), t('people.removeMessage'), [{ text: t('common.cancel'), style: 'cancel' }, {
      text: t('common.delete'),
      style: 'destructive',
      onPress: () => removeFamilyMember(member.id)
    }]);
  }

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



  const dietaryTags = profile.preferences?.dietaryTags ?? [];
  const allergies = profile.preferences?.allergies ?? [];

  return <ScreenScrollView gap={Spacing.three}>
      <View style={styles.heroSection}>
        <View style={styles.avatarWrapper}>
          <Pressable onPress={handleEditPhoto} style={styles.avatar}>
            {profile.photoUri ? <Image source={{ uri: profile.photoUri }} style={styles.avatarImage} contentFit="cover" /> : <SymbolView name={{ ios: 'person.fill', android: 'person', web: 'person' }} size={44} tintColor={theme.accent} />}
          </Pressable>
          <Pressable onPress={handleEditPhoto} hitSlop={8} style={styles.avatarEditBadge}>
            <SymbolView name={{ ios: 'pencil', android: 'edit', web: 'edit' }} size={15} tintColor="#ffffff" />
          </Pressable>
        </View>
        <ThemedText type="headline" color={theme.text}>{profile.name}</ThemedText>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <SymbolView name={{ ios: 'fork.knife', android: 'restaurant_menu', web: 'restaurant_menu' }} size={20} tintColor={theme.accent} />
          <ThemedText type="smallBold" color={theme.text} style={styles.statValue}>{foodLogStore.entriesOfPerson(peopleStore.currentPersonId).length}</ThemedText>
          <ThemedText type="caption" color={theme.textSecondary} style={styles.statLabel}>{t('profile.mealsLogged')}</ThemedText>
        </View>
        <View style={styles.statCard}>
          <SymbolView name={{ ios: 'calendar', android: 'calendar_month', web: 'calendar_month' }} size={20} tintColor={theme.secondary} />
          <ThemedText type="smallBold" color={theme.text} style={styles.statValue}>{mealPlanStore.itemsOfPerson(peopleStore.currentPersonId).length}</ThemedText>
          <ThemedText type="caption" color={theme.textSecondary} style={styles.statLabel}>{t('profile.mealsPlanned')}</ThemedText>
        </View>
        <View style={styles.statCard}>
          <SymbolView name={{ ios: 'star', android: 'star', web: 'star' }} size={20} tintColor="#FFC107" />
          <ThemedText type="smallBold" color={theme.text} style={styles.statValue}>{memberSinceLabel}</ThemedText>
          <ThemedText type="caption" color={theme.textSecondary} style={styles.statLabel}>{t('profile.memberSince')}</ThemedText>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.cardTitleRow}>
          <SymbolView name={{ ios: 'person.2.fill', android: 'group', web: 'group' }} size={18} tintColor={theme.accent} />
          <ThemedText type="smallBold" color={theme.text}>{t('people.title')}</ThemedText>
        </View>
        {[{ id: null, profile: profileStore.profile, isMe: true }, ...peopleStore.members].map(person => {
        const isActive = person.id === peopleStore.currentPersonId;
        return <View key={person.id ?? 'me'} style={styles.peopleRow}>
              <Pressable onPress={() => peopleStore.setActive(person.id)} style={styles.peoplePressable}>
                <PersonAvatar profile={person.profile} size={34} />
                <View style={styles.peopleText}>
                  <ThemedText type="smallBold" color={theme.text} numberOfLines={1}>{person.profile.name}</ThemedText>
                  {person.isMe ? <ThemedText type="caption" color={theme.textSecondary}>{t('people.you')}</ThemedText> : null}
                </View>
                {isActive ? <SymbolView name={{ ios: 'checkmark.circle.fill', android: 'check_circle', web: 'check_circle' }} size={20} tintColor={theme.accent} /> : null}
              </Pressable>
              {person.isMe ? null : <Pressable onPress={() => handleRemovePerson(person)} hitSlop={8}>
                  <SymbolView name={{ ios: 'trash', android: 'delete', web: 'delete' }} size={18} tintColor={theme.textSecondary} />
                </Pressable>}
            </View>;
      })}
        {peopleStore.members.length > 0 && <View style={styles.shareMenuRow}>
            <View style={styles.peopleText}>
              <ThemedText type="smallBold" color={theme.text}>{t('people.sharedMenu')}</ThemedText>
              <ThemedText type="caption" color={theme.textSecondary}>{t('people.sharedMenuHint')}</ThemedText>
            </View>
            <Switch value={peopleStore.shareMenu} onValueChange={peopleStore.setShareMenu} trackColor={{ true: theme.accent }} />
          </View>}
        {peopleStore.canAddMember && <Pressable onPress={() => router.push('/add-person')} style={[styles.addPersonButton, { borderColor: theme.accent }]}>
          <SymbolView name={{ ios: 'plus.circle.fill', android: 'add_circle', web: 'add_circle' }} size={18} tintColor={theme.accent} />
          <ThemedText type="smallBold" color={theme.accent}>{t('people.addPerson')}</ThemedText>
        </Pressable>}
      </View>

      <Pressable onPress={() => router.push('/edit-personal-goals')} style={({ pressed }) => [styles.card, styles.linkCard, pressed && styles.linkCardPressed]}>
        <View style={styles.cardTitleRow}>
          <SymbolView name={{ ios: 'person.text.rectangle.fill', android: 'badge', web: 'badge' }} size={18} tintColor={theme.accent} />
          <ThemedText type="smallBold" color={theme.text}>{t('profile.personalGoals')}</ThemedText>
        </View>
        <SymbolView name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }} size={14} tintColor={theme.textSecondary} />
      </Pressable>

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
            <SymbolView name={{ ios: 'leaf.fill', android: 'eco', web: 'eco' }} size={13} tintColor={theme.secondary} />
            <ThemedText type="caption" color={theme.secondary} style={styles.preferenceTitle}>{t('profile.dietary')}</ThemedText>
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
            <SymbolView name={{ ios: 'exclamationmark.triangle.fill', android: 'warning', web: 'warning' }} size={13} tintColor={theme.error} />
            <ThemedText type="caption" color={theme.error} style={styles.preferenceTitle}>{t('profile.allergies')}</ThemedText>
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
        <Pressable style={[styles.modalBackdrop, { paddingBottom: keyboardHeight }]} onPress={() => setIsHelpModalOpen(false)}>
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
  peopleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three
  },
  peoplePressable: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three
  },
  peopleText: {
    flex: 1
  },
  shareMenuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three
  },
  addPersonButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderRadius: 999,
    paddingVertical: Spacing.two
  },
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
    borderWidth: 3,
    borderColor: theme.accent,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center'
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 56
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
    borderColor: theme.accent,
    shadowColor: theme.accent,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
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
  linkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  linkCardPressed: {
    opacity: 0.85
  },
  card: {
    gap: Spacing.three,
    backgroundColor: theme.background,
    borderColor: theme.accent,
    shadowColor: theme.accent,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
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
  preferenceTitle: {
    fontWeight: '700'
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
