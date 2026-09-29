import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useTranslation } from 'react-i18next';
import { Platform, Pressable, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';

// Android's native header doesn't reserve extra width for a custom headerLeft
// the way iOS does, so a text label here gets overlapped by the title instead
// of pushing it aside. Android convention is an icon-only back button anyway
// (unlike iOS, which always shows a "Back" label) — showing text only on iOS
// both fixes the overlap and matches each platform's own convention.
export function HeaderBackButton() {
  const { t } = useTranslation();
  const theme = useTheme();
  return <Pressable onPress={() => router.back()} hitSlop={10} style={({ pressed }) => [styles.button, pressed && { opacity: 0.6 }]}>
      <SymbolView name={{ ios: 'chevron.left', android: 'chevron_left', web: 'chevron_left' }} size={26} weight="semibold" tintColor={theme.text} />
      {Platform.OS === 'ios' && <ThemedText type="default" color={theme.text}>{t('common.back')}</ThemedText>}
    </Pressable>;
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginLeft: 8,
    // On Android, the native header positions the title right after this
    // component's measured width — there's no separate "gap" to tune, so the
    // spacing has to come from this button's own right-side padding.
    paddingRight: Platform.OS === 'android' ? 14 : 0
  }
});
