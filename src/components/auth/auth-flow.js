import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Keyboard, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ForgotPasswordScreen } from './forgot-password-screen';
import { LoginScreen } from './login-screen';
import { RegisterScreen } from './register-screen';

export function AuthFlow() {
  const theme = useTheme();
  const [mode, setMode] = useState('login');

  return <LinearGradient colors={[theme.background, theme.primarySoft, theme.accentSoft]} style={styles.flex1}>
      <SafeAreaView style={styles.flex1}>
        <Pressable onPress={Keyboard.dismiss} style={styles.content}>
            {mode === 'login' && <LoginScreen onSwitchToRegister={() => setMode('register')} onForgotPassword={() => setMode('forgot')} />}
            {mode === 'register' && <RegisterScreen onSwitchToLogin={() => setMode('login')} />}
            {mode === 'forgot' && <ForgotPasswordScreen onBackToLogin={() => setMode('login')} />}
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
  }
});
