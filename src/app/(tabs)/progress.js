import { useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import { SymbolView } from 'expo-symbols';
import { useTranslation } from 'react-i18next';
import { Dimensions, StyleSheet, View } from 'react-native';
import Svg, { Circle, Polyline } from 'react-native-svg';
import { ThemedText } from '@/components/themed-text';
import { MacroBar } from '@/components/ui/macro-bar';
import { ScreenScrollView } from '@/components/ui/screen-scroll-view';
import { Colors, LoginButtonGreen, LoginIconBackground, Spacing } from '@/constants/theme';
import { todayKey } from '@/lib/date';
import { calculateBMI, calculateDailyTargets } from '@/lib/nutrition';
import { useDailyNutrition } from '@/hooks/useDailyNutrition';
import { profileStore } from '@/store/profileStore';
import { waterStore } from '@/store/waterStore';

const theme = Colors.light;

const CHART_WIDTH = 300;
const CHART_HEIGHT = 120;
const CHART_PADDING = 12;
const TREND_POINTS = 7;

const CONTAINER_PADDING = Spacing.four;
const STAT_CARD_GAP = Spacing.two;
const STAT_CARD_WIDTH = (Dimensions.get('window').width - CONTAINER_PADDING * 2 - STAT_CARD_GAP) / 2;

const ACHIEVEMENTS = [{
  icon: 'flame.fill',
  titleKey: 'progress.achievementStreakTitle',
  subtitleKey: 'progress.achievementStreakSubtitle'
}, {
  icon: 'drop.fill',
  titleKey: 'progress.achievementWaterTitle',
  subtitleKey: 'progress.achievementWaterSubtitle'
}, {
  icon: 'bolt.fill',
  titleKey: 'progress.achievementProteinTitle',
  subtitleKey: 'progress.achievementProteinSubtitle'
}, {
  icon: 'fork.knife',
  titleKey: 'progress.achievementFirstRecipeTitle',
  subtitleKey: 'progress.achievementFirstRecipeSubtitle'
}];

function buildWeightTrend(startKg, currentKg) {
  return Array.from({
    length: TREND_POINTS
  }, (_, index) => startKg + (currentKg - startKg) * (index / (TREND_POINTS - 1)));
}

function WeightChart({ points }) {
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const stepX = (CHART_WIDTH - CHART_PADDING * 2) / (points.length - 1);
  const coords = points.map((value, index) => {
    const x = CHART_PADDING + index * stepX;
    const y = CHART_PADDING + (1 - (value - min) / range) * (CHART_HEIGHT - CHART_PADDING * 2);
    return {
      x,
      y
    };
  });
  const polylinePoints = coords.map(point => `${point.x},${point.y}`).join(' ');
  const last = coords[coords.length - 1];
  return <Svg width={CHART_WIDTH} height={CHART_HEIGHT}>
      <Polyline points={polylinePoints} fill="none" stroke={theme.primary} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
      <Circle cx={last.x} cy={last.y} r={5} fill={theme.primary} />
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

  const currentWeightKg = profile?.weightKg;
  const targetWeightKg = profile?.targetWeightKg;
  const bmi = profile ? calculateBMI(profile.weightKg, profile.heightCm) : undefined;
  const startWeightKg = currentWeightKg !== undefined ? currentWeightKg + (profile.goal?.type === 'gain-weight' ? -3 : 3) : undefined;
  const weightLostKg = startWeightKg !== undefined ? Math.abs(startWeightKg - currentWeightKg) : undefined;
  const trend = useMemo(() => startWeightKg !== undefined ? buildWeightTrend(startWeightKg, currentWeightKg) : [], [startWeightKg, currentWeightKg]);

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
        <StatCard icon="scalemass.fill" label={t('progress.currentWeight')} value={Math.round(currentWeightKg * 10) / 10} unit={t('common.kg')} />
        <StatCard icon="arrow.down.right" label={t('progress.weightLost')} value={Math.round(weightLostKg * 10) / 10} unit={t('common.kg')} />
        <StatCard icon="figure" label={t('progress.bmi')} value={Math.round(bmi * 10) / 10} />
        <StatCard icon="target" label={t('progress.targetWeight')} value={targetWeightKg !== undefined ? Math.round(targetWeightKg * 10) / 10 : '—'} unit={targetWeightKg !== undefined ? t('common.kg') : undefined} />
      </View>

      <View style={styles.card}>
        <ThemedText type="smallBold" color={theme.text}>
          {t('progress.weightProgress')}
        </ThemedText>
        <View style={styles.chartWrapper}>
          <WeightChart points={trend} />
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
    width: STAT_CARD_WIDTH,
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
