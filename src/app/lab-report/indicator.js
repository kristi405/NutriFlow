import { router, useLocalSearchParams } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { observer } from 'mobx-react-lite';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { EmptyState } from '@/components/ui/empty-state';
import { ScreenScrollView } from '@/components/ui/screen-scroll-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { labReportStore } from '@/store/labReportStore';

function LabIndicatorScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const { reportId, index } = useLocalSearchParams();
  const [report, setReport] = useState(() => labReportStore.detailCache.get(String(reportId)) ?? null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (report) return;
    labReportStore.fetchReport(reportId).then(setReport).catch(() => setHasError(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportId]);

  const result = report?.results[Number(index)];

  if (hasError || (report && !result)) {
    return <ScreenScrollView><EmptyState icon={{ ios: 'doc.text.magnifyingglass', android: 'find_in_page', web: 'find_in_page' }} title={t('aiAnalysis.loadFailedTitle')} message={t('aiAnalysis.loadFailedMessage')} actionLabel={t('common.back')} onAction={() => router.back()} /></ScreenScrollView>;
  }
  if (!result) {
    return <View style={styles.centered}><ActivityIndicator color={theme.accent} /></View>;
  }

  const flagColor = result.flag === 'high' ? theme.error : result.flag === 'low' ? theme.warning : theme.text;
  // For a flagged result the matching explanation comes first and is highlighted.
  const effects = [
    { key: 'low', labelKey: 'aiAnalysis.ifLow', text: result.lowEffects, color: theme.warning },
    { key: 'high', labelKey: 'aiAnalysis.ifHigh', text: result.highEffects, color: theme.error }
  ].filter(effect => effect.text).sort((a, b) => Number(b.key === result.flag) - Number(a.key === result.flag));
  const hasDetails = Boolean(result.description) || effects.length > 0 || result.foodSources.length > 0;
  const canOpenHistory = result.valueNumeric !== null;

  return <ScreenScrollView gap={Spacing.three} horizontalPadding={20}>
      <View style={[styles.card, { backgroundColor: theme.background, borderColor: theme.border }]}>
        <ThemedText type="headline" color={theme.text}>{result.name}</ThemedText>
        <ThemedText type="stat" color={flagColor} style={styles.value}>
          {result.flag === 'high' ? '↑ ' : result.flag === 'low' ? '↓ ' : ''}{result.value}{result.unit ? ` ${result.unit}` : ''}
        </ThemedText>
        {result.refRange ? <ThemedText type="small" color={theme.textSecondary}>{t('aiAnalysis.reference', { range: result.refRange })}</ThemedText> : null}
      </View>

      {result.description ? <View style={[styles.card, { backgroundColor: theme.background, borderColor: theme.border }]}>
          <ThemedText type="caption" color={theme.textSecondary} style={styles.label}>{t('aiAnalysis.about')}</ThemedText>
          <ThemedText type="default" color={theme.text}>{result.description}</ThemedText>
        </View> : null}

      {effects.map(effect => {
      const isRelevant = effect.key === result.flag;
      return <View key={effect.key} style={[styles.card, { backgroundColor: theme.background, borderColor: isRelevant ? effect.color : theme.border, borderWidth: isRelevant ? 1.5 : 1 }]}>
            <ThemedText type="caption" color={isRelevant ? effect.color : theme.textSecondary} style={styles.label}>{t(effect.labelKey)}</ThemedText>
            <ThemedText type="default" color={theme.text}>{effect.text}</ThemedText>
          </View>;
    })}

      {result.foodSources.length > 0 && <View style={[styles.card, { backgroundColor: theme.background, borderColor: theme.border }]}>
          <ThemedText type="caption" color={theme.textSecondary} style={styles.label}>{t('aiAnalysis.foodSources')}</ThemedText>
          <View style={styles.chips}>
            {result.foodSources.map(food => <View key={food} style={[styles.chip, { backgroundColor: theme.accentSoft }]}>
                <ThemedText type="small" color={theme.accent}>{food}</ThemedText>
              </View>)}
          </View>
        </View>}

      {!hasDetails && <ThemedText type="small" color={theme.textSecondary} style={styles.noDetails}>{t('aiAnalysis.noDetails')}</ThemedText>}

      {canOpenHistory && <Pressable onPress={() => router.push({ pathname: '/lab-report/history', params: { name: result.name } })} style={[styles.historyButton, { borderColor: theme.accent }]}>
          <SymbolView name={{ ios: 'chart.xyaxis.line', android: 'show_chart', web: 'show_chart' }} size={16} tintColor={theme.accent} />
          <ThemedText type="smallBold" color={theme.accent}>{t('aiAnalysis.viewHistory')}</ThemedText>
        </Pressable>}

      <ThemedText type="caption" color={theme.textSecondary} style={styles.noDetails}>{t('aiAnalysis.disclaimer')}</ThemedText>
    </ScreenScrollView>;
}

export default observer(LabIndicatorScreen);

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
  value: {
    fontSize: 30,
    lineHeight: 36
  },
  label: {
    fontWeight: '700',
    textTransform: 'uppercase'
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
    marginTop: Spacing.one
  },
  chip: {
    borderRadius: 999,
    paddingHorizontal: Spacing.three,
    paddingVertical: 4
  },
  historyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderRadius: 999,
    paddingVertical: Spacing.two
  },
  noDetails: {
    textAlign: 'center'
  }
});
