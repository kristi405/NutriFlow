import { useEffect, useMemo, useState } from 'react';
import * as DocumentPicker from 'expo-document-picker';
import { File } from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { observer } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Alert, Modal, Pressable, StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { PersonSwitcher } from '@/components/people/person-switcher';
import { EmptyState } from '@/components/ui/empty-state';
import { ScreenScrollView } from '@/components/ui/screen-scroll-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { formatReportDate } from '@/lib/labReportAdapter';
import { labReportStore } from '@/store/labReportStore';
import { localeStore } from '@/store/localeStore';

// The backend rejects anything larger (jpeg/png/webp/pdf, 5 MB).
const MAX_FILE_BYTES = 5 * 1024 * 1024;

const STEPS = [
  { icon: { ios: 'doc.badge.plus', android: 'note_add', web: 'note_add' }, titleKey: 'aiAnalysis.step1Title', subtitleKey: 'aiAnalysis.step1Subtitle' },
  { icon: { ios: 'sparkles', android: 'auto_awesome', web: 'auto_awesome' }, titleKey: 'aiAnalysis.step2Title', subtitleKey: 'aiAnalysis.step2Subtitle' },
  { icon: { ios: 'heart.text.square.fill', android: 'favorite', web: 'favorite' }, titleKey: 'aiAnalysis.step3Title', subtitleKey: 'aiAnalysis.step3Subtitle' }
];

const SOURCES = [
  { key: 'camera', labelKey: 'recipes.takePhoto', icon: { ios: 'camera.fill', android: 'photo_camera', web: 'photo_camera' } },
  { key: 'library', labelKey: 'recipes.chooseFromLibrary', icon: { ios: 'photo.fill', android: 'photo_library', web: 'photo_library' } },
  { key: 'pdf', labelKey: 'aiAnalysis.choosePdf', icon: { ios: 'doc.fill', android: 'description', web: 'description' } }
];

// Pickers don't always report a size, and the backend answers an oversized
// upload by dropping the connection — which the app only sees as a generic
// "Network request failed" — so the real size is read from disk.
function readFileSize(asset) {
  try {
    return new File(asset.uri).size ?? asset.fileSize ?? asset.size;
  } catch {
    return asset.fileSize ?? asset.size;
  }
}

function toUploadFile(asset, fallbackName, fallbackMime) {
  return {
    uri: asset.uri,
    name: asset.fileName ?? asset.name ?? fallbackName,
    mimeType: asset.mimeType ?? fallbackMime,
    size: readFileSize(asset)
  };
}

async function pickFile(source, t) {
  if (source === 'pdf') {
    const result = await DocumentPicker.getDocumentAsync({ type: 'application/pdf', copyToCacheDirectory: true });
    return result.canceled ? null : toUploadFile(result.assets[0], `lab-${Date.now()}.pdf`, 'application/pdf');
  }
  const permission = source === 'camera' ? await ImagePicker.requestCameraPermissionsAsync() : await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    Alert.alert(t('common.errorTitle'), t('common.errorDefault'));
    return null;
  }
  // No cropping — a lab sheet is usually tall/multi-column and cropping it would cut off results.
  // Phone cameras produce very large JPEGs; 0.5 keeps a readable page well under the 5 MB limit.
  const options = { mediaTypes: ['images'], quality: 0.5 };
  const result = source === 'camera' ? await ImagePicker.launchCameraAsync(options) : await ImagePicker.launchImageLibraryAsync(options);
  return result.canceled ? null : toUploadFile(result.assets[0], `lab-${Date.now()}.jpg`, 'image/jpeg');
}

function AiAnalysisScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [isSourceSheetOpen, setIsSourceSheetOpen] = useState(false);
  const { isLoading, isUploading, hasError } = labReportStore;
  const reports = labReportStore.visibleReports;
  const locale = localeStore.language;

  useEffect(() => {
    labReportStore.loadReports();
  }, []);

  async function handleSelectSource(source) {
    setIsSourceSheetOpen(false);
    // Let the sheet finish closing before a native picker presents (iOS drops it otherwise).
    await new Promise(resolve => setTimeout(resolve, 350));
    try {
      const file = await pickFile(source, t);
      if (!file) return;
      if (file.size > MAX_FILE_BYTES) {
        Alert.alert(t('aiAnalysis.uploadErrorTitle'), t('aiAnalysis.fileTooLarge'));
        return;
      }
      const report = await labReportStore.uploadReport(file);
      router.push({ pathname: '/lab-report/[id]', params: { id: report.id } });
    } catch (error) {
      Alert.alert(t('aiAnalysis.uploadErrorTitle'), error.message ?? t('aiAnalysis.uploadErrorMessage'));
    }
  }

  function handleDelete(id) {
    Alert.alert(t('aiAnalysis.deleteTitle'), t('aiAnalysis.deleteMessage'), [{ text: t('common.cancel'), style: 'cancel' }, {
      text: t('common.delete'),
      style: 'destructive',
      onPress: () => labReportStore.deleteReport(id).catch(() => Alert.alert(t('common.errorTitle'), t('common.errorDefault')))
    }]);
  }

  function renderReports() {
    if (reports.length === 0 && isLoading) {
      return <View style={styles.centered}><ActivityIndicator color={theme.accent} /></View>;
    }
    if (reports.length === 0) {
      return hasError ? <EmptyState icon={{ ios: 'wifi.slash', android: 'wifi_off', web: 'wifi_off' }} title={t('aiAnalysis.loadFailedTitle')} message={t('aiAnalysis.loadFailedMessage')} actionLabel={t('common.retry')} onAction={() => labReportStore.loadReports()} /> : <EmptyState icon={{ ios: 'doc.text.magnifyingglass', android: 'find_in_page', web: 'find_in_page' }} title={t('aiAnalysis.emptyTitle')} message={t('aiAnalysis.emptyMessage')} />;
    }
    return <View style={styles.analysesList}>
        {reports.map(report => <Pressable key={report.id} onPress={() => router.push({ pathname: '/lab-report/[id]', params: { id: report.id } })} style={({ pressed }) => [styles.analysisRow, pressed && styles.pressed]}>
            <View style={[styles.analysisIconWrapper, report.isFailed && { backgroundColor: `${theme.error}22` }]}>
              <SymbolView name={report.isFailed ? { ios: 'exclamationmark.triangle.fill', android: 'warning', web: 'warning' } : { ios: 'doc.text.fill', android: 'description', web: 'description' }} size={18} tintColor={report.isFailed ? theme.error : theme.accent} />
            </View>
            <View style={styles.analysisText}>
              <ThemedText type="smallBold" color={theme.text} numberOfLines={1}>
                {report.labName ?? t('aiAnalysis.labReport')}
              </ThemedText>
              <ThemedText type="caption" color={report.isFailed ? theme.error : theme.textSecondary}>
                {report.isFailed ? t('aiAnalysis.parseFailedBadge') : formatReportDate(report.takenAt ?? report.createdAt, locale)}
              </ThemedText>
            </View>
            <Pressable onPress={() => handleDelete(report.id)} hitSlop={8}>
              <SymbolView name={{ ios: 'trash', android: 'delete', web: 'delete' }} size={18} tintColor={theme.textSecondary} />
            </Pressable>
          </Pressable>)}
      </View>;
  }

  return <ScreenScrollView isTabScreen gap={Spacing.three}>
      <View style={styles.header}>
        <ThemedText type="title" style={styles.title} color={theme.text}>
          {t('aiAnalysis.title')}
        </ThemedText>
        <ThemedText type="default" color={theme.textSecondary}>
          {t('aiAnalysis.subtitle')}
        </ThemedText>
      </View>

      <PersonSwitcher />

      <View style={styles.uploadCard}>
        <View style={styles.uploadIconWrapper}>
          <SymbolView name={{ ios: 'doc.badge.plus', android: 'note_add', web: 'note_add' }} size={28} tintColor={theme.accent} />
        </View>
        <ThemedText type="headline" color={theme.text} style={styles.centerText}>
          {t('aiAnalysis.uploadTitle')}
        </ThemedText>
        <ThemedText type="small" color={theme.textSecondary} style={styles.centerText}>
          {isUploading ? t('aiAnalysis.analyzingHint') : t('aiAnalysis.uploadSubtitle')}
        </ThemedText>
        <Pressable onPress={() => setIsSourceSheetOpen(true)} disabled={isUploading} style={({ pressed }) => [styles.uploadButton, (pressed || isUploading) && styles.pressed]}>
          {isUploading ? <>
              <ActivityIndicator color="#ffffff" />
              <ThemedText type="smallBold" style={styles.uploadButtonText}>{t('aiAnalysis.analyzing')}</ThemedText>
            </> : <>
              <SymbolView name={{ ios: 'arrow.up.doc', android: 'upload_file', web: 'upload_file' }} size={15} tintColor="#ffffff" />
              <ThemedText type="smallBold" style={styles.uploadButtonText}>
                {t('aiAnalysis.uploadButton')}
              </ThemedText>
            </>}
        </Pressable>
      </View>

      <View style={styles.card}>
        <ThemedText type="smallBold" color={theme.text}>
          {t('aiAnalysis.recentAnalyses')}
        </ThemedText>
        {renderReports()}
      </View>

      {reports.length === 0 && <View style={styles.card}>
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
        </View>}

      <Modal visible={isSourceSheetOpen} transparent animationType="slide" onRequestClose={() => setIsSourceSheetOpen(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setIsSourceSheetOpen(false)}>
          <Pressable style={styles.modalSheet} onPress={event => event.stopPropagation()}>
            <ThemedText type="smallBold" color={theme.text}>{t('aiAnalysis.uploadTitle')}</ThemedText>
            {SOURCES.map(source => <Pressable key={source.key} onPress={() => handleSelectSource(source.key)} style={styles.sourceRow}>
                <View style={styles.analysisIconWrapper}>
                  <SymbolView name={source.icon} size={18} tintColor={theme.accent} />
                </View>
                <ThemedText type="small" color={theme.text}>{t(source.labelKey)}</ThemedText>
              </Pressable>)}
          </Pressable>
        </Pressable>
      </Modal>
    </ScreenScrollView>;
}

export default observer(AiAnalysisScreen);

const createStyles = theme => StyleSheet.create({
  centered: {
    paddingVertical: Spacing.five,
    alignItems: 'center'
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end'
  },
  modalSheet: {
    backgroundColor: theme.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: Spacing.four,
    paddingBottom: Spacing.six,
    gap: Spacing.three
  },
  sourceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three
  },
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
