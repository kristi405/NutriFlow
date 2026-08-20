import * as AppleAuthentication from 'expo-apple-authentication';
import { StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { authStore } from '@/store/authStore';

export function AppleSignInButton({ onError }) {
  const { t } = useTranslation();
  const scheme = useColorScheme();
  const buttonStyle = scheme === 'dark' ? AppleAuthentication.AppleAuthenticationButtonStyle.WHITE : AppleAuthentication.AppleAuthenticationButtonStyle.BLACK;

  async function handlePress() {
    onError?.(null);
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [AppleAuthentication.AppleAuthenticationScope.FULL_NAME, AppleAuthentication.AppleAuthenticationScope.EMAIL]
      });
      authStore.loginWithApple({ userId: credential.user, email: credential.email });
    } catch (err) {
      if (err.code !== 'ERR_REQUEST_CANCELED') {
        onError?.(t('auth.errors.appleSignInFailed'));
      }
    }
  }

  return <AppleAuthentication.AppleAuthenticationButton buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN} buttonStyle={buttonStyle} cornerRadius={999} style={styles.button} onPress={handlePress} />;
}

const styles = StyleSheet.create({
  button: {
    width: '100%',
    height: 48
  }
});
