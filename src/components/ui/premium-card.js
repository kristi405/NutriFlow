import { useMemo } from 'react';
import { SymbolView } from 'expo-symbols';
import { useTranslation } from 'react-i18next';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export function PremiumCard({ style }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  function handlePress() {
    Alert.alert(t('profile.premiumCta'), t('home.comingSoon'));
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
