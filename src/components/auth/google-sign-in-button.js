import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Colors, Fonts } from '@/constants/theme';
import { authStore } from '@/store/authStore';

const theme = Colors.light;

// Required once per app so the browser tab used for the Google consent screen
// closes itself and hands control back to the app after redirecting.
WebBrowser.maybeCompleteAuthSession();

export function GoogleSignInButton({ onError }) {
  const { t } = useTranslation();
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID
  });

  useEffect(() => {
    if (response?.type !== 'success') return;
    const idToken = response.authentication?.idToken ?? response.params?.id_token;
    if (!idToken) return;
    authStore.loginWithGoogle(idToken).catch(err => onError?.(err.message));
  }, [response]);

  async function handlePress() {
    onError?.(null);
    const result = await promptAsync();
    if (result.type === 'error') {
      onError?.(t('auth.errors.googleSignInFailed'));
    }
  }

  return <Pressable onPress={handlePress} disabled={!request} style={({ pressed }) => [styles.button, {
    borderColor: theme.border,
    backgroundColor: theme.backgroundElement,
    opacity: pressed || !request ? 0.7 : 1
  }]}>
      {!request ? <ActivityIndicator color={theme.text} /> : <ThemedText type="smallBold" color={theme.text} style={styles.label}>
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
