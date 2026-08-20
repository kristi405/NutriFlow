import { Link } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
const theme = Colors.light;
export function SectionHeader({
  title,
  seeAllHref
}) {
  const { t } = useTranslation();
  return <View style={styles.row}>
      <ThemedText type="headline" color={theme.text}>{title}</ThemedText>
      {seeAllHref && <Link href={seeAllHref} asChild>
          <Pressable hitSlop={8}>
            <ThemedText type="linkPrimary">{t('common.seeAll')}</ThemedText>
          </Pressable>
        </Link>}
    </View>;
}
const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  }
});
