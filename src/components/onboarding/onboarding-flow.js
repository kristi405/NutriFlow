import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Keyboard, Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { authStore } from '@/store/authStore';
import { profileStore } from '@/store/profileStore';
import { ActivityStep } from './activity-step';
import { GoalStep } from './goal-step';
import { MeasurementsStep } from './measurements-step';
import { OnboardingProgress } from './onboarding-progress';
import { PersonalInfoStep } from './personal-info-step';
import { PreferencesStep } from './preferences-step';

const TOTAL_STEPS = 5;

export function OnboardingFlow() {
  const { t } = useTranslation();
  const theme = useTheme();
  const completeOnboarding = profileStore.completeOnboarding;
  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState();
  const [personalInfo, setPersonalInfo] = useState({
    name: '',
    sex: 'female',
    age: '20',
    heightCm: '170',
    weightKg: '80',
    targetWeightKg: '60',
    system: 'imperial'
  });
  const [activityLevel, setActivityLevel] = useState();
  const [dietaryTags, setDietaryTags] = useState([]);
  const [allergies, setAllergies] = useState([]);
  const [showValidation, setShowValidation] = useState(false);
  const canProceed = step === 0 && Boolean(goal) || step === 1 && personalInfo.name.trim().length > 0 && Number(personalInfo.age) > 0 || step === 2 && Number(personalInfo.heightCm) > 0 && Number(personalInfo.weightKg) > 0 || step === 3 && Boolean(activityLevel) || step === 4;
  function handleNext() {
    if (!canProceed) {
      setShowValidation(true);
      return;
    }
    setShowValidation(false);
    if (step < TOTAL_STEPS - 1) {
      setStep(step + 1);
      return;
    }
    if (!goal || !activityLevel) return;
    const profile = {
      name: personalInfo.name.trim(),
      sex: personalInfo.sex,
      age: Number(personalInfo.age),
      heightCm: Number(personalInfo.heightCm),
      weightKg: Number(personalInfo.weightKg),
      targetWeightKg: personalInfo.targetWeightKg === '' ? undefined : Number(personalInfo.targetWeightKg),
      activityLevel,
      goal: {
        type: goal
      },
      preferences: {
        dietaryTags,
        allergies,
        dislikedIngredientIds: [],
        favoriteCuisines: [],
        units: personalInfo.system
      }
    };
    completeOnboarding(profile);
    authStore.syncProfile(profile);
  }
  function handleSkip() {
    const profile = {
      name: t('onboarding.guestName'),
      sex: 'female',
      age: 30,
      heightCm: 170,
      weightKg: 70,
      activityLevel: 'moderate',
      goal: {
        type: 'maintain-weight'
      },
      preferences: {
        dietaryTags: [],
        allergies: [],
        dislikedIngredientIds: [],
        favoriteCuisines: [],
        units: 'metric'
      }
    };
    completeOnboarding(profile);
    authStore.syncProfile(profile);
  }
  return <LinearGradient colors={[theme.background, theme.primarySoft, theme.accentSoft]} style={styles.flex1}>
      <SafeAreaView style={styles.flex1}>
        <View style={styles.flex1}>
        <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
          {step > 0 ? <Pressable onPress={() => {
          setStep(step - 1);
          setShowValidation(false);
        }} hitSlop={8}>
              <ThemedText type="link" color={theme.accent} style={{ fontWeight: '600' }}>{t('onboarding.back')}</ThemedText>
            </Pressable> : <Pressable onPress={handleSkip} hitSlop={8}>
              <ThemedText type="link" color={theme.accent} style={{ fontWeight: '600' }}>{t('onboarding.skip')}</ThemedText>
            </Pressable>}
          <View style={styles.progressWrapper}>
            <OnboardingProgress step={step} totalSteps={TOTAL_STEPS} />
          </View>
        </Animated.View>

        <Animated.View key={step} entering={FadeInDown.duration(300)} style={styles.content}>
          {step === 0 && <GoalStep value={goal} onChange={setGoal} showError={showValidation && !goal} />}
          {step === 1 && <View style={styles.flex1} onStartShouldSetResponderCapture={() => {
          Keyboard.dismiss();
          return false;
        }}>
              <PersonalInfoStep value={personalInfo} onChange={patch => setPersonalInfo(prev => ({
              ...prev,
              ...patch
            }))} showValidation={showValidation} />
            </View>}
          {step === 2 && <MeasurementsStep value={personalInfo} onChange={patch => setPersonalInfo(prev => ({
          ...prev,
          ...patch
        }))} showValidation={showValidation} />}
          {step === 3 && <ActivityStep value={activityLevel} onChange={setActivityLevel} showError={showValidation && !activityLevel} />}
          {step === 4 && <PreferencesStep dietaryTags={dietaryTags} allergies={allergies} onChangeDietaryTags={setDietaryTags} onChangeAllergies={setAllergies} />}
        </Animated.View>

        <View style={styles.footer}>
          <Pressable onPress={handleNext} style={({ pressed }) => [styles.button, {
          backgroundColor: theme.accent,
          transform: [{ scale: pressed ? 0.97 : 1 }]
        }]}>
            <ThemedText type="smallBold" color="#ffffff">
              {step === TOTAL_STEPS - 1 ? t('onboarding.getStarted') : t('onboarding.continue')}
            </ThemedText>
          </Pressable>
        </View>
        </View>
      </SafeAreaView>
    </LinearGradient>;
}
const styles = StyleSheet.create({
  flex1: {
    flex: 1
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two
  },
  progressWrapper: {
    flex: 1
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.five,
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    width: '100%'
  },
  footer: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.three
  },
  button: {
    paddingVertical: Spacing.three,
    borderRadius: 16,
    alignItems: 'center'
  }
});
