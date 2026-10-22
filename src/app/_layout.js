import { AuthFlow } from '@/components/auth/auth-flow';
import { CALCULATING_DURATION, CalculatingScreen } from '@/components/calculating-screen';
import { HeaderBackButton } from '@/components/header-back-button';
import { IntroScreen } from '@/components/intro-screen';
import { OnboardingFlow } from '@/components/onboarding/onboarding-flow';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import '@/i18n';
import { syncUiDictionary } from '@/i18n/uiDictionarySync';
import { queryClient } from '@/lib/query-client';
import { appStreakStore } from '@/store/appStreakStore';
import { authStore } from '@/store/authStore';
import { catalogStore } from '@/store/catalogStore';
import { localeStore } from '@/store/localeStore';
import { peopleStore } from '@/store/peopleStore';
import { syncFamilyMembers } from '@/store/peopleSync';
import { profileStore } from '@/store/profileStore';
import { subscriptionStore } from '@/store/subscriptionStore';
import { termsStore } from '@/store/termsStore';
import { themeStore } from '@/store/themeStore';
import { QueryClientProvider } from '@tanstack/react-query';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { observer } from 'mobx-react-lite';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AppState } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
SplashScreen.preventAutoHideAsync();
const SKIP_AUTH_FOR_TESTING = false;
function TabLayout() {
  const { t } = useTranslation();
  const theme = useTheme();
  const [showIntro, setShowIntro] = useState(true);
  const [showCalculating, setShowCalculating] = useState(false);
  const hasHydrated = profileStore.hasHydrated && authStore.hasHydrated && peopleStore.hasHydrated;
  const isAuthenticated = authStore.isAuthenticated || (SKIP_AUTH_FOR_TESTING && !authStore.hasLoggedOut);
  // "Continue without an account" on the sign-in screen — skips onboarding
  // and goes straight into the same Stack/tab navigator real users get (see
  // renderContent below), with app-tabs.js and recipes/[id] cutting it down
  // to just the Recipes tab, no own recipes, no ingredients catalog, and
  // nutrients locked behind sign-in.
  const isGuest = authStore.isGuest && !isAuthenticated;
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
    // Covers a reinstall: AsyncStorage (and hasOnboarded with it) is gone, but
    // the backend may already have this account's anketa from before — a
    // no-op for a genuinely new account, which has none yet.
    if (authStore.isAuthenticated && hasHydrated && !hasOnboarded) {
      profileStore.hydrateFromServer(authStore.currentUser);
      // Restoring silently isn't "just finished onboarding" — skip the
      // calorie-calculating splash the effect below would otherwise trigger.
      if (profileStore.hasOnboarded) prevHasOnboardedRef.current = true;
    }
  }, [authStore.isAuthenticated, hasHydrated, hasOnboarded]);
  useEffect(() => {
    if (localeStore.hasHydrated) localeStore.fetchLanguages();
  }, [localeStore.hasHydrated]);
  useEffect(() => {
    // Public endpoint, no auth needed — fires as soon as the persisted
    // language is known, and again whenever it changes (select-language screen).
    if (localeStore.hasHydrated) syncUiDictionary(localeStore.language);
  }, [localeStore.hasHydrated, localeStore.language]);
  useEffect(() => {
    // Also re-runs once onboarding finishes: pending member changes can only
    // be uploaded when the owner's profile exists.
    if (authStore.isAuthenticated && peopleStore.hasHydrated) syncFamilyMembers();
  }, [authStore.isAuthenticated, peopleStore.hasHydrated, profileStore.hasOnboarded]);
  const userId = authStore.currentUser?.id;
  useEffect(() => {
    if (!appStreakStore.hasHydrated) return;
    appStreakStore.recordOpen();
    const subscription = AppState.addEventListener('change', nextState => {
      if (nextState === 'active') appStreakStore.recordOpen();
    });
    return () => subscription.remove();
  }, [appStreakStore.hasHydrated]);
  useEffect(() => {
    if (userId) subscriptionStore.init(userId);else subscriptionStore.logOut();
  }, [userId]);
  useEffect(() => {
    // Covers a reinstall: AsyncStorage (and acceptedAt with it) is gone, but
    // the backend may already have this account's acceptance from before —
    // a no-op for a genuinely new account, which has none yet. Declared
    // before the requireAcceptance effect below so it runs first.
    if (userId && termsStore.hasHydrated) termsStore.hydrateFromServer(authStore.currentUser);
  }, [userId, termsStore.hasHydrated]);
  useEffect(() => {
    // There's no separate "register" screen anymore — Google/Apple sign-in both
    // create and log in to an account, so this is the only place that can tell
    // someone hasn't accepted the terms yet.
    if (userId && termsStore.hasHydrated && !termsStore.acceptedAt && !termsStore.isPending) termsStore.requireAcceptance();
  }, [userId, termsStore.hasHydrated]);
  // A guest sync hits /app/sync with no token — optionalAuth there still
  // returns the catalog, just without nutrition/ingredients (see
  // NUTRIFLOW_BACKEND's CatalogSyncService).
  const catalogSyncReady = (authStore.isAuthenticated || isGuest) && localeStore.hasHydrated && catalogStore.hasHydrated;
  const contentLanguage = localeStore.language;
  useEffect(() => {
    // Fires when the session becomes usable (fresh login, restored on app
    // launch, or "continue as guest") and again whenever the app language
    // changes, since catalog text is served pre-translated. Waits for the
    // persisted language/catalog to load so it doesn't sync with a stale
    // default first.
    if (catalogSyncReady) {
      catalogStore.sync(isGuest ? null : authStore.token, contentLanguage);
    }
  }, [catalogSyncReady, contentLanguage, isGuest]);
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
    if (!isAuthenticated && !isGuest) return <AuthFlow key="auth" />;
    // Guests skip onboarding (no profile to collect) and land straight in the
    // same Stack/tab navigator real users get — app-tabs.js renders only the
    // Recipes tab for them, and recipes/[id] locks nutrients behind sign-in
    // (see that screen's authStore.isGuest check). A separate guest-only
    // Stack here (declaring just guest-recipes + recipes/[id]) was tried
    // first but conflicted with expo-router's route resolution, which kept
    // resolving to (tabs) regardless of which Stack.Screen list was active —
    // reusing the one real Stack avoids that entirely.
    if (!hasOnboarded && !isGuest) return <OnboardingFlow key="onboarding" />;
    if (showCalculating) return <CalculatingScreen key="calculating" />;
    return <Stack key="tabs" screenOptions={{ headerShown: false, headerLeft: () => <HeaderBackButton /> }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="recipes/[id]" />
        <Stack.Screen name="profile" options={{
          headerShown: true,
          headerTitle: t('tabs.profile'),
          headerShadowVisible: false,
          headerStyle: { backgroundColor: theme.background },
          headerTintColor: theme.text,
          headerTitleStyle: { fontWeight: '700' }
        }} />
        <Stack.Screen name="shopping-list" options={{
          headerShown: true,
          headerTitle: t('shoppingList.title'),
          headerShadowVisible: false,
          headerStyle: { backgroundColor: theme.background },
          headerTintColor: theme.text,
          headerTitleStyle: { fontWeight: '700' }
        }} />
        <Stack.Screen name="edit-personal-goals" options={{
          headerShown: true,
          headerTitle: t('profile.personalGoals'),
          headerShadowVisible: false,
          headerStyle: { backgroundColor: theme.background },
          headerTintColor: theme.text,
          headerTitleStyle: { fontWeight: '700' }
        }} />
        <Stack.Screen name="edit-diet-preferences" options={{
          headerShown: true,
          headerTitle: t('profile.dietPreferences'),
          headerShadowVisible: false,
          headerStyle: { backgroundColor: theme.background },
          headerTintColor: theme.text,
          headerTitleStyle: { fontWeight: '700' }
        }} />
        <Stack.Screen name="select-language" options={{
          headerShown: true,
          headerTitle: t('profile.language'),
          headerShadowVisible: false,
          headerStyle: { backgroundColor: theme.background },
          headerTintColor: theme.text,
          headerTitleStyle: { fontWeight: '700' }
        }} />
        <Stack.Screen name="paywall" options={{
          headerShown: true,
          headerTitle: '',
          headerShadowVisible: false,
          headerStyle: { backgroundColor: theme.background },
          headerTintColor: theme.text
        }} />
        <Stack.Screen name="privacy-policy" options={{
          headerShown: true,
          headerTitle: t('privacyPolicy.title'),
          headerShadowVisible: false,
          headerStyle: { backgroundColor: theme.background },
          headerTintColor: theme.text,
          headerTitleStyle: { fontWeight: '700' }
        }} />
        <Stack.Screen name="add-recipe" options={{
          headerShown: true,
          headerTitle: t('recipes.addRecipe'),
          headerShadowVisible: false,
          headerStyle: { backgroundColor: theme.background },
          headerTintColor: theme.text,
          headerTitleStyle: { fontWeight: '700' }
        }} />
        <Stack.Screen name="ingredients" options={{
          headerShown: true,
          headerTitle: t('ingredients.title'),
          headerShadowVisible: false,
          headerStyle: { backgroundColor: theme.background },
          headerTintColor: theme.text,
          headerTitleStyle: { fontWeight: '700' }
        }} />
        <Stack.Screen name="ingredient/[id]" options={{
          headerShown: true,
          headerTitle: '',
          headerShadowVisible: false,
          headerStyle: { backgroundColor: theme.background },
          headerTintColor: theme.text
        }} />
        <Stack.Screen name="add-person" options={{ presentation: 'modal' }} />
        <Stack.Screen name="lab-report/[id]" options={{
          headerShown: true,
          headerTitle: t('aiAnalysis.reportTitle'),
          headerShadowVisible: false,
          headerStyle: { backgroundColor: theme.background },
          headerTintColor: theme.text,
          headerTitleStyle: { fontWeight: '700' }
        }} />
        <Stack.Screen name="lab-report/indicator" options={{
          headerShown: true,
          headerTitle: t('aiAnalysis.indicatorTitle'),
          headerShadowVisible: false,
          headerStyle: { backgroundColor: theme.background },
          headerTintColor: theme.text,
          headerTitleStyle: { fontWeight: '700' }
        }} />
        <Stack.Screen name="lab-report/history" options={{
          headerShown: true,
          headerTitle: t('aiAnalysis.historyTitle'),
          headerShadowVisible: false,
          headerStyle: { backgroundColor: theme.background },
          headerTintColor: theme.text,
          headerTitleStyle: { fontWeight: '700' }
        }} />
        <Stack.Screen name="article/[id]" options={{
          headerShown: true,
          headerTitle: t('articles.title'),
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
