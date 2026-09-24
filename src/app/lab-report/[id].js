import { router, Stack, useLocalSearchParams } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { observer } from 'mobx-react-lite';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Alert, Linking, Pressable, StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { EmptyState } from '@/components/ui/empty-state';
import { ScreenScrollView } from '@/components/ui/screen-scroll-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { formatReportDate, sortResultsAbnormalFirst } from '@/lib/labReportAdapter';
import { labReportStore } from '@/store/labReportStore';
import { localeStore } from '@/store/localeStore';

function LabReportScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const { id } = useLocalSearchParams();
  const [report, setReport] = useState(null);
  const [hasError, setHasError] = useState(false);
  const locale = localeStore.language;

  useEffect(() => {
    setReport(null);
    setHasError(false);
    labReportStore.fetchReport(id).then(setReport).catch(() => setHasError(true));
  }, [id]);

  const results = useMemo(() => report ? sortResultsAbnormalFirst(report.results) : [], [report]);

  function handleDelete() {
    Alert.alert(t('aiAnalysis.deleteTitle'), t('aiAnalysis.deleteMessage'), [{ text: t('common.cancel'), style: 'cancel' }, {
      text: t('common.delete'),
      style: 'destructive',
      onPress: async () => {
        try {
          await labReportStore.deleteReport(id);
          router.back();
        } catch {
          Alert.alert(t('common.errorTitle'), t('common.errorDefault'));
        }
      }
    }]);
  }

  if (hasError) {
    return <ScreenScrollView><EmptyState icon={{ ios: 'doc.text.magnifyingglass', android: 'find_in_page', web: 'find_in_page' }} title={t('aiAnalysis.loadFailedTitle')} message={t('aiAnalysis.loadFailedMessage')} actionLabel={t('common.back')} onAction={() => router.back()} /></ScreenScrollView>;
  }
  if (!report) {
    return <View style={styles.centered}><ActivityIndicator color={theme.accent} /></View>;
  }

  const highCount = results.filter(result => result.flag === 'high').length;
  const lowCount = results.filter(result => result.flag === 'low').length;
  const normalCount = results.length - highCount - lowCount;
  const dateLabel = formatReportDate(report.takenAt ?? report.createdAt, locale);

  return <>
      <Stack.Screen options={{
      headerRight: () => <Pressable onPress={handleDelete} hitSlop={10}>
            <SymbolView name={{ ios: 'trash', android: 'delete', web: 'delete' }} size={20} tintColor={theme.textSecondary} />
          </Pressable>
    }} />
      <ScreenScrollView gap={Spacing.three} horizontalPadding={20}>
        <View style={[styles.card, { backgroundColor: theme.background, borderColor: theme.border }]}>
          <ThemedText type="headline" color={theme.text}>{report.labName ?? t('aiAnalysis.labReport')}</ThemedText>
          {dateLabel ? <ThemedText type="small" color={theme.textSecondary}>{dateLabel}</ThemedText> : null}
          {report.fileUrl ? <Pressable onPress={() => Linking.openURL(report.fileUrl)} style={styles.linkRow}>
              <SymbolView name={{ ios: 'doc.text', android: 'description', web: 'description' }} size={14} tintColor={theme.accent} />
              <ThemedText type="small" color={theme.accent}>{t('aiAnalysis.viewOriginal')}</ThemedText>
            </Pressable> : null}
        </View>

        {report.isFailed ? <View style={[styles.card, { backgroundColor: theme.background, borderColor: theme.error }]}>
            <ThemedText type="smallBold" color={theme.error}>{t('aiAnalysis.parseFailedTitle')}</ThemedText>
            <ThemedText type="small" color={theme.textSecondary}>{t('aiAnalysis.parseFailedMessage')}</ThemedText>
            {report.errorMessage ? <ThemedText type="caption" color={theme.textSecondary}>{report.errorMessage}</ThemedText> : null}
          </View> : <>
            <View style={styles.summaryRow}>
              <SummaryChip label={t('aiAnalysis.summaryHigh')} count={highCount} color={theme.error} />
              <SummaryChip label={t('aiAnalysis.summaryLow')} count={lowCount} color={theme.warning} />
              <SummaryChip label={t('aiAnalysis.summaryNormal')} count={normalCount} color={theme.success} />
            </View>

            {results.length === 0 ? <EmptyState icon={{ ios: 'doc.text.magnifyingglass', android: 'find_in_page', web: 'find_in_page' }} title={t('aiAnalysis.noResultsTitle')} message={t('aiAnalysis.noResultsMessage')} /> : <View style={[styles.card, styles.resultsCard, { backgroundColor: theme.background, borderColor: theme.border }]}>
                {results.map((result, index) => {
              const flagColor = result.flag === 'high' ? theme.error : result.flag === 'low' ? theme.warning : theme.text;
              const canOpenHistory = result.valueNumeric !== null;
              return <Pressable key={`${result.name}-${index}`} disabled={!canOpenHistory} onPress={() => router.push({ pathname: '/lab-report/history', params: { name: result.name } })} style={[styles.resultRow, index < results.length - 1 && { borderBottomColor: theme.border, borderBottomWidth: StyleSheet.hairlineWidth }]}>
                      <View style={styles.resultText}>
                        <ThemedText type="small" color={theme.text}>{result.name}</ThemedText>
                        {result.refRange ? <ThemedText type="caption" color={theme.textSecondary}>{t('aiAnalysis.reference', { range: result.refRange })}</ThemedText> : null}
                      </View>
                      <View style={styles.resultValue}>
                        <ThemedText type="smallBold" color={flagColor}>
                          {result.flag === 'high' ? '↑ ' : result.flag === 'low' ? '↓ ' : ''}{result.value}{result.unit ? ` ${result.unit}` : ''}
                        </ThemedText>
                      </View>
                      {canOpenHistory ? <SymbolView name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }} size={14} tintColor={theme.textSecondary} /> : null}
                    </Pressable>;
            })}
              </View>}

            <ThemedText type="caption" color={theme.textSecondary} style={styles.disclaimer}>{t('aiAnalysis.disclaimer')}</ThemedText>
          </>}
      </ScreenScrollView>
    </>;
}

function SummaryChip({ label, count, color }) {
  const theme = useTheme();
  return <View style={[styles.chip, { borderColor: color, backgroundColor: theme.background }]}>
      <ThemedText type="stat" color={color} style={styles.chipCount}>{count}</ThemedText>
      <ThemedText type="caption" color={theme.textSecondary}>{label}</ThemedText>
    </View>;
}

export default observer(LabReportScreen);

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  card: {
    gap: Spacing.one,
    borderWidth: 1,
    borderRadius: 20,
    padding: Spacing.three
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: Spacing.one
  },
  summaryRow: {
    flexDirection: 'row',
    gap: Spacing.two
  },
  chip: {
    flex: 1,
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 16,
    paddingVertical: Spacing.two
  },
  chipCount: {
    fontSize: 22,
    lineHeight: 26
  },
  resultsCard: {
    paddingVertical: Spacing.one
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.two
  },
  resultText: {
    flex: 1,
    gap: 2
  },
  resultValue: {
    alignItems: 'flex-end'
  },
  disclaimer: {
    textAlign: 'center'
  }
});
