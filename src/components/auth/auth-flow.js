import { Colors, LoginGradientAccent, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Keyboard, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
// import { AppleSignInButton } from './apple-sign-in-button';
import { ForgotPasswordScreen } from './forgot-password-screen';
import { LoginScreen } from './login-screen';
import { RegisterScreen } from './register-screen';

// Disabled for now — pending Apple Developer "Sign In with Apple" capability setup.
// const APPLE_SIGN_IN_ENABLED = false;

export function AuthFlow() {
  const theme = useTheme();
  const [mode, setMode] = useState('login');
  const [appleError, setAppleError] = useState(null);

  return <LinearGradient colors={[Colors.light.background, Colors.light.primarySoft, LoginGradientAccent]} style={styles.flex1}>
      <SafeAreaView style={styles.flex1}>
        <Pressable onPress={Keyboard.dismiss} style={styles.content}>
            {mode === 'login' && <LoginScreen onSwitchToRegister={() => setMode('register')} onForgotPassword={() => setMode('forgot')} />}
            {mode === 'register' && <RegisterScreen onSwitchToLogin={() => setMode('login')} />}
            {mode === 'forgot' && <ForgotPasswordScreen onBackToLogin={() => setMode('login')} />}

            {/* {APPLE_SIGN_IN_ENABLED && Platform.OS === 'ios' && <View style={styles.appleSection}>
                <View style={styles.divider}>
                  <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
                  <ThemedText type="small" themeColor="textSecondary">or</ThemedText>
                  <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
                </View>
                {appleError && <ThemedText type="small" themeColor="error">{appleError}</ThemedText>}
              </View>} */}
        </Pressable>
      </SafeAreaView>
    </LinearGradient>;
}

const styles = StyleSheet.create({
  flex1: {
    flex: 1
  },
  content: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingTop: Spacing.six,
    paddingHorizontal: Spacing.four,
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    width: '100%'
  },
  appleSection: {
    gap: Spacing.three,
    marginTop: Spacing.four
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two
  },
  dividerLine: {
    flex: 1,
    height: 1
  }
});
