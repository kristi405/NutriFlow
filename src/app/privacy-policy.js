import { observer } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ScreenScrollView } from '@/components/ui/screen-scroll-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

function PrivacyPolicyScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const sections = t('privacyPolicy.sections', { returnObjects: true });

  return <ScreenScrollView gap={Spacing.three} horizontalPadding={20}>
      <ThemedText type="caption" color={theme.textSecondary}>{t('privacyPolicy.lastUpdated')}</ThemedText>
      <ThemedText type="default" color={theme.text}>{t('privacyPolicy.intro')}</ThemedText>
      {sections.map(section => <View key={section.heading} style={styles.section}>
          <ThemedText type="smallBold" color={theme.text}>{section.heading}</ThemedText>
          <ThemedText type="small" color={theme.textSecondary}>{section.body}</ThemedText>
        </View>)}
    </ScreenScrollView>;
}

export default observer(PrivacyPolicyScreen);

const styles = StyleSheet.create({
  section: {
    gap: Spacing.one
  }
});
