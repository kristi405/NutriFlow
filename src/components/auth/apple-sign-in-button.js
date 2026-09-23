import * as AppleAuthentication from 'expo-apple-authentication';
import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Fonts } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { authStore } from '@/store/authStore';

export function AppleSignInButton({ onError }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const [isSigningIn, setIsSigningIn] = useState(false);

  async function handlePress() {
    onError?.(null);
    setIsSigningIn(true);
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [AppleAuthentication.AppleAuthenticationScope.FULL_NAME, AppleAuthentication.AppleAuthenticationScope.EMAIL]
      });
      // email/fullName are only ever populated on the user's very first Sign in
      // with Apple for this app — the backend must persist them against the
      // stable `sub` the first time, since later sign-ins won't include them again.
      await authStore.loginWithApple({
        identityToken: credential.identityToken,
        email: credential.email,
        fullName: credential.fullName
      });
    } catch (err) {
      if (err.code === 'ERR_REQUEST_CANCELED') return;
      onError?.(err.message || t('auth.errors.appleSignInFailed'));
    } finally {
      setIsSigningIn(false);
    }
  }

  return <Pressable onPress={handlePress} disabled={isSigningIn} style={({ pressed }) => [styles.button, {
    borderColor: theme.accent,
    backgroundColor: theme.background,
    opacity: pressed || isSigningIn ? 0.7 : 1,
    transform: [{ scale: pressed ? 0.97 : 1 }]
  }]}>
      {isSigningIn ? <ActivityIndicator color={theme.accent} /> : <>
          <SymbolView name={{ ios: 'apple.logo', android: 'apple', web: 'apple' }} size={20} tintColor={theme.text} />
          <ThemedText type="smallBold" color={theme.text} style={styles.label}>
            {t('auth.apple.signIn')}
          </ThemedText>
        </>}
    </Pressable>;
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    width: '100%',
    height: 48,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1
  },
  label: {
    fontFamily: Fonts.rounded,
    fontSize: 16
  }
});
