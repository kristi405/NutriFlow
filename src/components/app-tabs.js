import { Tabs } from 'expo-router/tabs';
import { observer } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';
import { CustomTabBar } from '@/components/custom-tab-bar';

function AppTabs() {
  const { t } = useTranslation();
  return <Tabs tabBar={props => <CustomTabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" options={{ title: t('tabs.home') }} />
      <Tabs.Screen name="recipes" options={{ title: t('tabs.recipes') }} />
      <Tabs.Screen name="meal-plan" options={{ title: t('tabs.mealPlan') }} />
      <Tabs.Screen name="ai-analysis" options={{ title: t('tabs.aiAnalysis') }} />
      <Tabs.Screen name="progress" options={{ title: t('tabs.progress') }} />
      <Tabs.Screen name="profile" />
    </Tabs>;
}

export default observer(AppTabs);
