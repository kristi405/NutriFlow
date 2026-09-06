import { ThemedText } from '@/components/themed-text';
import { PremiumCard } from '@/components/ui/premium-card';
import { ScreenScrollView } from '@/components/ui/screen-scroll-view';
import { Colors, LoginButtonGreen, Spacing } from '@/constants/theme';
import { authStore } from '@/store/authStore';
import { foodLogStore } from '@/store/foodLogStore';
import { mealPlanStore } from '@/store/mealPlanStore';
import { profileStore } from '@/store/profileStore';
import { LinearGradient } from 'expo-linear-gradient';
import { SymbolView } from 'expo-symbols';
import { observer } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';
import { Alert, Pressable, StyleSheet, Switch, View } from 'react-native';

const theme = Colors.light;

const GOAL_LABEL_KEYS = {
  'lose-weight': 'onboarding.goal.loseWeight',
  'maintain-weight': 'onboarding.goal.maintainWeight',
  'gain-weight': 'onboarding.goal.gainWeight',
  'build-muscle': 'onboarding.goal.buildMuscle',
  'eat-healthier': 'onboarding.goal.eatHealthier'
};
const ACTIVITY_LABEL_KEYS = {
  sedentary: 'onboarding.activity.sedentary',
  light: 'onboarding.activity.light',
  moderate: 'onboarding.activity.moderate',
  active: 'onboarding.activity.active',
  'very-active': 'onboarding.activity.veryActive'
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

function ProfileScreen() {
  const { t } = useTranslation();
  const profile = profileStore.profile;
  const account = authStore.currentUser;

  if (!profile) return null;

  function showComingSoon(feature) {
    Alert.alert(feature, t('home.comingSoon'));
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
      <LinearGradient colors={[LoginButtonGreen, '#81C784']} start={{
      x: 0,
      y: 0
    }} end={{
      x: 1,
      y: 0
    }} style={styles.heroCard}>
        <View style={styles.avatarWrapper}>
          <View style={styles.avatar}>
            <ThemedText type="headline" color={LoginButtonGreen}>
              {profile.name.trim().charAt(0).toUpperCase()}
            </ThemedText>
          </View>
          <Pressable onPress={() => showComingSoon(t('profile.editPhoto'))} hitSlop={8} style={styles.avatarEditBadge}>
            <SymbolView name={{ ios: 'pencil', android: 'edit', web: 'edit' }} size={11} tintColor="#ffffff" />
          </Pressable>
        </View>
        <View style={styles.heroTextColumn}>
          <ThemedText type="headline" color="#ffffff">{profile.name}</ThemedText>
          <ThemedText type="caption" color="#ffffff">{account?.email ?? ''}</ThemedText>
        </View>
        <Pressable onPress={() => showComingSoon(t('profile.editProfile'))} hitSlop={8} style={styles.editButton}>
          <SymbolView name={{ ios: 'pencil', android: 'edit', web: 'edit' }} size={20} tintColor="#ffffff" />
        </Pressable>
      </LinearGradient>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <SymbolView name={{ ios: 'fork.knife', android: 'restaurant_menu', web: 'restaurant_menu' }} size={20} tintColor={LoginButtonGreen} />
          <ThemedText type="smallBold" color={theme.text}>{foodLogStore.entries.length}</ThemedText>
          <ThemedText type="caption" color={theme.textSecondary}>{t('profile.mealsLogged')}</ThemedText>
        </View>
        <View style={styles.statCard}>
          <SymbolView name={{ ios: 'calendar', android: 'calendar_month', web: 'calendar_month' }} size={20} tintColor={theme.secondary} />
          <ThemedText type="smallBold" color={theme.text}>{mealPlanStore.items.length}</ThemedText>
          <ThemedText type="caption" color={theme.textSecondary}>{t('profile.mealsPlanned')}</ThemedText>
        </View>
        <View style={styles.statCard}>
          <SymbolView name={{ ios: 'star', android: 'star', web: 'star' }} size={20} tintColor="#FFC107" />
          <ThemedText type="smallBold" color={theme.text}>{memberSinceLabel}</ThemedText>
          <ThemedText type="caption" color={theme.textSecondary}>{t('profile.memberSince')}</ThemedText>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <View style={styles.cardTitleRow}>
            <SymbolView name={{ ios: 'target', android: 'target', web: 'target' }} size={16} tintColor={LoginButtonGreen} />
            <ThemedText type="smallBold" color={theme.text}>{t('profile.personalGoals')}</ThemedText>
          </View>
          <Pressable onPress={() => showComingSoon(t('profile.personalGoals'))} hitSlop={8}>
            <SymbolView name={{ ios: 'pencil', android: 'edit', web: 'edit' }} size={16} tintColor={theme.textSecondary} />
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
        <View style={styles.cardTitleRow}>
          <SymbolView name={{ ios: 'fork.knife', android: 'restaurant_menu', web: 'restaurant_menu' }} size={16} tintColor={LoginButtonGreen} />
          <ThemedText type="smallBold" color={theme.text}>{t('profile.dietPreferences')}</ThemedText>
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
          <SymbolView name={{ ios: 'gearshape.fill', android: 'settings', web: 'settings' }} size={16} tintColor={LoginButtonGreen} />
          <ThemedText type="smallBold" color={theme.text}>{t('profile.settings')}</ThemedText>
        </View>
        <View style={styles.settingsList}>
          <SettingsRow icon={{ ios: 'bell.fill', android: 'notifications', web: 'notifications' }} label={t('profile.notifications')} onPress={() => showComingSoon(t('profile.notifications'))} />
          <SettingsRow icon={{ ios: 'moon.fill', android: 'dark_mode', web: 'dark_mode' }} label={t('profile.darkMode')} right={<Switch value={false} onValueChange={() => showComingSoon(t('profile.darkMode'))} trackColor={{
          false: theme.border,
          true: LoginButtonGreen
        }} />} />
          <SettingsRow icon={{ ios: 'globe', android: 'language', web: 'language' }} label={t('profile.language')} onPress={() => showComingSoon(t('profile.language'))} />
          <SettingsRow icon={{ ios: 'lock.fill', android: 'lock', web: 'lock' }} label={t('profile.privacySecurity')} onPress={() => showComingSoon(t('profile.privacySecurity'))} />
          <SettingsRow icon={{ ios: 'questionmark.circle.fill', android: 'help', web: 'help' }} label={t('profile.helpSupport')} onPress={() => showComingSoon(t('profile.helpSupport'))} last />
        </View>
      </View>

      <PremiumCard />

      <Pressable onPress={handleSignOut} style={styles.signOutButton}>
        <ThemedText type="smallBold" color={theme.error}>{t('profile.signOut')}</ThemedText>
      </Pressable>
    </ScreenScrollView>;
}

function SettingsRow({ icon, label, onPress, right, last }) {
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

const styles = StyleSheet.create({
  heroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    borderRadius: 20,
    padding: Spacing.four
  },
  heroTextColumn: {
    flex: 1,
    gap: Spacing.half
  },
  editButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  avatarWrapper: {
    width: 76,
    height: 76
  },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center'
  },
  avatarEditBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: LoginButtonGreen,
    borderWidth: 2,
    borderColor: '#ffffff',
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
    paddingVertical: Spacing.three
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
    backgroundColor: LoginButtonGreen,
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
    paddingVertical: Spacing.three
  }
});
