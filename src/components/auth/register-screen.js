import { SymbolView } from 'expo-symbols';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import { ThemedText } from '@/components/themed-text';
import { Fonts, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { authStore } from '@/store/authStore';
import { profileStore } from '@/store/profileStore';

export function RegisterScreen({ onSwitchToLogin }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const canSubmit = email.trim().length > 0 && password.length > 0 && confirmPassword.length > 0;

  async function handleSubmit() {
    setError(null);
    if (!canSubmit) {
      setError(t('auth.register.validationEmpty'));
      return;
    }
    if (password !== confirmPassword) {
      setError(t('auth.register.passwordsDontMatch'));
      return;
    }
    setIsSubmitting(true);
    try {
      await authStore.register(email, password);
      profileStore.resetOnboarding();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return <View style={styles.container}>
      <Animated.View entering={ZoomIn.springify().duration(500)} style={styles.iconBadge}>
        <SymbolView name={{ ios: 'leaf.fill', android: 'eco', web: 'eco' }} size={24} tintColor="#ffffff" />
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.header}>
        <ThemedText type="title" style={styles.title} color={theme.text}>{t('auth.register.title')}</ThemedText>
        <ThemedText type="default" color={theme.textSecondary}>
          {t('auth.register.subtitle')}
        </ThemedText>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.fieldGroup}>
        <View style={styles.inputWrapper}>
          <SymbolView name={{ ios: 'envelope.fill', android: 'mail', web: 'mail' }} size={18} tintColor={theme.textSecondary} />
          <TextInput value={email} onChangeText={text => {
          setEmail(text);
          setError(null);
        }} placeholder={t('auth.register.emailPlaceholder')} placeholderTextColor={theme.textSecondary} autoCapitalize="none" autoComplete="email" keyboardType="email-address" style={styles.input} />
        </View>

        <View style={styles.inputWrapper}>
          <SymbolView name={{ ios: 'lock.fill', android: 'lock', web: 'lock' }} size={18} tintColor={theme.textSecondary} />
          <TextInput value={password} onChangeText={text => {
          setPassword(text);
          setError(null);
        }} placeholder={t('auth.register.passwordPlaceholder')} placeholderTextColor={theme.textSecondary} secureTextEntry={!showPassword} autoComplete="password-new" style={styles.input} />
          <Pressable onPress={() => setShowPassword(prev => !prev)} hitSlop={8}>
            <SymbolView name={showPassword ? { ios: 'eye.slash.fill', android: 'visibility_off', web: 'visibility_off' } : { ios: 'eye.fill', android: 'visibility', web: 'visibility' }} size={18} tintColor={theme.textSecondary} />
          </Pressable>
        </View>

        <View style={styles.inputWrapper}>
          <SymbolView name={{ ios: 'lock.fill', android: 'lock', web: 'lock' }} size={18} tintColor={theme.textSecondary} />
          <TextInput value={confirmPassword} onChangeText={text => {
          setConfirmPassword(text);
          setError(null);
        }} placeholder={t('auth.register.confirmPasswordPlaceholder')} placeholderTextColor={theme.textSecondary} secureTextEntry={!showConfirmPassword} autoComplete="password-new" style={styles.input} />
          <Pressable onPress={() => setShowConfirmPassword(prev => !prev)} hitSlop={8}>
            <SymbolView name={showConfirmPassword ? { ios: 'eye.slash.fill', android: 'visibility_off', web: 'visibility_off' } : { ios: 'eye.fill', android: 'visibility', web: 'visibility' }} size={18} tintColor={theme.textSecondary} />
          </Pressable>
        </View>
      </Animated.View>

      {error && <ThemedText type="small" color={theme.error} style={{ marginTop: -Spacing.four }}>{error}</ThemedText>}

      <View style={styles.actions}>
        <Pressable onPress={handleSubmit} disabled={isSubmitting} style={({ pressed }) => [styles.button, styles.buttonSpacing, styles.buttonShadow, {
        backgroundColor: theme.accent,
        opacity: isSubmitting ? 0.6 : 1,
        transform: [{ scale: pressed ? 0.97 : 1 }]
      }]}>
          <ThemedText type="smallBold" style={styles.buttonTextActive}>
            {isSubmitting ? t('auth.register.submitting') : t('auth.register.submit')}
          </ThemedText>
        </Pressable>

        <Pressable onPress={onSwitchToLogin} hitSlop={8} style={styles.switchLink}>
          <ThemedText type="link" color={theme.textSecondary}>
            {t('auth.register.haveAccount')} <ThemedText type="linkPrimary" style={{ color: theme.accent, fontWeight: '600' }}>{t('auth.register.login')}</ThemedText>
          </ThemedText>
        </Pressable>
      </View>
    </View>;
}

const createStyles = theme => StyleSheet.create({
  container: {
    gap: Spacing.five
  },
  actions: {
    width: '100%'
  },
  iconBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4
  },
  header: {
    gap: Spacing.one
  },
  title: {
    fontSize: 32,
    lineHeight: 38
  },
  fieldGroup: {
    gap: Spacing.three
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border,
    backgroundColor: theme.backgroundElement,
    paddingHorizontal: Spacing.three,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1
  },
  input: {
    flex: 1,
    paddingVertical: 18,
    fontSize: 16,
    fontFamily: Fonts.rounded,
    color: theme.text
  },
  button: {
    paddingVertical: Spacing.three,
    borderRadius: 16,
    alignItems: 'center'
  },
  buttonSpacing: {
    marginTop: Spacing.two
  },
  buttonShadow: {
    shadowColor: theme.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 5
  },
  buttonTextActive: {
    color: '#ffffff',
    fontSize: 18
  },
  switchLink: {
    alignItems: 'center',
    paddingTop: Spacing.three
  }
});
