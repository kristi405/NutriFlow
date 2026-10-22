import { router } from 'expo-router';
import { Tabs } from 'expo-router/tabs';
import { observer } from 'mobx-react-lite';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { CustomTabBar } from '@/components/custom-tab-bar';
import { authStore } from '@/store/authStore';

// Guest-mode tab hiding happens in CustomTabBar (via GUEST_VISIBLE_ROUTES),
// not here — conditionally omitting <Tabs.Screen> elements doesn't actually
// remove them from expo-router's route table (the route is still
// discoverable/navigable, just with a fallback untranslated label), it only
// skips applying that screen's options.
//
// Home (the default first/initial screen) renders null for a guest (no
// profile/targets), so a guest must land on Recipes instead. The `Tabs`
// navigator's own `initialRouteName` prop looked like the right tool for
// that, but it validates against expo-router's file-based route name
// ("recipes/index") while the Tabs.Screen below is keyed by the shorter
// "recipes" — passing either string got the tab bar to highlight the right
// button without ever actually mounting that screen's content (blank
// content area, no render, no error). Doing it as an ordinary navigation
// instead — the same router.replace already used everywhere else in the
// app — sidesteps that mismatch entirely.
function AppTabs() {
  const { t } = useTranslation();
  const isGuest = authStore.isGuest;
  useEffect(() => {
    if (isGuest) router.replace('/recipes');
  }, [isGuest]);
  return <Tabs tabBar={props => <CustomTabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" options={{ title: t('tabs.home') }} />
      <Tabs.Screen name="recipes" options={{ title: t('tabs.recipes') }} />
      <Tabs.Screen name="meal-plan" options={{ title: t('tabs.mealPlan') }} />
      <Tabs.Screen name="ai-analysis" options={{ title: t('tabs.aiAnalysis') }} />
      <Tabs.Screen name="articles" options={{ title: t('tabs.articles') }} />
      <Tabs.Screen name="progress" options={{ title: t('tabs.progress') }} />
    </Tabs>;
}

export default observer(AppTabs);
