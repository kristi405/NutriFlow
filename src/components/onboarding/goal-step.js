import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ThemedText } from '@/components/themed-text';
import { Colors, Spacing } from '@/constants/theme';
import { OptionCard } from './option-card';

const theme = Colors.light;

export function GoalStep({
  value,
  onChange,
  showError
}) {
  const { t } = useTranslation();
  const GOAL_OPTIONS = [{
    type: 'lose-weight',
    title: t('onboarding.goal.loseWeight'),
    subtitle: t('onboarding.goal.loseWeightSubtitle'),
    icon: 'arrow.down.circle'
  }, {
    type: 'maintain-weight',
    title: t('onboarding.goal.maintainWeight'),
    subtitle: t('onboarding.goal.maintainWeightSubtitle'),
    icon: 'equal.circle'
  }, {
    type: 'gain-weight',
    title: t('onboarding.goal.gainWeight'),
    subtitle: t('onboarding.goal.gainWeightSubtitle'),
    icon: 'arrow.up.circle'
  }, {
    type: 'build-muscle',
    title: t('onboarding.goal.buildMuscle'),
    subtitle: t('onboarding.goal.buildMuscleSubtitle'),
    icon: 'figure.strengthtraining.traditional'
  }, {
    type: 'eat-healthier',
    title: t('onboarding.goal.eatHealthier'),
    subtitle: t('onboarding.goal.eatHealthierSubtitle'),
    icon: 'leaf'
  }];
  return <View style={styles.container}>
      <ThemedText type="title" style={styles.title} color={theme.text}>
        {t('onboarding.goal.title')}
      </ThemedText>
      <ThemedText type="default" color={theme.textSecondary}>
        {t('onboarding.goal.subtitle')}
      </ThemedText>
      {showError && <ThemedText type="small" color={theme.error}>{t('onboarding.goal.error')}</ThemedText>}
      <View style={styles.options}>
        {GOAL_OPTIONS.map(option => <OptionCard key={option.type} title={option.title} subtitle={option.subtitle} icon={option.icon} selected={value === option.type} onPress={() => onChange(option.type)} />)}
      </View>
    </View>;
}
const styles = StyleSheet.create({
  container: {
    gap: Spacing.three
  },
  title: {
    fontSize: 32,
    lineHeight: 38
  },
  options: {
    gap: 12,
    marginTop: Spacing.two
  }
});
