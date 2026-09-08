import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { observer } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/hooks/use-theme';

const INDICATOR_TINT = 'rgba(76, 175, 80, 0.16)';
const RIPPLE_TINT = 'rgba(76, 175, 80, 0.12)';

function AppTabs() {
  const { t } = useTranslation();
  const colors = useTheme();
  return <NativeTabs backgroundColor={colors.background} indicatorColor={INDICATOR_TINT} rippleColor={RIPPLE_TINT} iconColor={{
    default: colors.textSecondary,
    selected: colors.accent
  }} labelStyle={{
    default: {
      fontSize: 9,
      color: colors.textSecondary
    },
    selected: {
      fontSize: 9,
      fontWeight: '600',
      color: colors.accent
    }
  }}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>{t('tabs.home')}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="house.fill" md="home" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="recipes">
        <NativeTabs.Trigger.Label>{t('tabs.recipes')}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="fork.knife" md="restaurant_menu" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="meal-plan">
        <NativeTabs.Trigger.Label>{t('tabs.mealPlan')}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="calendar" md="calendar_today" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="ai-analysis">
        <NativeTabs.Trigger.Label>{t('tabs.aiAnalysis')}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="sparkles" md="auto_awesome" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="progress">
        <NativeTabs.Trigger.Label>{t('tabs.progress')}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="chart.line.uptrend.xyaxis" md="show_chart" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="profile" hidden />
    </NativeTabs>;
}

export default observer(AppTabs);
