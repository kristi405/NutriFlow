import { Fragment, useEffect, useMemo, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { SymbolView } from 'expo-symbols';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Circle, Line, Polyline, Text as SvgText } from 'react-native-svg';
import { ThemedText } from '@/components/themed-text';
import { DetailedNutritionCard } from '@/components/progress/detailed-nutrition-card';
import { MacroBar } from '@/components/ui/macro-bar';
import { ScreenScrollView } from '@/components/ui/screen-scroll-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { addDays, todayKey } from '@/lib/date';
import { calculateBMI, calculateDailyTargets } from '@/lib/nutrition';
import { displayWeight, weightUnitLabel } from '@/lib/units';
import { useDailyNutrition } from '@/hooks/useDailyNutrition';
import { PersonSwitcher } from '@/components/people/person-switcher';
import { ACHIEVEMENT_GOALS, achievementsStore } from '@/store/achievementsStore';
import { peopleStore } from '@/store/peopleStore';
import { foodLogStore } from '@/store/foodLogStore';
import { profileStore } from '@/store/profileStore';
import { waterStore } from '@/store/waterStore';
import { weightLogStore } from '@/store/weightLogStore';

const CHART_WIDTH = 300;
const CHART_HEIGHT = 170;
const CHART_LEFT_PADDING = 38;
const CHART_RIGHT_PADDING = 8;
const CHART_TOP_PADDING = 16;
const CHART_BOTTOM_PADDING = 28;
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
  key: 'streak',
  titleKey: 'progress.achievementStreakTitle',
  subtitleKey: 'progress.achievementStreakSubtitle'
}, {
  icon: { ios: 'drop.fill', android: 'water_drop', web: 'water_drop' },
  key: 'water',
  titleKey: 'progress.achievementWaterTitle',
  subtitleKey: 'progress.achievementWaterSubtitle'
}, {
  icon: { ios: 'bolt.fill', android: 'bolt', web: 'bolt' },
  key: 'protein',
  titleKey: 'progress.achievementProteinTitle',
  subtitleKey: 'progress.achievementProteinSubtitle'
}, {
  icon: { ios: 'fork.knife', android: 'restaurant_menu', web: 'restaurant_menu' },
  key: 'firstRecipe',
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

function WeightChart({ entries, theme }) {
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
  const singleX = (plotLeft + plotRight) / 2;
  const coords = entries.map((entry, index) => ({
    x: entries.length > 1 ? plotLeft + index * stepX : singleX,
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
          <SvgText x={plotLeft - 10} y={tick.y + 3} fontSize={9} fill={theme.textSecondary} textAnchor="end">
            {Math.round(tick.value)}
          </SvgText>
        </Fragment>)}
      <Polyline points={polylinePoints} fill="none" stroke={theme.primary} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
      {coords.length <= 14 && coords.slice(0, -1).map(point => <Circle key={point.x} cx={point.x} cy={point.y} r={3} fill={theme.primary} />)}
      <Circle cx={last.x} cy={last.y} r={5} fill={theme.primary} />
      {xTicks.map(tick => <SvgText key={`${tick.label}-${tick.x}`} x={tick.x} y={CHART_HEIGHT - 4} fontSize={9} fill={theme.textSecondary} textAnchor="middle">
          {tick.label}
        </SvgText>)}
    </Svg>;
}

function StatCard({ icon, label, value, unit, theme, styles }) {
  return <View style={styles.statCard}>
      <View style={styles.statHeader}>
        <SymbolView name={icon} size={14} tintColor={theme.accent} />
        <ThemedText type="caption" color={theme.textSecondary}>{label}</ThemedText>
      </View>
      <ThemedText type="smallBold" color={theme.text}>
        {value}{unit ? ` ${unit}` : ''}
      </ThemedText>
    </View>;
}

function ProgressScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const profile = profileStore.activeProfile;
  const { total } = useDailyNutrition(todayKey());
  const waterMl = waterStore.totalForDate(todayKey());
  const targets = useMemo(() => profile ? calculateDailyTargets(profile) : undefined, [profile]);
  useEffect(() => {
    if (!targets) return;
    achievementsStore.sync({ waterTargetMl: targets.water, proteinTarget: targets.protein });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [foodLogStore.entries.length, waterStore.entries.length, targets?.water, targets?.protein, peopleStore.currentPersonId]);
  const [rangeKey, setRangeKey] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const currentWeightKg = profile?.weightKg;
  const targetWeightKg = profile?.targetWeightKg;
  const bmi = profile ? calculateBMI(profile.weightKg, profile.heightCm) : undefined;
  const unitLabel = weightUnitLabel(profile?.preferences?.units);

  useEffect(() => {
    weightLogStore.syncToday(currentWeightKg);
  }, [currentWeightKg, peopleStore.currentPersonId]);

  const activeRange = RANGE_OPTIONS.find(option => option.key === rangeKey);
  const historyEntries = activeRange?.days !== undefined ? weightLogStore.entriesSince(addDays(todayKey(), -activeRange.days)) : activeRange?.key === 'all' ? weightLogStore.sortedEntries : weightLogStore.entriesSince(addDays(todayKey(), -30));
  const chartEntries = useMemo(() => historyEntries.map(entry => ({
    date: entry.date,
    weight: displayWeight(entry.weightKg, profile?.preferences?.units)
  })), [historyEntries, profile?.preferences?.units]);

  const startWeightKg = weightLogStore.sortedEntries[0]?.weightKg ?? currentWeightKg;
  const weightLostKg = startWeightKg !== undefined && currentWeightKg !== undefined ? Math.abs(startWeightKg - currentWeightKg) : undefined;

  if (!profile || !targets) return null;

  return <ScreenScrollView isTabScreen gap={Spacing.three}>
      <View style={styles.header}>
        <ThemedText type="title" style={styles.title} color={theme.text}>
          {t('progress.title')}
        </ThemedText>
        <ThemedText type="default" color={theme.textSecondary}>
          {t('progress.subtitle')}
        </ThemedText>
      </View>

      <PersonSwitcher />

      <View style={styles.statsGrid}>
        <StatCard theme={theme} styles={styles} icon={{ ios: 'scalemass.fill', android: 'monitor_weight', web: 'monitor_weight' }} label={t('progress.currentWeight')} value={displayWeight(currentWeightKg, profile.preferences?.units)} unit={unitLabel} />
        <StatCard theme={theme} styles={styles} icon={{ ios: 'arrow.down.right', android: 'south_east', web: 'south_east' }} label={t('progress.weightLost')} value={weightLostKg !== undefined ? displayWeight(weightLostKg, profile.preferences?.units) : '—'} unit={weightLostKg !== undefined ? unitLabel : undefined} />
        <StatCard theme={theme} styles={styles} icon={{ ios: 'figure', android: 'accessibility_new', web: 'accessibility_new' }} label={t('progress.bmi')} value={Math.round(bmi * 10) / 10} />
        <StatCard theme={theme} styles={styles} icon={{ ios: 'target', android: 'target', web: 'target' }} label={t('progress.targetWeight')} value={targetWeightKg !== undefined ? displayWeight(targetWeightKg, profile.preferences?.units) : '—'} unit={targetWeightKg !== undefined ? unitLabel : undefined} />
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
          <WeightChart entries={chartEntries} theme={theme} />
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

      <Pressable onPress={() => setShowDetails(current => !current)} style={({ pressed }) => [styles.showMoreButton, pressed && styles.showMorePressed]}>
        <ThemedText type="smallBold" color={theme.accent}>{showDetails ? t('progress.showLess') : t('progress.showMore')}</ThemedText>
        <SymbolView name={showDetails ? { ios: 'chevron.up', android: 'expand_less', web: 'expand_less' } : { ios: 'chevron.down', android: 'expand_more', web: 'expand_more' }} size={14} tintColor={theme.accent} />
      </Pressable>

      {showDetails && <DetailedNutritionCard total={total} targets={targets} />}

      {peopleStore.currentPersonId === null && <View style={[styles.card, styles.lastCard]}>
        <ThemedText type="smallBold" color={theme.text}>
          {t('progress.achievements')}
        </ThemedText>
        <View style={styles.achievementsList}>
          {ACHIEVEMENTS.map(achievement => {
          const goal = ACHIEVEMENT_GOALS[achievement.key];
          const filled = achievementsStore.progressFor(achievement.key);
          const isUnlocked = Boolean(achievementsStore.unlocked[achievement.key]);
          return <View key={achievement.titleKey} style={styles.achievementRow}>
              <View style={styles.iconWrapper}>
                <SymbolView name={achievement.icon} size={18} tintColor={theme.accent} />
              </View>
              <View style={styles.achievementText}>
                <View style={styles.achievementTitleRow}>
                  <ThemedText type="smallBold" color={theme.text} style={styles.achievementTitle}>
                    {t(achievement.titleKey)}
                  </ThemedText>
                  {isUnlocked && <SymbolView name={{ ios: 'checkmark.seal.fill', android: 'verified', web: 'verified' }} size={18} tintColor={theme.accent} />}
                </View>
                <ThemedText type="caption" color={theme.textSecondary}>
                  {t(achievement.subtitleKey)}
                </ThemedText>
                <View style={styles.cellsRow}>
                  {Array.from({ length: goal }, (_, index) => <View key={index} style={[styles.cell, index < filled && styles.cellFilled]} />)}
                </View>
              </View>
            </View>;
        })}
        </View>
      </View>}
    </ScreenScrollView>;
}

export default observer(ProgressScreen);

const createStyles = theme => StyleSheet.create({
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
    borderColor: theme.accent,
    shadowColor: theme.accent,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
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
    borderColor: theme.accent,
    shadowColor: theme.accent,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderRadius: 20,
    padding: Spacing.three
  },
  lastCard: {
    marginBottom: Spacing.four
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
    backgroundColor: theme.accent
  },
  chartWrapper: {
    alignItems: 'center'
  },
  showMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: theme.accent,
    borderRadius: 14,
    paddingVertical: Spacing.two,
    backgroundColor: theme.background,
    shadowColor: theme.accent,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3
  },
  showMorePressed: {
    opacity: 0.8
  },
  barsGroup: {
    gap: Spacing.three
  },
  achievementsList: {
    gap: Spacing.three
  },
  achievementRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.two
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.accentSoft,
    alignItems: 'center',
    justifyContent: 'center'
  },
  achievementTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  achievementTitle: {
    flexShrink: 1
  },
  cellsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8
  },
  cell: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.backgroundElement,
    borderWidth: 1,
    borderColor: theme.border
  },
  cellFilled: {
    backgroundColor: theme.accent,
    borderColor: theme.accent
  },
  achievementText: {
    flex: 1,
    gap: 2
  }
});
