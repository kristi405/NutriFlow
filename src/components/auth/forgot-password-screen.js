import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ThemedText } from '@/components/themed-text';
import { Colors, Fonts, LoginButtonGreen, Spacing } from '@/constants/theme';
import { authStore } from '@/store/authStore';

const theme = Colors.light;

export function ForgotPasswordScreen({ onBackToLogin }) {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const canSubmit = email.trim().length > 0;

  async function handleSubmit() {
    setError(null);
    if (!canSubmit) {
      setError(t('auth.forgotPassword.validationEmpty'));
      return;
    }
    setIsSubmitting(true);
    try {
      await authStore.requestPasswordReset(email);
      setDone(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (done) {
    return <View style={styles.container}>
        <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
          <ThemedText type="title" style={styles.title} color={theme.text}>{t('auth.forgotPassword.doneTitle')}</ThemedText>
          <ThemedText type="default" color={theme.textSecondary}>
            {t('auth.forgotPassword.doneSubtitle')}
          </ThemedText>
        </Animated.View>

        <Pressable onPress={onBackToLogin} style={[styles.button, styles.buttonSpacing, styles.buttonShadow, { backgroundColor: LoginButtonGreen }]}>
          <ThemedText type="smallBold" style={styles.buttonTextActive}>
            {t('auth.forgotPassword.backToLogin')}
          </ThemedText>
        </Pressable>
      </View>;
  }

  return <View style={styles.container}>
      <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.header}>
        <ThemedText type="title" style={styles.title} color={theme.text}>{t('auth.forgotPassword.title')}</ThemedText>
        <ThemedText type="default" color={theme.textSecondary}>
          {t('auth.forgotPassword.subtitle')}
        </ThemedText>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.fieldGroup}>
        <View style={styles.inputWrapper}>
          <SymbolView name={{ ios: 'envelope.fill', android: 'mail', web: 'mail' }} size={18} tintColor={theme.textSecondary} />
          <TextInput value={email} onChangeText={text => {
          setEmail(text);
          setError(null);
        }} placeholder={t('auth.forgotPassword.emailPlaceholder')} placeholderTextColor={theme.textSecondary} autoCapitalize="none" autoComplete="email" keyboardType="email-address" style={styles.input} />
        </View>
      </Animated.View>

      {error && <ThemedText type="small" color={theme.error} style={{ marginTop: -Spacing.three }}>{error}</ThemedText>}

      <View style={styles.actions}>
        <Pressable onPress={handleSubmit} disabled={isSubmitting} style={({ pressed }) => [styles.button, styles.buttonSpacing, styles.buttonShadow, {
        backgroundColor: LoginButtonGreen,
        opacity: isSubmitting ? 0.6 : 1,
        transform: [{ scale: pressed ? 0.97 : 1 }]
      }]}>
          <ThemedText type="smallBold" style={styles.buttonTextActive}>
            {isSubmitting ? t('auth.forgotPassword.submitting') : t('auth.forgotPassword.submit')}
          </ThemedText>
        </Pressable>

        <Pressable onPress={onBackToLogin} hitSlop={8} style={styles.switchLink}>
          <ThemedText type="link" color={theme.textSecondary}>
            {t('auth.forgotPassword.rememberedIt')} <ThemedText type="linkPrimary" style={{ color: LoginButtonGreen, fontWeight: '600' }}>{t('auth.forgotPassword.login')}</ThemedText>
          </ThemedText>
        </Pressable>
      </View>
    </View>;
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.four
  },
  actions: {
    width: '100%'
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
    shadowColor: LoginButtonGreen,
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
