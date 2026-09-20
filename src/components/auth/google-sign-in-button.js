import { GoogleSignin, isErrorWithCode, isSuccessResponse, statusCodes } from '@react-native-google-signin/google-signin';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Fonts } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { authStore } from '@/store/authStore';

// webClientId is what the resulting ID token is issued for (the "audience"
// the backend verifies against) — the Android/iOS client IDs only attest
// that this specific app is the one asking, per Google's Credential Manager
// setup. See NUTRIFLOW_BACKEND's AuthService.GOOGLE_AUDIENCES.
GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID
});

export function GoogleSignInButton({ onError }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const [isSigningIn, setIsSigningIn] = useState(false);

  async function handlePress() {
    onError?.(null);
    setIsSigningIn(true);
    try {
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();
      if (!isSuccessResponse(response)) return; // user dismissed the picker
      const idToken = response.data.idToken;
      if (!idToken) {
        onError?.(t('auth.errors.googleSignInFailed'));
        return;
      }
      await authStore.loginWithGoogle(idToken);
    } catch (error) {
      // TEMP DEBUG — surfacing the raw error to find the actual failure cause.
      if (isErrorWithCode(error)) {
        if (error.code !== statusCodes.SIGN_IN_CANCELLED) onError?.(`[${error.code}] ${error.message}`);
      } else {
        onError?.(`[thrown] ${error.message}`);
      }
    } finally {
      setIsSigningIn(false);
    }
  }

  return <Pressable onPress={handlePress} disabled={isSigningIn} style={({ pressed }) => [styles.button, {
    borderColor: theme.border,
    backgroundColor: theme.backgroundElement,
    opacity: pressed || isSigningIn ? 0.7 : 1
  }]}>
      {isSigningIn ? <ActivityIndicator color={theme.text} /> : <ThemedText type="smallBold" color={theme.text} style={styles.label}>
          {t('auth.google.signIn')}
        </ThemedText>}
    </Pressable>;
}

const styles = StyleSheet.create({
  button: {
    width: '100%',
    height: 48,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  label: {
    fontFamily: Fonts.rounded
  }
});
