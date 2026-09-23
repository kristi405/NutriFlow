import { Link } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
export function SectionHeader({
  title,
  seeAllHref,
  actionLabel,
  onAction
}) {
  const { t } = useTranslation();
  const theme = useTheme();
  return <View style={styles.row}>
      <ThemedText type="headline" color={theme.text} style={styles.title}>{title}</ThemedText>
      {onAction && <Pressable onPress={onAction} hitSlop={8} accessibilityLabel={actionLabel}>
          <SymbolView name={{ ios: 'xmark.circle.fill', android: 'cancel', web: 'cancel' }} size={20} tintColor={`${theme.textSecondary}80`} />
        </Pressable>}
      {seeAllHref && <Link href={seeAllHref} asChild>
          <Pressable hitSlop={8} style={styles.seeAllLink}>
            <ThemedText type="linkPrimary">{t('common.seeAll')}</ThemedText>
          </Pressable>
        </Link>}
    </View>;
}
const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  seeAllLink: {
    marginLeft: 'auto'
  },
  title: {
    fontSize: 18,
    lineHeight: 24
  }
});
