import { useMemo } from 'react';
import { SymbolView } from 'expo-symbols';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import { observer } from 'mobx-react-lite';
import { Pressable, StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { subscriptionStore } from '@/store/subscriptionStore';

// paywall.js's packageTitleKey maps a package's own type to these same keys
// ("На неделю"/"На месяц"/"На год") — reused here so the plan name matches exactly.
const PLAN_TYPE_LABEL_KEYS = {
  weekly: 'paywall.weekly',
  monthly: 'paywall.monthly',
  yearly: 'paywall.yearly'
};

function PremiumCardBase({ style }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const isPremium = subscriptionStore.isPremium;

  function handlePress() {
    router.push('/paywall');
  }

  if (isPremium) {
    const planLabel = t(PLAN_TYPE_LABEL_KEYS[subscriptionStore.planType] ?? 'paywall.monthly');
    return <Pressable onPress={handlePress} style={[styles.card, style]}>
        <View style={styles.iconWrapper}>
          <SymbolView name={{ ios: 'crown.fill', android: 'workspace_premium', web: 'workspace_premium' }} size={20} tintColor="#ffffff" />
        </View>
        <View style={styles.textColumn}>
          <ThemedText type="smallBold" color="#ffffff">{t('profile.managePlanTitle')}</ThemedText>
          <ThemedText type="caption" color="#ffffff">{t('profile.managePlanSubtitle', { plan: planLabel })}</ThemedText>
        </View>
        <SymbolView name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }} size={16} tintColor="#ffffff" />
      </Pressable>;
  }

  return <Pressable onPress={handlePress} style={[styles.card, style]}>
      <View style={styles.iconWrapper}>
        <SymbolView name={{ ios: 'crown.fill', android: 'workspace_premium', web: 'workspace_premium' }} size={20} tintColor="#ffffff" />
      </View>
      <View style={styles.textColumn}>
        <ThemedText type="smallBold" color="#ffffff">{t('profile.premiumTitle')}</ThemedText>
        <ThemedText type="caption" color="#ffffff">{t('profile.premiumSubtitle')}</ThemedText>
      </View>
      <SymbolView name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }} size={16} tintColor="#ffffff" />
    </Pressable>;
}

export const PremiumCard = observer(PremiumCardBase);

const createStyles = theme => StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    backgroundColor: theme.secondary,
    borderRadius: 20,
    padding: Spacing.three
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  textColumn: {
    flex: 1,
    gap: 2
  }
});
