import { useMemo, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { observer } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { ScreenScrollView } from '@/components/ui/screen-scroll-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { profileStore } from '@/store/profileStore';

const GOAL_OPTIONS = [{ type: 'lose-weight', labelKey: 'onboarding.goal.loseWeight' }, { type: 'maintain-weight', labelKey: 'onboarding.goal.maintainWeight' }, { type: 'gain-weight', labelKey: 'onboarding.goal.gainWeight' }, { type: 'build-muscle', labelKey: 'onboarding.goal.buildMuscle' }, { type: 'eat-healthier', labelKey: 'onboarding.goal.eatHealthier' }, { type: 'general-health', labelKey: 'onboarding.goal.generalHealth' }];
const ACTIVITY_OPTIONS = [{ level: 'sedentary', labelKey: 'onboarding.activity.sedentary' }, { level: 'light', labelKey: 'onboarding.activity.light' }, { level: 'moderate', labelKey: 'onboarding.activity.moderate' }, { level: 'active', labelKey: 'onboarding.activity.active' }, { level: 'very-active', labelKey: 'onboarding.activity.veryActive' }, { level: 'extra-active', labelKey: 'onboarding.activity.extraActive' }];

function EditPersonalGoalsScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const insets = useSafeAreaInsets();
  const profile = profileStore.profile;
  const [goalType, setGoalType] = useState(profile?.goal?.type);
  const [age, setAge] = useState(String(profile?.age ?? ''));
  const [heightCm, setHeightCm] = useState(String(profile?.heightCm ?? ''));
  const [weightKg, setWeightKg] = useState(String(profile?.weightKg ?? ''));
  const [targetWeightKg, setTargetWeightKg] = useState(profile?.targetWeightKg !== undefined ? String(profile.targetWeightKg) : '');
  const [activityLevel, setActivityLevel] = useState(profile?.activityLevel);
  const [focusedField, setFocusedField] = useState(null);

  if (!profile) return null;

  function inputStyle(field) {
    return [styles.input, focusedField === field && styles.inputFocused];
  }

  function handleSave() {
    profileStore.updateGoal({ type: goalType });
    profileStore.updateProfile({
      age: Number(age) || profile.age,
      heightCm: Number(heightCm) || profile.heightCm,
      weightKg: Number(weightKg) || profile.weightKg,
      targetWeightKg: targetWeightKg === '' ? undefined : Number(targetWeightKg),
      activityLevel
    });
    router.back();
  }

  return <LinearGradient colors={[theme.background, theme.primarySoft, theme.accentSoft]} style={styles.flex1}>
      <ScreenScrollView gap={Spacing.four} horizontalPadding={20} contentContainerStyle={styles.scrollContent}>
        <View style={styles.field}>
          <ThemedText type="small" color={theme.textSecondary}>{t('profile.goal')}</ThemedText>
          <View style={styles.chipRow}>
            {GOAL_OPTIONS.map(option => {
            const isActive = goalType === option.type;
            return <Pressable key={option.type} onPress={() => setGoalType(option.type)} style={[styles.chip, isActive && styles.chipActive]}>
                  <ThemedText type="small" color={isActive ? '#ffffff' : theme.text}>{t(option.labelKey)}</ThemedText>
                </Pressable>;
          })}
          </View>
        </View>

        <View style={styles.row}>
          <View style={[styles.field, styles.flex1]}>
            <ThemedText type="small" color={theme.textSecondary}>{t('onboarding.personalInfo.age')}</ThemedText>
            <TextInput value={age} onChangeText={setAge} onFocus={() => setFocusedField('age')} onBlur={() => setFocusedField(null)} keyboardType="number-pad" style={inputStyle('age')} placeholderTextColor={theme.textSecondary} />
          </View>
          <View style={[styles.field, styles.flex1]}>
            <ThemedText type="small" color={theme.textSecondary}>{t('onboarding.personalInfo.height')} (cm)</ThemedText>
            <TextInput value={heightCm} onChangeText={setHeightCm} onFocus={() => setFocusedField('heightCm')} onBlur={() => setFocusedField(null)} keyboardType="decimal-pad" style={inputStyle('heightCm')} placeholderTextColor={theme.textSecondary} />
          </View>
        </View>

        <View style={styles.row}>
          <View style={[styles.field, styles.flex1]}>
            <ThemedText type="small" color={theme.textSecondary}>{t('onboarding.personalInfo.weight')} (kg)</ThemedText>
            <TextInput value={weightKg} onChangeText={setWeightKg} onFocus={() => setFocusedField('weightKg')} onBlur={() => setFocusedField(null)} keyboardType="decimal-pad" style={inputStyle('weightKg')} placeholderTextColor={theme.textSecondary} />
          </View>
          <View style={[styles.field, styles.flex1]}>
            <ThemedText type="small" color={theme.textSecondary}>{t('onboarding.personalInfo.targetWeight')} (kg)</ThemedText>
            <TextInput value={targetWeightKg} onChangeText={setTargetWeightKg} onFocus={() => setFocusedField('targetWeightKg')} onBlur={() => setFocusedField(null)} keyboardType="decimal-pad" style={inputStyle('targetWeightKg')} placeholderTextColor={theme.textSecondary} />
          </View>
        </View>

        <View style={styles.field}>
          <ThemedText type="small" color={theme.textSecondary}>{t('profile.activityLevel')}</ThemedText>
          <View style={styles.chipRow}>
            {ACTIVITY_OPTIONS.map(option => {
            const isActive = activityLevel === option.level;
            return <Pressable key={option.level} onPress={() => setActivityLevel(option.level)} style={[styles.chip, isActive && styles.chipActive]}>
                  <ThemedText type="small" color={isActive ? '#ffffff' : theme.text}>{t(option.labelKey)}</ThemedText>
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
  inputFocused: {
    borderColor: theme.accent
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two
  },
  chip: {
    borderColor: theme.border,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    backgroundColor: theme.background
  },
  chipActive: {
    backgroundColor: theme.accent,
    borderColor: theme.accent
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
