import { QueryClientProvider } from '@tanstack/react-query';
import '@/i18n';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { observer } from 'mobx-react-lite';
import { useEffect, useRef, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { AuthFlow } from '@/components/auth/auth-flow';
import { CALCULATING_DURATION, CalculatingScreen } from '@/components/calculating-screen';
import { IntroScreen } from '@/components/intro-screen';
import { OnboardingFlow } from '@/components/onboarding/onboarding-flow';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { queryClient } from '@/lib/query-client';
import { authStore } from '@/store/authStore';
import { catalogStore } from '@/store/catalogStore';
import { localeStore } from '@/store/localeStore';
import { syncFamilyMembers } from '@/store/peopleSync';
import { peopleStore } from '@/store/peopleStore';
import { profileStore } from '@/store/profileStore';
import { themeStore } from '@/store/themeStore';
SplashScreen.preventAutoHideAsync();
const SKIP_AUTH_FOR_TESTING = false;
function TabLayout() {
  const { t } = useTranslation();
  const theme = useTheme();
  const [showIntro, setShowIntro] = useState(true);
  const [showCalculating, setShowCalculating] = useState(false);
  const hasHydrated = profileStore.hasHydrated && authStore.hasHydrated && peopleStore.hasHydrated;
  const isAuthenticated = authStore.isAuthenticated || (SKIP_AUTH_FOR_TESTING && !authStore.hasLoggedOut);
  const hasOnboarded = profileStore.hasOnboarded;
  const prevHasOnboardedRef = useRef(hasOnboarded);
  useEffect(() => {
    // Only auto-fills onboarding for the SKIP_AUTH_FOR_TESTING dev shortcut (no real
    // account at all). A genuinely registered/logged-in user must go through the
    // real OnboardingFlow instead of having it silently overwritten with guest data.
    if (SKIP_AUTH_FOR_TESTING && !authStore.isAuthenticated && hasHydrated && !hasOnboarded) {
      profileStore.completeOnboarding({
        name: t('onboarding.guestName'),
        sex: 'female',
        age: 30,
        heightCm: 170,
        weightKg: 70,
        activityLevel: 'moderate',
        goal: { type: 'maintain-weight' },
        preferences: {
          dietaryTags: [],
          allergies: [],
          dislikedIngredientIds: [],
          favoriteCuisines: [],
          units: 'metric'
        }
      });
      prevHasOnboardedRef.current = true;
    }
  }, [hasHydrated, hasOnboarded, authStore.isAuthenticated]);
  useEffect(() => {
    if (localeStore.hasHydrated) localeStore.fetchLanguages();
  }, [localeStore.hasHydrated]);
  useEffect(() => {
    // Also re-runs once onboarding finishes: pending member changes can only
    // be uploaded when the owner's profile exists.
    if (authStore.isAuthenticated && peopleStore.hasHydrated) syncFamilyMembers();
  }, [authStore.isAuthenticated, peopleStore.hasHydrated, profileStore.hasOnboarded]);
  const catalogSyncReady = authStore.isAuthenticated && localeStore.hasHydrated && catalogStore.hasHydrated;
  const contentLanguage = localeStore.language;
  useEffect(() => {
    // Fires when the session becomes usable (fresh login or restored on app
    // launch) and again whenever the app language changes, since catalog text
    // is served pre-translated. Waits for the persisted language/catalog to
    // load so it doesn't sync with a stale default first.
    if (catalogSyncReady) {
      catalogStore.sync(authStore.token, contentLanguage);
    }
  }, [catalogSyncReady, contentLanguage]);
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
          headerStyle: { backgroundColor: theme.background },
          headerTintColor: theme.text,
          headerTitleStyle: { fontWeight: '700' }
        }} />
        <Stack.Screen name="shopping-list" options={{
          headerShown: true,
          headerTitle: t('shoppingList.title'),
          headerBackTitle: t('common.back'),
          headerShadowVisible: false,
          headerStyle: { backgroundColor: theme.background },
          headerTintColor: theme.text,
          headerTitleStyle: { fontWeight: '700' }
        }} />
        <Stack.Screen name="edit-personal-goals" options={{
          headerShown: true,
          headerTitle: t('profile.personalGoals'),
          headerBackTitle: t('common.back'),
          headerBackTitleStyle: { fontSize: 14 },
          headerShadowVisible: false,
          headerStyle: { backgroundColor: theme.background },
          headerTintColor: theme.text,
          headerTitleStyle: { fontWeight: '700' }
        }} />
        <Stack.Screen name="edit-diet-preferences" options={{
          headerShown: true,
          headerTitle: t('profile.dietPreferences'),
          headerBackTitle: t('common.back'),
          headerBackTitleStyle: { fontSize: 14 },
          headerShadowVisible: false,
          headerStyle: { backgroundColor: theme.background },
          headerTintColor: theme.text,
          headerTitleStyle: { fontWeight: '700' }
        }} />
        <Stack.Screen name="select-language" options={{
          headerShown: true,
          headerTitle: t('profile.language'),
          headerBackTitle: t('common.back'),
          headerBackTitleStyle: { fontSize: 14 },
          headerShadowVisible: false,
          headerStyle: { backgroundColor: theme.background },
          headerTintColor: theme.text,
          headerTitleStyle: { fontWeight: '700' }
        }} />
        <Stack.Screen name="privacy-policy" options={{
          headerShown: true,
          headerTitle: t('privacyPolicy.title'),
          headerBackTitle: t('common.back'),
          headerBackTitleStyle: { fontSize: 14 },
          headerShadowVisible: false,
          headerStyle: { backgroundColor: theme.background },
          headerTintColor: theme.text,
          headerTitleStyle: { fontWeight: '700' }
        }} />
        <Stack.Screen name="add-recipe" options={{
          headerShown: true,
          headerTitle: t('recipes.addRecipe'),
          headerBackTitle: t('common.back'),
          headerBackTitleStyle: { fontSize: 14 },
          headerShadowVisible: false,
          headerStyle: { backgroundColor: theme.background },
          headerTintColor: theme.text,
          headerTitleStyle: { fontWeight: '700' }
        }} />
        <Stack.Screen name="add-person" options={{ presentation: 'modal' }} />
        <Stack.Screen name="lab-report/[id]" options={{
          headerShown: true,
          headerTitle: t('aiAnalysis.reportTitle'),
          headerBackTitle: t('common.back'),
          headerBackTitleStyle: { fontSize: 14 },
          headerShadowVisible: false,
          headerStyle: { backgroundColor: theme.background },
          headerTintColor: theme.text,
          headerTitleStyle: { fontWeight: '700' }
        }} />
        <Stack.Screen name="lab-report/indicator" options={{
          headerShown: true,
          headerTitle: t('aiAnalysis.indicatorTitle'),
          headerBackTitle: t('common.back'),
          headerBackTitleStyle: { fontSize: 14 },
          headerShadowVisible: false,
          headerStyle: { backgroundColor: theme.background },
          headerTintColor: theme.text,
          headerTitleStyle: { fontWeight: '700' }
        }} />
        <Stack.Screen name="lab-report/history" options={{
          headerShown: true,
          headerTitle: t('aiAnalysis.historyTitle'),
          headerBackTitle: t('common.back'),
          headerBackTitleStyle: { fontSize: 14 },
          headerShadowVisible: false,
          headerStyle: { backgroundColor: theme.background },
          headerTintColor: theme.text,
          headerTitleStyle: { fontWeight: '700' }
        }} />
        <Stack.Screen name="article/[id]" options={{
          headerShown: true,
          headerTitle: t('articles.title'),
          headerBackTitle: t('common.back'),
          headerBackTitleStyle: { fontSize: 14 },
          headerShadowVisible: false,
          headerStyle: { backgroundColor: theme.background },
          headerTintColor: theme.text,
          headerTitleStyle: { fontWeight: '700' }
        }} />
      </Stack>;
  }
  return <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider value={themeStore.isDarkMode ? DarkTheme : DefaultTheme}>
          {showIntro ? <IntroScreen onFinish={() => setShowIntro(false)} /> : renderContent()}
        </ThemeProvider>
      </QueryClientProvider>
    </SafeAreaProvider>;
}
export default observer(TabLayout);
