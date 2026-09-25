import { useMemo, useRef, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { observer } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { ScreenScrollView } from '@/components/ui/screen-scroll-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { profileStore } from '@/store/profileStore';

const GOAL_OPTIONS = [
  { type: 'lose-weight', labelKey: 'onboarding.goal.loseWeight', icon: { ios: 'figure.run', android: 'directions_run', web: 'directions_run' } },
  { type: 'maintain-weight', labelKey: 'onboarding.goal.maintainWeight', icon: { ios: 'figure.stand', android: 'accessibility_new', web: 'accessibility_new' } },
  { type: 'gain-weight', labelKey: 'onboarding.goal.gainWeight', icon: { ios: 'figure.strengthtraining.traditional', android: 'fitness_center', web: 'fitness_center' } },
  { type: 'build-muscle', labelKey: 'onboarding.goal.buildMuscle', icon: { ios: 'figure.core.training', android: 'sports_gymnastics', web: 'sports_gymnastics' } },
  { type: 'eat-healthier', labelKey: 'onboarding.goal.eatHealthier', icon: { ios: 'figure.yoga', android: 'self_improvement', web: 'self_improvement' } },
  { type: 'general-health', labelKey: 'onboarding.goal.generalHealth', icon: { ios: 'figure.hiking', android: 'hiking', web: 'hiking' } }
];
const ACTIVITY_OPTIONS = [
  { level: 'sedentary', labelKey: 'onboarding.activity.sedentary', icon: { ios: 'chair.fill', android: 'chair', web: 'chair' } },
  { level: 'light', labelKey: 'onboarding.activity.light', icon: { ios: 'figure.walk', android: 'directions_walk', web: 'directions_walk' } },
  { level: 'moderate', labelKey: 'onboarding.activity.moderate', icon: { ios: 'figure.run', android: 'directions_run', web: 'directions_run' } },
  { level: 'active', labelKey: 'onboarding.activity.active', icon: { ios: 'flame.fill', android: 'local_fire_department', web: 'local_fire_department' } },
  { level: 'very-active', labelKey: 'onboarding.activity.veryActive', icon: { ios: 'bolt.fill', android: 'bolt', web: 'bolt' } },
  { level: 'extra-active', labelKey: 'onboarding.activity.extraActive', icon: { ios: 'trophy.fill', android: 'emoji_events', web: 'emoji_events' } }
];

const STAT_FIELDS = [
  { key: 'age', labelKey: 'onboarding.personalInfo.age', unit: '', icon: { ios: 'birthday.cake.fill', android: 'cake', web: 'cake' }, keyboardType: 'number-pad' },
  { key: 'heightCm', labelKey: 'onboarding.personalInfo.height', unit: 'cm', icon: { ios: 'ruler.fill', android: 'straighten', web: 'straighten' }, keyboardType: 'decimal-pad' },
  { key: 'weightKg', labelKey: 'onboarding.personalInfo.weight', unit: 'kg', icon: { ios: 'scalemass.fill', android: 'monitor_weight', web: 'monitor_weight' }, keyboardType: 'decimal-pad' },
  { key: 'targetWeightKg', labelKey: 'onboarding.personalInfo.targetWeight', unit: 'kg', icon: { ios: 'target', android: 'target', web: 'target' }, keyboardType: 'decimal-pad' }
];

function EditPersonalGoalsScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const insets = useSafeAreaInsets();
  const profile = profileStore.activeProfile;
  const [name, setName] = useState(profile?.name ?? '');
  const [goalType, setGoalType] = useState(profile?.goal?.type);
  const [age, setAge] = useState(String(profile?.age ?? ''));
  const [heightCm, setHeightCm] = useState(String(profile?.heightCm ?? ''));
  const [weightKg, setWeightKg] = useState(String(profile?.weightKg ?? ''));
  const [targetWeightKg, setTargetWeightKg] = useState(profile?.targetWeightKg !== undefined ? String(profile.targetWeightKg) : '');
  const [activityLevel, setActivityLevel] = useState(profile?.activityLevel);
  const [focusedField, setFocusedField] = useState(null);
  const inputRefs = useRef({});
  const values = { age, heightCm, weightKg, targetWeightKg };
  const setters = { age: setAge, heightCm: setHeightCm, weightKg: setWeightKg, targetWeightKg: setTargetWeightKg };

  if (!profile) return null;

  function inputStyle(field) {
    return [styles.input, focusedField === field && styles.inputFocused];
  }

  function handleSave() {
    profileStore.updateGoal({ type: goalType });
    profileStore.updateProfile({
      name: name.trim() || profile.name,
      age: Number(age) || profile.age,
      heightCm: Number(heightCm) || profile.heightCm,
      weightKg: Number(weightKg) || profile.weightKg,
      targetWeightKg: targetWeightKg === '' ? undefined : Number(targetWeightKg),
      activityLevel
    });
    router.back();
  }

  return <LinearGradient colors={[theme.background, theme.primarySoft, theme.accentSoft]} style={styles.flex1}>
      <ScreenScrollView gap={Spacing.four} horizontalPadding={20} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag">
        <View style={styles.field}>
          <ThemedText type="small" color={theme.textSecondary}>{t('onboarding.personalInfo.name')}</ThemedText>
          <TextInput value={name} onChangeText={setName} onFocus={() => setFocusedField('name')} onBlur={() => setFocusedField(null)} autoCapitalize="words" autoCorrect={false} placeholder={t('onboarding.personalInfo.namePlaceholder')} style={[inputStyle('name'), styles.nameInput]} placeholderTextColor={theme.textSecondary} />
        </View>

        <View style={styles.field}>
          <ThemedText type="small" color={theme.textSecondary}>{t('profile.goal')}</ThemedText>
          <View style={styles.optionGrid}>
            {GOAL_OPTIONS.map(option => {
            const isActive = goalType === option.type;
            return <Pressable key={option.type} onPress={() => setGoalType(option.type)} style={[styles.optionTile, isActive && styles.optionTileActive]}>
                  <View style={[styles.optionIcon, isActive && styles.optionIconActive]}>
                    <SymbolView name={option.icon} size={18} tintColor={isActive ? '#ffffff' : theme.accent} />
                  </View>
                  <ThemedText type="smallBold" color={isActive ? theme.accent : theme.text} numberOfLines={2} style={styles.optionLabel}>{t(option.labelKey)}</ThemedText>
                  {isActive && <SymbolView name={{ ios: 'checkmark.circle.fill', android: 'check_circle', web: 'check_circle' }} size={16} tintColor={theme.accent} />}
                </Pressable>;
          })}
          </View>
        </View>

        <View style={styles.statsGrid}>
          {STAT_FIELDS.map(field => {
          const isFocused = focusedField === field.key;
          return <Pressable key={field.key} onPress={() => inputRefs.current[field.key]?.focus()} style={[styles.statCard, isFocused && styles.statCardFocused]}>
                <View style={styles.statHeader}>
                  <View style={styles.statIcon}>
                    <SymbolView name={field.icon} size={14} tintColor={theme.accent} />
                  </View>
                  <ThemedText type="caption" color={theme.textSecondary} numberOfLines={1} style={styles.statLabel}>{t(field.labelKey)}</ThemedText>
                </View>
                <View style={styles.statValueRow}>
                  <TextInput ref={ref => {
                inputRefs.current[field.key] = ref;
              }} value={values[field.key]} onChangeText={setters[field.key]} onFocus={() => setFocusedField(field.key)} onBlur={() => setFocusedField(null)} keyboardType={field.keyboardType} selectTextOnFocus style={styles.statInput} placeholder="—" placeholderTextColor={theme.textSecondary} />
                  <ThemedText type="small" color={theme.textSecondary}>{field.unit}</ThemedText>
                </View>
              </Pressable>;
        })}
        </View>

        <View style={styles.field}>
          <ThemedText type="small" color={theme.textSecondary}>{t('profile.activityLevel')}</ThemedText>
          <View style={styles.optionGrid}>
            {ACTIVITY_OPTIONS.map(option => {
            const isActive = activityLevel === option.level;
            return <Pressable key={option.level} onPress={() => setActivityLevel(option.level)} style={[styles.optionTile, isActive && styles.optionTileActive]}>
                  <View style={[styles.optionIcon, isActive && styles.optionIconActive]}>
                    <SymbolView name={option.icon} size={18} tintColor={isActive ? '#ffffff' : theme.accent} />
                  </View>
                  <ThemedText type="smallBold" color={isActive ? theme.accent : theme.text} numberOfLines={2} style={styles.optionLabel}>{t(option.labelKey)}</ThemedText>
                  {isActive && <SymbolView name={{ ios: 'checkmark.circle.fill', android: 'check_circle', web: 'check_circle' }} size={16} tintColor={theme.accent} />}
                </Pressable>;
          })}
          </View>
        </View>
      </ScreenScrollView>

      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + Spacing.two }]}>
        <Pressable onPress={handleSave} style={styles.saveButton}>
          <ThemedText type="default" color={theme.accent} style={styles.saveButtonText}>{t('common.save')}</ThemedText>
        </Pressable>
      </View>
    </LinearGradient>;
}

