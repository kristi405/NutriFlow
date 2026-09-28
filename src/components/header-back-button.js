import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';

export function HeaderBackButton() {
  const { t } = useTranslation();
  const theme = useTheme();
  return <Pressable onPress={() => router.back()} hitSlop={10} style={({ pressed }) => [styles.button, pressed && { opacity: 0.6 }]}>
      <SymbolView name={{ ios: 'chevron.left', android: 'chevron_left', web: 'chevron_left' }} size={18} weight="semibold" tintColor={theme.text} />
      <ThemedText type="default" color={theme.text}>{t('common.back')}</ThemedText>
    </Pressable>;
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginLeft: 8
  }
});
