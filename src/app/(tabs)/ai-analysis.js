import { SymbolView } from 'expo-symbols';
import { useTranslation } from 'react-i18next';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { EmptyState } from '@/components/ui/empty-state';
import { ScreenScrollView } from '@/components/ui/screen-scroll-view';
import { Colors, LoginButtonGreen, LoginIconBackground, Spacing } from '@/constants/theme';

const theme = Colors.light;

const STEPS = [
  { icon: 'doc.badge.plus', titleKey: 'aiAnalysis.step1Title', subtitleKey: 'aiAnalysis.step1Subtitle' },
  { icon: 'sparkles', titleKey: 'aiAnalysis.step2Title', subtitleKey: 'aiAnalysis.step2Subtitle' },
  { icon: 'heart.text.square.fill', titleKey: 'aiAnalysis.step3Title', subtitleKey: 'aiAnalysis.step3Subtitle' }
];

export default function AiAnalysisScreen() {
  const { t } = useTranslation();

  function handleUpload() {
    Alert.alert(t('aiAnalysis.uploadButton'), t('home.comingSoon'));
  }

  return <ScreenScrollView gap={Spacing.three}>
      <View style={styles.header}>
        <ThemedText type="title" style={styles.title} color={theme.text}>
          {t('aiAnalysis.title')}
        </ThemedText>
        <ThemedText type="default" color={theme.textSecondary}>
          {t('aiAnalysis.subtitle')}
        </ThemedText>
      </View>

      <View style={styles.uploadCard}>
        <View style={styles.uploadIconWrapper}>
          <SymbolView name="doc.badge.plus" size={28} tintColor={LoginButtonGreen} />
        </View>
        <ThemedText type="headline" color={theme.text} style={styles.centerText}>
          {t('aiAnalysis.uploadTitle')}
        </ThemedText>
        <ThemedText type="small" color={theme.textSecondary} style={styles.centerText}>
          {t('aiAnalysis.uploadSubtitle')}
        </ThemedText>
        <Pressable onPress={handleUpload} style={({ pressed }) => [styles.uploadButton, pressed && styles.pressed]}>
          <SymbolView name="arrow.up.doc" size={15} tintColor="#ffffff" />
          <ThemedText type="smallBold" style={styles.uploadButtonText}>
            {t('aiAnalysis.uploadButton')}
          </ThemedText>
        </Pressable>
      </View>

      <View style={styles.card}>
        <ThemedText type="smallBold" color={theme.text}>
          {t('aiAnalysis.howItWorks')}
        </ThemedText>
        <View style={styles.stepsList}>
          {STEPS.map((step, index) => <View key={step.titleKey} style={styles.stepRow}>
              <View style={styles.stepIconWrapper}>
                <SymbolView name={step.icon} size={18} tintColor={LoginButtonGreen} />
              </View>
              <View style={styles.stepText}>
                <ThemedText type="smallBold" color={theme.text}>
                  {index + 1}. {t(step.titleKey)}
                </ThemedText>
                <ThemedText type="caption" color={theme.textSecondary}>
                  {t(step.subtitleKey)}
                </ThemedText>
              </View>
            </View>)}
        </View>
      </View>

      <View style={styles.card}>
        <ThemedText type="smallBold" color={theme.text}>
          {t('aiAnalysis.recentAnalyses')}
        </ThemedText>
        <EmptyState icon="doc.text.magnifyingglass" title={t('aiAnalysis.emptyTitle')} message={t('aiAnalysis.emptyMessage')} />
      </View>
    </ScreenScrollView>;
}

const styles = StyleSheet.create({
  header: {
    gap: Spacing.half
  },
  title: {
    fontSize: 32,
    lineHeight: 38
  },
  centerText: {
    textAlign: 'center'
  },
  uploadCard: {
    alignItems: 'center',
    gap: Spacing.one,
    backgroundColor: theme.background,
    borderColor: theme.primary,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderRadius: 20,
    paddingVertical: Spacing.five,
    paddingHorizontal: Spacing.four
  },
  uploadIconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: LoginIconBackground,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.one
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: LoginButtonGreen,
    borderRadius: 999,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    marginTop: Spacing.two
  },
  uploadButtonText: {
    color: '#ffffff'
  },
  pressed: {
    opacity: 0.85
  },
  card: {
    gap: Spacing.three,
    backgroundColor: theme.background,
    borderColor: theme.border,
    borderWidth: 1,
    borderRadius: 20,
    padding: Spacing.three
  },
  stepsList: {
    gap: Spacing.three
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two
  },
  stepIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: LoginIconBackground,
    alignItems: 'center',
    justifyContent: 'center'
  },
  stepText: {
    flex: 1,
    gap: 2
  }
});
