import { Fragment, useEffect, useMemo, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { SymbolView } from 'expo-symbols';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Circle, Line, Polyline, Text as SvgText } from 'react-native-svg';
import { ThemedText } from '@/components/themed-text';
import { MacroBar } from '@/components/ui/macro-bar';
import { ScreenScrollView } from '@/components/ui/screen-scroll-view';
import { Colors, LoginButtonGreen, LoginIconBackground, Spacing } from '@/constants/theme';
import { addDays, todayKey } from '@/lib/date';
import { calculateBMI, calculateDailyTargets } from '@/lib/nutrition';
import { displayWeight, weightUnitLabel } from '@/lib/units';
import { useDailyNutrition } from '@/hooks/useDailyNutrition';
import { profileStore } from '@/store/profileStore';
import { waterStore } from '@/store/waterStore';
import { weightLogStore } from '@/store/weightLogStore';

const theme = Colors.light;

const CHART_WIDTH = 300;
const CHART_HEIGHT = 170;
const CHART_LEFT_PADDING = 32;
const CHART_RIGHT_PADDING = 8;
const CHART_TOP_PADDING = 16;
const CHART_BOTTOM_PADDING = 22;
const Y_TICK_COUNT = 4;
const MAX_X_TICKS = 5;

const RANGE_OPTIONS = [{
  key: '6m',
  labelKey: 'progress.range6m',
  days: 182
}, {
  key: '1y',
  labelKey: 'progress.range1y',
  days: 365
}, {
  key: 'all',
  labelKey: 'progress.rangeAll',
  days: undefined
}];

const STAT_CARD_GAP = Spacing.two;

const ACHIEVEMENTS = [{
  icon: { ios: 'flame.fill', android: 'local_fire_department', web: 'local_fire_department' },
  titleKey: 'progress.achievementStreakTitle',
  subtitleKey: 'progress.achievementStreakSubtitle'
}, {
  icon: { ios: 'drop.fill', android: 'water_drop', web: 'water_drop' },
  titleKey: 'progress.achievementWaterTitle',
  subtitleKey: 'progress.achievementWaterSubtitle'
}, {
  icon: { ios: 'bolt.fill', android: 'bolt', web: 'bolt' },
  titleKey: 'progress.achievementProteinTitle',
  subtitleKey: 'progress.achievementProteinSubtitle'
}, {
  icon: { ios: 'fork.knife', android: 'restaurant_menu', web: 'restaurant_menu' },
  titleKey: 'progress.achievementFirstRecipeTitle',
  subtitleKey: 'progress.achievementFirstRecipeSubtitle'
}];

function formatChartDate(dateKey) {
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric'
  });
}

function WeightChart({ entries, unitLabel }) {
  if (entries.length === 0) return null;

  const weights = entries.map(entry => entry.weight);
  const rawMin = Math.min(...weights);
  const rawMax = Math.max(...weights);
  const padding = Math.max((rawMax - rawMin) * 0.2, 1);
  const min = rawMin - padding;
  const max = rawMax + padding;
  const range = max - min || 1;

  const plotLeft = CHART_LEFT_PADDING;
  const plotRight = CHART_WIDTH - CHART_RIGHT_PADDING;
  const plotTop = CHART_TOP_PADDING;
  const plotBottom = CHART_HEIGHT - CHART_BOTTOM_PADDING;
  const plotWidth = plotRight - plotLeft;
  const plotHeight = plotBottom - plotTop;

  const stepX = entries.length > 1 ? plotWidth / (entries.length - 1) : 0;
  const coords = entries.map((entry, index) => ({
    x: plotLeft + index * stepX,
    y: plotTop + (1 - (entry.weight - min) / range) * plotHeight
  }));
  const polylinePoints = coords.map(point => `${point.x},${point.y}`).join(' ');
  const last = coords[coords.length - 1];

  const yTicks = Array.from({
    length: Y_TICK_COUNT
  }, (_, index) => {
    const value = min + range * (index / (Y_TICK_COUNT - 1));
    return {
      value,
      y: plotTop + (1 - index / (Y_TICK_COUNT - 1)) * plotHeight
    };
  });

  const xTickCount = Math.min(entries.length, MAX_X_TICKS);
  const xTicks = Array.from({
    length: xTickCount
  }, (_, index) => {
    const pointIndex = xTickCount === 1 ? 0 : Math.round((entries.length - 1) * (index / (xTickCount - 1)));
    return {
      label: formatChartDate(entries[pointIndex].date),
      x: coords[pointIndex].x
    };
  });

  return <Svg width={CHART_WIDTH} height={CHART_HEIGHT}>
      {yTicks.map(tick => <Fragment key={tick.y}>
          <Line x1={plotLeft} x2={plotRight} y1={tick.y} y2={tick.y} stroke={theme.border} strokeWidth={1} />
          <SvgText x={plotLeft - 6} y={tick.y + 3} fontSize={9} fill={theme.textSecondary} textAnchor="end">
            {Math.round(tick.value)}
          </SvgText>
        </Fragment>)}
      <SvgText x={2} y={plotTop - 4} fontSize={9} fill={theme.textSecondary}>
        {unitLabel}
      </SvgText>
      <Polyline points={polylinePoints} fill="none" stroke={theme.primary} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
      <Circle cx={last.x} cy={last.y} r={5} fill={theme.primary} />
      {xTicks.map(tick => <SvgText key={`${tick.label}-${tick.x}`} x={tick.x} y={CHART_HEIGHT - 6} fontSize={9} fill={theme.textSecondary} textAnchor="middle">
          {tick.label}
        </SvgText>)}
    </Svg>;
}

