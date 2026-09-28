import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { observer } from 'mobx-react-lite';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Alert, Pressable, StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ScreenScrollView } from '@/components/ui/screen-scroll-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { subscriptionStore } from '@/store/subscriptionStore';

const FEATURE_ICONS = ['doc.text.magnifyingglass', 'chart.line.uptrend.xyaxis', 'chart.pie.fill', 'cart.fill', 'calendar.badge.plus'];
// The weekly plan's product is named "lifetime" in RevenueCat, so a LIFETIME package is treated as the weekly plan.
const PLAN_ORDER = { WEEKLY: 0, LIFETIME: 0, MONTHLY: 1, ANNUAL: 2 };

function packageTitleKey(pkg) {
  if (pkg.packageType === 'ANNUAL') return 'paywall.yearly';
  return pkg.packageType === 'WEEKLY' || pkg.packageType === 'LIFETIME' ? 'paywall.weekly' : 'paywall.monthly';
}

function PaywallScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { packages: rawPackages, isPremium, isPurchasing, isLoading, isAvailable } = subscriptionStore;
  const packages = useMemo(() => [...rawPackages].sort((a, b) => (PLAN_ORDER[a.packageType] ?? 9) - (PLAN_ORDER[b.packageType] ?? 9)), [rawPackages]);
  const features = t('paywall.features', { returnObjects: true });
  const [selectedId, setSelectedId] = useState(null);
  const selected = packages.find(pkg => pkg.identifier === selectedId) ?? packages.find(pkg => pkg.packageType === 'ANNUAL') ?? packages[0];

  useEffect(() => {
    if (isAvailable && packages.length === 0) subscriptionStore.loadOfferings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handlePurchase() {
    if (!selected) return;
    try {
      const result = await subscriptionStore.purchase(selected);
      if (result === 'purchased') router.back();
    } catch {
      Alert.alert(t('common.errorTitle'), t('paywall.purchaseFailed'));
    }
  }

  async function handleRestore() {
    try {
      const restored = await subscriptionStore.restore();
      Alert.alert(t('paywall.restore'), t(restored ? 'paywall.restoreSuccess' : 'paywall.restoreNone'));
    } catch {
      Alert.alert(t('common.errorTitle'), t('paywall.purchaseFailed'));
    }
  }

  function renderPlans() {
    if (!isAvailable) {
      return <View style={styles.notice}>
          <ThemedText type="smallBold" color={theme.text}>{t('paywall.unavailableTitle')}</ThemedText>
          <ThemedText type="small" color={theme.textSecondary}>{t('paywall.unavailableMessage')}</ThemedText>
        </View>;
    }
    if (isLoading && packages.length === 0) return <ActivityIndicator color={theme.accent} />;
    if (packages.length === 0) {
      return <View style={styles.notice}>
          <ThemedText type="small" color={theme.textSecondary}>{t('paywall.loadFailed')}</ThemedText>
          <Pressable onPress={() => subscriptionStore.loadOfferings()} hitSlop={8}>
            <ThemedText type="smallBold" color={theme.accent}>{t('articles.retry')}</ThemedText>
          </Pressable>
        </View>;
    }
    return <View style={styles.plans}>
        {packages.map(pkg => {
        const isSelected = pkg.identifier === selected?.identifier;
        const isYearly = pkg.packageType === 'ANNUAL';
        return <Pressable key={pkg.identifier} onPress={() => setSelectedId(pkg.identifier)} style={[styles.plan, isSelected && styles.planSelected]}>
              <View style={styles.planText}>
                <View style={styles.planTitleRow}>
                  <ThemedText type="smallBold" color={theme.text}>{t(packageTitleKey(pkg))}</ThemedText>
                  {isYearly && <View style={styles.badge}>
                      <ThemedText type="caption" color="#ffffff" style={styles.badgeText}>{t('paywall.bestValue')}</ThemedText>
                    </View>}
                </View>
                {pkg.product.introPrice ? <ThemedText type="caption" color={theme.accent}>{t('paywall.freeTrial')}</ThemedText> : null}
              </View>
              <ThemedText type="smallBold" color={theme.text}>{pkg.product.priceString}</ThemedText>
              <SymbolView name={isSelected ? 'checkmark.circle.fill' : 'circle'} size={22} tintColor={isSelected ? theme.accent : theme.border} />
            </Pressable>;
      })}
      </View>;
  }

  if (isPremium) {
    return <ScreenScrollView gap={Spacing.four} horizontalPadding={20}>
        <View style={styles.hero}>
          <View style={styles.crown}>
            <SymbolView name={{ ios: 'crown.fill', android: 'workspace_premium', web: 'workspace_premium' }} size={30} tintColor="#ffffff" />
          </View>
          <ThemedText type="title" style={styles.title} color={theme.text}>{t('paywall.activeTitle')}</ThemedText>
          <ThemedText type="default" color={theme.textSecondary} style={styles.center}>{t('paywall.activeMessage')}</ThemedText>
        </View>
      </ScreenScrollView>;
  }

  return <ScreenScrollView gap={Spacing.four} horizontalPadding={20}>
      <View style={styles.hero}>
        <View style={styles.crown}>
          <SymbolView name={{ ios: 'crown.fill', android: 'workspace_premium', web: 'workspace_premium' }} size={30} tintColor="#ffffff" />
        </View>
        <ThemedText type="title" style={styles.title} color={theme.text}>{t('paywall.title')}</ThemedText>
        <ThemedText type="default" color={theme.textSecondary} style={styles.center}>{t('paywall.subtitle')}</ThemedText>
      </View>

      <View style={styles.features}>
        {features.map((feature, index) => <View key={feature} style={styles.featureRow}>
            <View style={styles.featureIcon}>
              <SymbolView name={FEATURE_ICONS[index % FEATURE_ICONS.length]} size={16} tintColor={theme.accent} />
            </View>
            <ThemedText type="default" color={theme.text} style={styles.featureText}>{feature}</ThemedText>
          </View>)}
      </View>

      {renderPlans()}

      <Pressable onPress={handlePurchase} disabled={!selected || isPurchasing} style={({ pressed }) => [styles.cta, { opacity: !selected ? 0.4 : isPurchasing ? 0.7 : pressed ? 0.85 : 1 }]}>
        {isPurchasing ? <ActivityIndicator color="#ffffff" /> : <ThemedText type="smallBold" color="#ffffff" style={styles.ctaText}>{t('paywall.continue')}</ThemedText>}
      </Pressable>

      <Pressable onPress={handleRestore} disabled={!isAvailable || isPurchasing} hitSlop={8} style={styles.restore}>
        <ThemedText type="smallBold" color={isAvailable ? theme.accent : theme.textSecondary}>{t('paywall.restore')}</ThemedText>
      </Pressable>

      <ThemedText type="caption" color={theme.textSecondary} style={styles.center}>{t('paywall.legal')}</ThemedText>
      <Pressable onPress={() => router.push('/privacy-policy')} hitSlop={8} style={styles.restore}>
        <ThemedText type="caption" color={theme.accent} style={styles.link}>{t('auth.terms.link')}</ThemedText>
      </Pressable>
    </ScreenScrollView>;
}

export default observer(PaywallScreen);

const createStyles = theme => StyleSheet.create({
  hero: {
    alignItems: 'center',
    gap: Spacing.two
  },
  crown: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.secondary,
    alignItems: 'center',
    justifyContent: 'center'
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
    textAlign: 'center'
  },
  center: {
    textAlign: 'center'
  },
  features: {
    gap: Spacing.two,
    backgroundColor: theme.background,
    borderColor: theme.accent,
    borderWidth: 1,
    borderRadius: 20,
    padding: Spacing.three
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two
  },
  featureIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: theme.accentSoft,
    alignItems: 'center',
    justifyContent: 'center'
  },
  featureText: {
    flex: 1
  },
  plans: {
    gap: Spacing.two
  },
  plan: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderWidth: 1.5,
    borderColor: theme.border,
    borderRadius: 16,
    padding: Spacing.three,
    backgroundColor: theme.background
  },
  planSelected: {
    borderColor: theme.accent,
    backgroundColor: theme.accentSoft
  },
  planText: {
    flex: 1,
    gap: 2
  },
  planTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two
  },
  badge: {
    backgroundColor: theme.accent,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2
  },
  badgeText: {
    fontWeight: '700'
  },
  notice: {
    alignItems: 'center',
    gap: Spacing.one,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 16,
    padding: Spacing.three
  },
  cta: {
    backgroundColor: theme.accent,
    borderRadius: 16,
    paddingVertical: Spacing.three,
    alignItems: 'center'
  },
  ctaText: {
    fontSize: 18
  },
  restore: {
    alignItems: 'center'
  },
  link: {
    textDecorationLine: 'underline'
  }
});
