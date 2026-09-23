import { useMemo } from 'react';
import * as DocumentPicker from 'expo-document-picker';
import { SymbolView } from 'expo-symbols';
import * as Sharing from 'expo-sharing';
import { observer } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Alert, Pressable, StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { EmptyState } from '@/components/ui/empty-state';
import { ScreenScrollView } from '@/components/ui/screen-scroll-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { aiAnalysisStore } from '@/store/aiAnalysisStore';

const STEPS = [
  { icon: { ios: 'doc.badge.plus', android: 'note_add', web: 'note_add' }, titleKey: 'aiAnalysis.step1Title', subtitleKey: 'aiAnalysis.step1Subtitle' },
  { icon: { ios: 'sparkles', android: 'auto_awesome', web: 'auto_awesome' }, titleKey: 'aiAnalysis.step2Title', subtitleKey: 'aiAnalysis.step2Subtitle' },
  { icon: { ios: 'heart.text.square.fill', android: 'favorite', web: 'favorite' }, titleKey: 'aiAnalysis.step3Title', subtitleKey: 'aiAnalysis.step3Subtitle' }
];

function AiAnalysisScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const analyses = aiAnalysisStore.sortedAnalyses;

  async function handleUpload() {
    const result = await DocumentPicker.getDocumentAsync({ type: 'application/pdf', copyToCacheDirectory: true });
    if (result.canceled) return;
    const file = result.assets[0];
    try {
      await aiAnalysisStore.uploadAnalysis({ uri: file.uri, name: file.name, mimeType: file.mimeType });
    } catch (error) {
      Alert.alert(t('aiAnalysis.uploadErrorTitle'), error.message ?? t('aiAnalysis.uploadErrorMessage'));
    }
  }

  async function handleOpen(localUri) {
    const canShare = await Sharing.isAvailableAsync();
    if (!canShare) return;
    await Sharing.shareAsync(localUri, { mimeType: 'application/pdf' });
  }

  function handleDelete(id) {
    Alert.alert(t('aiAnalysis.deleteTitle'), t('aiAnalysis.deleteMessage'), [{ text: t('common.cancel'), style: 'cancel' }, { text: t('common.delete'), style: 'destructive', onPress: () => aiAnalysisStore.removeAnalysis(id) }]);
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
          <SymbolView name={{ ios: 'doc.badge.plus', android: 'note_add', web: 'note_add' }} size={28} tintColor={theme.accent} />
        </View>
        <ThemedText type="headline" color={theme.text} style={styles.centerText}>
          {t('aiAnalysis.uploadTitle')}
        </ThemedText>
        <ThemedText type="small" color={theme.textSecondary} style={styles.centerText}>
          {t('aiAnalysis.uploadSubtitle')}
        </ThemedText>
        <Pressable onPress={handleUpload} disabled={aiAnalysisStore.isUploading} style={({ pressed }) => [styles.uploadButton, (pressed || aiAnalysisStore.isUploading) && styles.pressed]}>
          {aiAnalysisStore.isUploading ? <ActivityIndicator color="#ffffff" /> : <>
              <SymbolView name={{ ios: 'arrow.up.doc', android: 'upload_file', web: 'upload_file' }} size={15} tintColor="#ffffff" />
              <ThemedText type="smallBold" style={styles.uploadButtonText}>
                {t('aiAnalysis.uploadButton')}
              </ThemedText>
            </>}
        </Pressable>
      </View>

      <View style={styles.card}>
        <ThemedText type="smallBold" color={theme.text}>
          {t('aiAnalysis.howItWorks')}
        </ThemedText>
        <View style={styles.stepsList}>
          {STEPS.map((step, index) => <View key={step.titleKey} style={styles.stepRow}>
              <View style={styles.stepIconWrapper}>
                <SymbolView name={step.icon} size={18} tintColor={theme.accent} />
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
        {analyses.length === 0 ? <EmptyState icon={{ ios: 'doc.text.magnifyingglass', android: 'find_in_page', web: 'find_in_page' }} title={t('aiAnalysis.emptyTitle')} message={t('aiAnalysis.emptyMessage')} /> : <View style={styles.analysesList}>
            {analyses.map(analysis => <Pressable key={analysis.id} onPress={() => handleOpen(analysis.localUri)} style={({ pressed }) => [styles.analysisRow, pressed && styles.pressed]}>
                <View style={styles.analysisIconWrapper}>
                  <SymbolView name={{ ios: 'doc.text.fill', android: 'description', web: 'description' }} size={18} tintColor={theme.accent} />
                </View>
                <View style={styles.analysisText}>
                  <ThemedText type="smallBold" color={theme.text} numberOfLines={1}>
                    {analysis.fileName}
                  </ThemedText>
                  <ThemedText type="caption" color={theme.textSecondary}>
                    {new Date(analysis.createdAt).toLocaleDateString()}
                  </ThemedText>
                </View>
                <Pressable onPress={() => handleDelete(analysis.id)} hitSlop={8}>
                  <SymbolView name={{ ios: 'trash', android: 'delete', web: 'delete' }} size={18} tintColor={theme.textSecondary} />
                </Pressable>
              </Pressable>)}
          </View>}
      </View>
    </ScreenScrollView>;
}

export default observer(AiAnalysisScreen);

const createStyles = theme => StyleSheet.create({
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
    backgroundColor: theme.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.one
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    minWidth: 140,
    backgroundColor: theme.accent,
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
    backgroundColor: theme.accentSoft,
    alignItems: 'center',
    justifyContent: 'center'
  },
  stepText: {
    flex: 1,
    gap: 2
  },
  analysesList: {
    gap: Spacing.two
  },
  analysisRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.border,
    padding: Spacing.two
  },
  analysisIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.accentSoft,
    alignItems: 'center',
    justifyContent: 'center'
  },
  analysisText: {
    flex: 1,
    gap: 2
  }
});
