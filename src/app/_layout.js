import { QueryClientProvider } from '@tanstack/react-query';
import '@/i18n';
import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { observer } from 'mobx-react-lite';
import { useEffect, useRef, useState } from 'react';
import { useColorScheme } from 'react-native';
import AppTabs from '@/components/app-tabs';
import { AuthFlow } from '@/components/auth/auth-flow';
import { CalculatingScreen } from '@/components/calculating-screen';
import { IntroScreen } from '@/components/intro-screen';
import { OnboardingFlow } from '@/components/onboarding/onboarding-flow';
import { ThemedView } from '@/components/themed-view';
import { queryClient } from '@/lib/query-client';
import { authStore } from '@/store/authStore';
import { profileStore } from '@/store/profileStore';
SplashScreen.preventAutoHideAsync();
const CALCULATING_DURATION = 5000;
function TabLayout() {
  const colorScheme = useColorScheme();
  const [showIntro, setShowIntro] = useState(true);
  const [showCalculating, setShowCalculating] = useState(false);
  const hasHydrated = profileStore.hasHydrated && authStore.hasHydrated;
  const isAuthenticated = authStore.isAuthenticated;
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
    return <AppTabs key="tabs" />;
  }
  return <QueryClientProvider client={queryClient}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        {showIntro ? <IntroScreen onFinish={() => setShowIntro(false)} /> : renderContent()}
      </ThemeProvider>
    </QueryClientProvider>;
}
export default observer(TabLayout);