export default observer(EditPersonalGoalsScreen);

const createStyles = theme => StyleSheet.create({
  flex1: {
    flex: 1
  },
  scrollContent: {
    paddingTop: Spacing.three,
    paddingBottom: Spacing.six
  },
  field: {
    gap: Spacing.one
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.three
  },
  flex1: {
    flex: 1
  },
  input: {
    borderColor: theme.border,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 16,
    color: theme.text
  },
  nameInput: {
    paddingVertical: 12,
    fontSize: 18
  },
  inputFocused: {
    borderColor: theme.accent
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two
  },
  statCard: {
    width: '48.5%',
    gap: Spacing.two,
    backgroundColor: theme.background,
    borderColor: theme.border,
    borderWidth: 1.5,
    borderRadius: 18,
    padding: Spacing.three,
    shadowColor: theme.accent,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2
  },
  statCardFocused: {
    borderColor: theme.accent,
    shadowOpacity: 0.25
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  statIcon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: theme.accentSoft,
    alignItems: 'center',
    justifyContent: 'center'
  },
  statLabel: {
    flex: 1
  },
  statValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4
  },
  statInput: {
    flexShrink: 1,
    minWidth: 40,
    padding: 0,
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '700',
    color: theme.text
  },
  optionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two
  },
  optionTile: {
    width: '48.5%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    backgroundColor: theme.background,
    borderColor: theme.border,
    borderWidth: 1.5,
    borderRadius: 16,
    paddingVertical: Spacing.two + 2,
    paddingHorizontal: Spacing.two + 2
  },
  optionTileActive: {
    borderColor: theme.accent,
    backgroundColor: theme.accentSoft,
    shadowColor: theme.accent,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3
  },
  optionIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: theme.accentSoft,
    alignItems: 'center',
    justifyContent: 'center'
  },
  optionIconActive: {
    backgroundColor: theme.accent
  },
  optionLabel: {
    flex: 1
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingTop: Spacing.two
  },
  saveButton: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderColor: theme.accent,
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: Spacing.two
  },
  saveButtonText: {
    fontWeight: '700'
  }
});
