import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ThemedText } from '@/components/themed-text';
import { Colors, Spacing } from '@/constants/theme';
import { OptionCard } from './option-card';

const theme = Colors.light;

export function ActivityStep({
  value,
  onChange,
  showError
}) {
  const { t } = useTranslation();
  const ACTIVITY_OPTIONS = [{
    level: 'sedentary',
    title: t('onboarding.activity.sedentary'),
    subtitle: t('onboarding.activity.sedentarySubtitle'),
    icon: { ios: 'chair.fill', android: 'chair', web: 'chair' }
  }, {
    level: 'light',
    title: t('onboarding.activity.light'),
    subtitle: t('onboarding.activity.lightSubtitle'),
    icon: { ios: 'figure.walk', android: 'directions_walk', web: 'directions_walk' }
  }, {
    level: 'moderate',
    title: t('onboarding.activity.moderate'),
    subtitle: t('onboarding.activity.moderateSubtitle'),
    icon: { ios: 'figure.run', android: 'directions_run', web: 'directions_run' }
  }, {
    level: 'active',
    title: t('onboarding.activity.active'),
    subtitle: t('onboarding.activity.activeSubtitle'),
    icon: { ios: 'flame.fill', android: 'local_fire_department', web: 'local_fire_department' }
  }, {
    level: 'very-active',
    title: t('onboarding.activity.veryActive'),
    subtitle: t('onboarding.activity.veryActiveSubtitle'),
    icon: { ios: 'bolt.fill', android: 'bolt', web: 'bolt' }
  }];
  return <View style={styles.container}>
      <ThemedText type="title" style={styles.title} color={theme.text}>
        {t('onboarding.activity.title')}
      </ThemedText>
      <ThemedText type="default" color={theme.textSecondary}>
        {t('onboarding.activity.subtitle')}
      </ThemedText>
      {showError && <ThemedText type="small" color={theme.error}>{t('onboarding.activity.error')}</ThemedText>}
      <View style={styles.options}>
        {ACTIVITY_OPTIONS.map(option => <OptionCard key={option.level} title={option.title} subtitle={option.subtitle} icon={option.icon} selected={value === option.level} onPress={() => onChange(option.level)} />)}
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
