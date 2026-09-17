import { ScrollView, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { SquareOptionCard } from './square-option-card';

export function GoalStep({
  value,
  onChange,
  showError
}) {
  const { t } = useTranslation();
  const theme = useTheme();
  const GOAL_OPTIONS = [{
    type: 'lose-weight',
    title: t('onboarding.goal.loseWeight'),
    subtitle: t('onboarding.goal.loseWeightSubtitle'),
    icon: { ios: 'figure.run', android: 'directions_run', web: 'directions_run' }
  }, {
    type: 'maintain-weight',
    title: t('onboarding.goal.maintainWeight'),
    subtitle: t('onboarding.goal.maintainWeightSubtitle'),
    icon: { ios: 'figure.stand', android: 'accessibility_new', web: 'accessibility_new' }
  }, {
    type: 'gain-weight',
    title: t('onboarding.goal.gainWeight'),
    subtitle: t('onboarding.goal.gainWeightSubtitle'),
    icon: { ios: 'figure.strengthtraining.traditional', android: 'fitness_center', web: 'fitness_center' }
  }, {
    type: 'build-muscle',
    title: t('onboarding.goal.buildMuscle'),
    subtitle: t('onboarding.goal.buildMuscleSubtitle'),
    icon: { ios: 'figure.core.training', android: 'sports_gymnastics', web: 'sports_gymnastics' }
  }, {
    type: 'eat-healthier',
    title: t('onboarding.goal.eatHealthier'),
    subtitle: t('onboarding.goal.eatHealthierSubtitle'),
    icon: { ios: 'figure.yoga', android: 'self_improvement', web: 'self_improvement' }
  }, {
    type: 'general-health',
    title: t('onboarding.goal.generalHealth'),
    subtitle: t('onboarding.goal.generalHealthSubtitle'),
    icon: { ios: 'figure.hiking', android: 'hiking', web: 'hiking' }
  }];
  return <View style={styles.container}>
      <ThemedText type="title" style={styles.title} color={theme.text}>
        {t('onboarding.goal.title')}
      </ThemedText>
      <ThemedText type="default" color={theme.textSecondary}>
        {t('onboarding.goal.subtitle')}
      </ThemedText>
      {showError && <ThemedText type="small" color={theme.error}>{t('onboarding.goal.error')}</ThemedText>}
      <ScrollView style={styles.optionsScroll} contentContainerStyle={styles.options} showsVerticalScrollIndicator={false}>
        {GOAL_OPTIONS.map(option => <SquareOptionCard key={option.type} title={option.title} subtitle={option.subtitle} icon={option.icon} selected={value === option.type} onPress={() => onChange(option.type)} />)}
      </ScrollView>
    </View>;
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: Spacing.three
  },
  title: {
    fontSize: 32,
    lineHeight: 38
  },
  optionsScroll: {
    flex: 1,
    marginTop: Spacing.two
  },
  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingBottom: Spacing.three
  }
});