function StatCard({ icon, label, value, unit }) {
  return <View style={styles.statCard}>
      <View style={styles.statHeader}>
        <SymbolView name={icon} size={14} tintColor={LoginButtonGreen} />
        <ThemedText type="caption" color={theme.textSecondary}>{label}</ThemedText>
      </View>
      <ThemedText type="smallBold" color={theme.text}>
        {value}{unit ? ` ${unit}` : ''}
      </ThemedText>
    </View>;
}

function ProgressScreen() {
  const { t } = useTranslation();
  const profile = profileStore.profile;
  const { total } = useDailyNutrition(todayKey());
  const waterMl = waterStore.totalForDate(todayKey());
  const targets = useMemo(() => profile ? calculateDailyTargets(profile) : undefined, [profile]);
  const [rangeKey, setRangeKey] = useState(null);

  const currentWeightKg = profile?.weightKg;
  const targetWeightKg = profile?.targetWeightKg;
  const bmi = profile ? calculateBMI(profile.weightKg, profile.heightCm) : undefined;
  const unitLabel = weightUnitLabel(profile?.preferences?.units);

  useEffect(() => {
    weightLogStore.ensureSeeded(currentWeightKg, profile?.goal?.type);
  }, [currentWeightKg, profile?.goal?.type]);

  const activeRange = RANGE_OPTIONS.find(option => option.key === rangeKey);
  const historyEntries = activeRange?.days !== undefined ? weightLogStore.entriesSince(addDays(todayKey(), -activeRange.days)) : activeRange?.key === 'all' ? weightLogStore.sortedEntries : weightLogStore.entriesSince(addDays(todayKey(), -30));
  const chartEntries = useMemo(() => historyEntries.map(entry => ({
    date: entry.date,
    weight: displayWeight(entry.weightKg, profile?.preferences?.units)
  })), [historyEntries, profile?.preferences?.units]);

  const startWeightKg = weightLogStore.sortedEntries[0]?.weightKg ?? currentWeightKg;
  const weightLostKg = startWeightKg !== undefined && currentWeightKg !== undefined ? Math.abs(startWeightKg - currentWeightKg) : undefined;

  if (!profile || !targets) return null;

  return <ScreenScrollView gap={Spacing.three}>
      <View style={styles.header}>
        <ThemedText type="title" style={styles.title} color={theme.text}>
          {t('progress.title')}
        </ThemedText>
        <ThemedText type="default" color={theme.textSecondary}>
          {t('progress.subtitle')}
        </ThemedText>
      </View>

      <View style={styles.statsGrid}>
        <StatCard icon={{ ios: 'scalemass.fill', android: 'monitor_weight', web: 'monitor_weight' }} label={t('progress.currentWeight')} value={displayWeight(currentWeightKg, profile.preferences?.units)} unit={unitLabel} />
        <StatCard icon={{ ios: 'arrow.down.right', android: 'south_east', web: 'south_east' }} label={t('progress.weightLost')} value={weightLostKg !== undefined ? displayWeight(weightLostKg, profile.preferences?.units) : '—'} unit={weightLostKg !== undefined ? unitLabel : undefined} />
        <StatCard icon={{ ios: 'figure', android: 'accessibility_new', web: 'accessibility_new' }} label={t('progress.bmi')} value={Math.round(bmi * 10) / 10} />
        <StatCard icon={{ ios: 'target', android: 'target', web: 'target' }} label={t('progress.targetWeight')} value={targetWeightKg !== undefined ? displayWeight(targetWeightKg, profile.preferences?.units) : '—'} unit={targetWeightKg !== undefined ? unitLabel : undefined} />
      </View>

      <View style={styles.card}>
        <View style={styles.chartHeaderRow}>
          <ThemedText type="smallBold" color={theme.text}>
            {t('progress.weightProgress')}
          </ThemedText>
          <View style={styles.rangeRow}>
            {RANGE_OPTIONS.map(option => {
            const isActive = rangeKey === option.key;
            return <Pressable key={option.key} onPress={() => setRangeKey(isActive ? null : option.key)} style={[styles.rangeButton, isActive && styles.rangeButtonActive]}>
                  <ThemedText type="caption" color={isActive ? '#ffffff' : theme.textSecondary}>
                    {t(option.labelKey)}
                  </ThemedText>
                </Pressable>;
          })}
          </View>
        </View>
        <View style={styles.chartWrapper}>
          <WeightChart entries={chartEntries} unitLabel={unitLabel} />
        </View>
      </View>

      <View style={styles.card}>
        <ThemedText type="smallBold" color={theme.text}>
          {t('progress.todayProgress')}
        </ThemedText>
        <View style={styles.barsGroup}>
          <MacroBar label={t('recipes.calories')} value={total.nutrition.calories} target={targets.calories} unit={t('common.kcal')} color={theme.primary} />
          <MacroBar label={t('home.protein')} value={total.nutrition.protein} target={targets.protein} color={theme.primary} />
          <MacroBar label={t('home.carbs')} value={total.nutrition.carbs} target={targets.carbs} color={theme.secondary} />
          <MacroBar label={t('home.fat')} value={total.nutrition.fat} target={targets.fat} color={theme.warning} />
          <MacroBar label={t('nutrition.water')} value={waterMl} target={targets.water} unit="ml" color={theme.secondary} />
        </View>
      </View>

      <View style={styles.card}>
        <ThemedText type="smallBold" color={theme.text}>
          {t('progress.achievements')}
        </ThemedText>
        <View style={styles.achievementsList}>
          {ACHIEVEMENTS.map(achievement => <View key={achievement.titleKey} style={styles.achievementRow}>
              <View style={styles.iconWrapper}>
                <SymbolView name={achievement.icon} size={18} tintColor={LoginButtonGreen} />
              </View>
              <View style={styles.achievementText}>
                <ThemedText type="smallBold" color={theme.text}>
                  {t(achievement.titleKey)}
                </ThemedText>
                <ThemedText type="caption" color={theme.textSecondary}>
                  {t(achievement.subtitleKey)}
                </ThemedText>
              </View>
            </View>)}
        </View>
      </View>
    </ScreenScrollView>;
}

export default observer(ProgressScreen);

const styles = StyleSheet.create({
  header: {
    gap: Spacing.half
  },
  title: {
    fontSize: 32,
    lineHeight: 38
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: STAT_CARD_GAP
  },
  statCard: {
    width: '48%',
    gap: Spacing.one,
    backgroundColor: theme.background,
    borderColor: theme.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: Spacing.three
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  card: {
    gap: Spacing.three,
    backgroundColor: theme.background,
    borderColor: theme.border,
    borderWidth: 1,
    borderRadius: 20,
    padding: Spacing.three
  },
  chartHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: Spacing.two
  },
  rangeRow: {
    flexDirection: 'row',
    gap: 6
  },
  rangeButton: {
    paddingHorizontal: Spacing.two,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: theme.backgroundElement
  },
  rangeButtonActive: {
    backgroundColor: LoginButtonGreen
  },
  chartWrapper: {
    alignItems: 'center'
  },
  barsGroup: {
    gap: Spacing.three
  },
  achievementsList: {
    gap: Spacing.three
  },
  achievementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: LoginIconBackground,
    alignItems: 'center',
    justifyContent: 'center'
  },
  achievementText: {
    flex: 1,
    gap: 2
  }
});
