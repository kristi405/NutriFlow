import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
export function SectionHeader({
  title,
  seeAllHref,
  actionLabel,
  onAction,
  right
}) {
  const { t } = useTranslation();
  const theme = useTheme();
  return <View style={styles.row}>
      <ThemedText type="headline" color={theme.text} style={styles.title}>{title}</ThemedText>
      {onAction && <Pressable onPress={onAction} hitSlop={8} accessibilityLabel={actionLabel}>
          <SymbolView name={{ ios: 'xmark.circle.fill', android: 'cancel', web: 'cancel' }} size={20} tintColor={`${theme.textSecondary}80`} />
        </Pressable>}
      {right && <View style={styles.right}>{right}</View>}
      {seeAllHref && <Pressable onPress={() => router.push(seeAllHref)} hitSlop={8} style={({ pressed }) => [styles.seeAllLink, { backgroundColor: theme.accentSoft, borderColor: theme.accent, opacity: pressed ? 0.7 : 1 }]}>
          <ThemedText type="smallBold" color={theme.accent}>{t('common.seeAll')}</ThemedText>
          <SymbolView name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }} size={11} tintColor={theme.accent} />
        </Pressable>}
    </View>;
}
const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    gap: 6
  },
  right: {
    marginLeft: 'auto'
  },
  seeAllLink: {
    marginLeft: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 5
  },
  title: {
    fontSize: 18,
    lineHeight: 24
  }
});
