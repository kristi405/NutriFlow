import { SymbolView } from '@/components/ui/symbol-view';
import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
const WATER_BLUE = '#2F80ED';
const WATER_TRACK = '#DCEBFC';
const QUICK_AMOUNTS_ML = [100, 250, 500];

// Tap feedback for a quick-add button: a small bump on the button itself,
// plus a "+amount" badge that floats up and fades out — same overshoot-then-
// settle spring used for the date strip's selected-day bump (date-strip.js).
function QuickAddButton({ amount, theme, onPress }) {
  const scale = useRef(new Animated.Value(1)).current;
  const pop = useRef(new Animated.Value(0)).current;
  const [showPop, setShowPop] = useState(false);

  function handlePress() {
    onPress();
    Animated.sequence([Animated.timing(scale, { toValue: 0.9, duration: 80, useNativeDriver: true }), Animated.spring(scale, { toValue: 1, friction: 4, tension: 140, useNativeDriver: true })]).start();
    setShowPop(true);
    pop.setValue(0);
    Animated.timing(pop, { toValue: 1, duration: 700, easing: Easing.out(Easing.quad), useNativeDriver: true }).start(() => setShowPop(false));
  }

  const popTranslateY = pop.interpolate({ inputRange: [0, 1], outputRange: [0, -30] });
  const popOpacity = pop.interpolate({ inputRange: [0, 0.15, 0.7, 1], outputRange: [0, 1, 1, 0] });

  return <Animated.View style={[styles.quickButtonWrapper, { transform: [{ scale }] }]}>
      <Pressable onPress={handlePress} style={({ pressed }) => [styles.quickButton, { borderColor: theme.border }, pressed && styles.pressed]}>
        <ThemedText type="caption" color={theme.text}>+{amount} ml</ThemedText>
      </Pressable>
      {showPop && <Animated.View pointerEvents="none" style={[styles.popBadge, { opacity: popOpacity, transform: [{ translateY: popTranslateY }] }]}>
          <ThemedText type="caption" color={WATER_BLUE} style={styles.popText}>+{amount}</ThemedText>
        </Animated.View>}
    </Animated.View>;
}

export function WaterCard({
  consumedMl,
  targetMl,
  onAdd
}) {
  const { t } = useTranslation();
  const theme = useTheme();
  const progress = targetMl > 0 ? Math.min(1, consumedMl / targetMl) : 0;
  // Matches exactly (rounded to 1 decimal place, same precision shown below) — not just "at or over".
  const goalReached = targetMl > 0 && (consumedMl / 1000).toFixed(2) === (targetMl / 1000).toFixed(2);

  // Smoothly animates to the new fill ratio instead of snapping — width isn't
  // a transform, so this one can't use the native driver.
  const progressAnim = useRef(new Animated.Value(progress)).current;
  useEffect(() => {
    Animated.timing(progressAnim, { toValue: progress, duration: 450, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
  }, [progress]);
  const fillWidth = progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'], extrapolate: 'clamp' });

  // Pops the star in with a little overshoot the moment the goal is reached
  // (not on every re-render while it's already reached, and not animated in
  // from nothing if the goal was already met when the card first mounted).
  const starScale = useRef(new Animated.Value(goalReached ? 1 : 0)).current;
  const wasGoalReached = useRef(goalReached);
  useEffect(() => {
    if (goalReached && !wasGoalReached.current) {
      starScale.setValue(0);
      Animated.spring(starScale, { toValue: 1, friction: 5, tension: 120, useNativeDriver: true }).start();
    }
    wasGoalReached.current = goalReached;
  }, [goalReached]);

  return <View style={[styles.card, {
    backgroundColor: theme.background,
    borderColor: goalReached ? WATER_BLUE : theme.border
  }]}>
      <View style={styles.headerRow}>
        <View style={styles.titleRow}>
          <SymbolView name={{ ios: 'drop.fill', android: 'water_drop', web: 'water_drop' }} size={16} tintColor={WATER_BLUE} />
          <ThemedText type="smallBold" color={theme.text}>{t('nutrition.water')}</ThemedText>
          {goalReached && <Animated.View style={{ transform: [{ scale: starScale }] }}>
              <SymbolView name={{ ios: 'star.fill', android: 'star', web: 'star' }} size={14} tintColor="#FFC107" />
            </Animated.View>}
        </View>
        <View style={styles.headerRight}>
          <ThemedText type="small" color={theme.textSecondary}>
            {(consumedMl / 1000).toFixed(2)} / {(targetMl / 1000).toFixed(2)} L
          </ThemedText>
          <Pressable onPress={() => onAdd(-Math.min(100, consumedMl))} hitSlop={8} disabled={consumedMl <= 0}>
            <SymbolView name={{ ios: 'minus.circle', android: 'remove_circle', web: 'remove_circle' }} size={18} tintColor={consumedMl <= 0 ? theme.border : WATER_BLUE} />
          </Pressable>
        </View>
      </View>
      <View style={[styles.track, {
      backgroundColor: WATER_TRACK
    }]}>
        <Animated.View style={[styles.fill, {
        width: fillWidth,
        backgroundColor: WATER_BLUE
      }]} />
      </View>
      <View style={styles.buttonRow}>
        {QUICK_AMOUNTS_ML.map(amount => <QuickAddButton key={amount} amount={amount} theme={theme} onPress={() => onAdd(amount)} />)}
      </View>
    </View>;
}
const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: Spacing.three,
    gap: Spacing.two
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one
  },
  track: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden'
  },
  fill: {
    height: '100%',
    borderRadius: 4
  },
  buttonRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginTop: Spacing.one
  },
  quickButtonWrapper: {
    flex: 1
  },
  quickButton: {
    alignItems: 'center',
    paddingVertical: Spacing.one,
    borderRadius: 10,
    borderWidth: 1
  },
  pressed: {
    opacity: 0.7
  },
  popBadge: {
    position: 'absolute',
    top: -4,
    left: 0,
    right: 0,
    alignItems: 'center'
  },
  popText: {
    fontWeight: '700'
  }
});
