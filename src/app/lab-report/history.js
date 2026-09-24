import { useLocalSearchParams } from 'expo-router';
import { observer } from 'mobx-react-lite';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { ValueChart } from '@/components/lab/value-chart';
import { ThemedText } from '@/components/themed-text';
import { EmptyState } from '@/components/ui/empty-state';
import { ScreenScrollView } from '@/components/ui/screen-scroll-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { formatReportDate, formatShortDate } from '@/lib/labReportAdapter';
import { labReportStore } from '@/store/labReportStore';
import { localeStore } from '@/store/localeStore';

function LabHistoryScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const { name } = useLocalSearchParams();
  const [history, setHistory] = useState(null);
  const [hasError, setHasError] = useState(false);
  const locale = localeStore.language;

  useEffect(() => {
    setHistory(null);
    setHasError(false);
    labReportStore.fetchHistory(name).then(setHistory).catch(() => setHasError(true));
  }, [name]);

  const numericPoints = useMemo(() => (history ?? []).filter(point => point.valueNumeric !== null).map(point => ({
    ...point,
    label: formatShortDate(point.takenAt, locale)
  })), [history, locale]);

  if (hasError) {
    return <ScreenScrollView><EmptyState icon={{ ios: 'wifi.slash', android: 'wifi_off', web: 'wifi_off' }} title={t('aiAnalysis.loadFailedTitle')} message={t('aiAnalysis.loadFailedMessage')} /></ScreenScrollView>;
  }
  if (!history) {
    return <View style={styles.centered}><ActivityIndicator color={theme.accent} /></View>;
  }

  const unit = history.find(point => point.unit)?.unit;
  return <ScreenScrollView gap={Spacing.three} horizontalPadding={20}>
      <View style={styles.header}>
        <ThemedText type="headline" color={theme.text}>{name}</ThemedText>
        {unit && <ThemedText type="small" color={theme.textSecondary}>{unit}</ThemedText>}
      </View>

      {numericPoints.length > 0 ? <View style={[styles.card, { backgroundColor: theme.background, borderColor: theme.border }]}>
          <ValueChart points={numericPoints} />
        </View> : <EmptyState icon={{ ios: 'chart.xyaxis.line', android: 'show_chart', web: 'show_chart' }} title={t('aiAnalysis.noChartTitle')} message={t('aiAnalysis.noChartMessage')} />}

      <View style={[styles.card, { backgroundColor: theme.background, borderColor: theme.border }]}>
        {[...history].reverse().map((point, index) => <View key={`${point.reportId}-${index}`} style={[styles.row, { borderBottomColor: theme.border }]}>
            <ThemedText type="small" color={theme.textSecondary}>{formatReportDate(point.takenAt, locale)}</ThemedText>
            <ThemedText type="smallBold" color={point.flag ? theme.error : theme.text}>
              {point.value}{point.unit ? ` ${point.unit}` : ''}
            </ThemedText>
          </View>)}
      </View>
    </ScreenScrollView>;
}

export default observer(LabHistoryScreen);

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  header: {
    gap: 2
  },
  card: {
    borderWidth: 1,
    borderRadius: 20,
    padding: Spacing.three
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.two,
    borderBottomWidth: StyleSheet.hairlineWidth
  }
});
