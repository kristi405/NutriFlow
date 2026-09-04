import { QueryClientProvider } from '@tanstack/react-query';
import '@/i18n';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { observer } from 'mobx-react-lite';
import { useEffect, useRef, useState } from 'react';
import { useColorScheme } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AuthFlow } from '@/components/auth/auth-flow';
import { CalculatingScreen } from '@/components/calculating-screen';
import { IntroScreen } from '@/components/intro-screen';
import { OnboardingFlow } from '@/components/onboarding/onboarding-flow';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { queryClient } from '@/lib/query-client';
import { authStore } from '@/store/authStore';
import { profileStore } from '@/store/profileStore';
SplashScreen.preventAutoHideAsync();
const CALCULATING_DURATION = 5000;
// TEMPORARY: skips the login screen for testing. Set back to false before shipping.
const SKIP_AUTH_FOR_TESTING = true;
function TabLayout() {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const [showIntro, setShowIntro] = useState(true);
  const [showCalculating, setShowCalculating] = useState(false);
  const hasHydrated = profileStore.hasHydrated && authStore.hasHydrated;
  const isAuthenticated = SKIP_AUTH_FOR_TESTING || authStore.isAuthenticated;
  const hasOnboarded = profileStore.hasOnboarded;
  const prevHasOnboardedRef = useRef(hasOnboarded);
  useEffect(() => {
    if (!prevHasOnboardedRef.current && hasOnboarded) {
      setShowCalculating(true);
      const timer = setTimeout(() => setShowCalculating(false), CALCULATING_DURATION);
      prevHasOnboardedRef.current = hasOnboarded;
      return () => clearTimeout(timer);
    }
    prevHasOnboardedRef.current = hasOnboarded;
  }, [hasOnboarded]);
  function renderContent() {
    if (!hasHydrated) return <ThemedView key="loading" style={{ flex: 1 }} />;
    if (!isAuthenticated) return <AuthFlow key="auth" />;
    if (!hasOnboarded) return <OnboardingFlow key="onboarding" />;
    if (showCalculating) return <CalculatingScreen key="calculating" />;
    return <Stack key="tabs" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="recipes/[id]" />
        <Stack.Screen name="profile" options={{
          headerShown: true,
          headerTitle: t('tabs.profile'),
          headerBackTitle: t('common.back'),
          headerShadowVisible: false,
          headerStyle: { backgroundColor: Colors.light.background },
          headerTintColor: Colors.light.text,
          headerTitleStyle: { fontWeight: '700' }
        }} />
        <Stack.Screen name="shopping-list" options={{
          headerShown: true,
          headerTitle: t('shoppingList.title'),
          headerBackTitle: t('common.back'),
          headerShadowVisible: false,
          headerStyle: { backgroundColor: Colors.light.background },
          headerTintColor: Colors.light.text,
          headerTitleStyle: { fontWeight: '700' }
        }} />
      </Stack>;
  }
  return <QueryClientProvider client={queryClient}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        {showIntro ? <IntroScreen onFinish={() => setShowIntro(false)} /> : renderContent()}
      </ThemeProvider>
    </QueryClientProvider>;
}
export default observer(TabLayout);
