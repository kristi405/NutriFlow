import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

// `onAction`/`actionLabel`/`actionIcon` default to the premium-paywall CTA —
// pass them to reuse this same card for a different lock (e.g. "Sign in" for
// a guest, see recipes/[id].js's nutrients tab) without touching callers that
// still want the paywall behavior.
export function LockedFeature({ title, message, actionLabel, actionIcon, onAction }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return <View style={styles.card}>
      <View style={styles.iconWrapper}>
        <SymbolView name={{ ios: 'lock.fill', android: 'lock', web: 'lock' }} size={24} tintColor={theme.accent} />
      </View>
      <ThemedText type="headline" color={theme.text} style={styles.center}>{title ?? t('paywall.lockedTitle')}</ThemedText>
      <ThemedText type="small" color={theme.textSecondary} style={styles.center}>{message ?? t('paywall.lockedMessage')}</ThemedText>
      <Pressable onPress={onAction ?? (() => router.push('/paywall'))} style={({ pressed }) => [styles.button, pressed && { opacity: 0.85 }]}>
        <SymbolView name={actionIcon ?? { ios: 'crown.fill', android: 'workspace_premium', web: 'workspace_premium' }} size={16} tintColor="#ffffff" />
        <ThemedText type="smallBold" color="#ffffff">{actionLabel ?? t('paywall.unlock')}</ThemedText>
      </Pressable>
    </View>;
}

const createStyles = theme => StyleSheet.create({
  card: {
    alignItems: 'center',
    gap: Spacing.two,
    backgroundColor: theme.background,
    borderColor: theme.accent,
    borderWidth: 1,
    borderRadius: 20,
    padding: Spacing.four
  },
  iconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.accentSoft,
    alignItems: 'center',
    justifyContent: 'center'
  },
  center: {
    textAlign: 'center'
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: theme.accent,
    borderRadius: 999,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    marginTop: Spacing.one
  }
});
