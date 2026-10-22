import { SymbolView } from 'expo-symbols';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { authStore } from '@/store/authStore';
import { AppleSignInButton } from './apple-sign-in-button';
import { GoogleSignInButton } from './google-sign-in-button';
import { TermsLink } from './terms-consent';

// Only entry point into the app now — no email/password. Google and Apple sign-in
// both create an account on first use and log in on every return visit, so there's
// no separate "register" screen to route to.
export function AuthEntryScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [googleError, setGoogleError] = useState(null);
  const [appleError, setAppleError] = useState(null);

  return <View style={styles.container}>
      <Animated.View entering={ZoomIn.springify().duration(500)} style={styles.iconBadge}>
        <SymbolView name={{ ios: 'leaf.fill', android: 'eco', web: 'eco' }} size={48} tintColor="#ffffff" />
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.header}>
        <ThemedText type="default" style={styles.titlePrefix} color={theme.textSecondary}>{t('auth.entry.titlePrefix')}</ThemedText>
        <ThemedText type="title" style={styles.brandName} color={theme.accent}>NutriFlow</ThemedText>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.actions}>
        <View style={styles.googleSection}>
          <GoogleSignInButton onError={setGoogleError} />
          {googleError && <ThemedText type="small" color={theme.error}>{googleError}</ThemedText>}
        </View>

        {Platform.OS === 'ios' && <View style={styles.appleSection}>
            <AppleSignInButton onError={setAppleError} />
            {appleError && <ThemedText type="small" color={theme.error}>{appleError}</ThemedText>}
          </View>}

        <Pressable onPress={authStore.continueAsGuest} hitSlop={8} style={styles.guestButton}>
          <ThemedText type="small" color={theme.textSecondary} style={styles.guestButtonLabel}>{t('auth.continueAsGuest')}</ThemedText>
        </Pressable>
      </Animated.View>

      <TermsLink />
    </View>;
}

const createStyles = theme => StyleSheet.create({
  container: {
    flex: 1,
    gap: Spacing.four
  },
  iconBadge: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: theme.accent,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    shadowColor: theme.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4
  },
  header: {
    gap: Spacing.one,
    alignItems: 'center'
  },
  titlePrefix: {
    fontSize: 24,
    lineHeight: 30
  },
  brandName: {
    fontSize: 54,
    lineHeight: 60,
    fontWeight: '800',
    textAlign: 'center'
  },
  actions: {
    width: '100%',
    marginTop: Spacing.six + Spacing.two
  },
  googleSection: {
    gap: Spacing.one
  },
  appleSection: {
    marginTop: Spacing.three,
    gap: Spacing.one
  },
  guestButton: {
    marginTop: Spacing.four,
    alignItems: 'center'
  },
  guestButtonLabel: {
    textDecorationLine: 'underline'
  }
});
