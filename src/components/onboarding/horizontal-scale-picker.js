import { useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withSpring, withTiming } from 'react-native-reanimated';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';

const ITEM_WIDTH = 12;

export function HorizontalScalePicker({ value, min, max, step = 1, majorStep = 10, unit, onChange }) {
  const theme = useTheme();
  const scrollRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const hasScrolledRef = useRef(false);

  const values = useMemo(() => {
    const arr = [];
    for (let v = min; v <= max + 1e-6; v += step) arr.push(Math.round(v * 100) / 100);
    return arr;
  }, [min, max, step]);

  const clampedValue = Math.min(Math.max(Number(value) || min, min), max);
  const initialIndex = Math.round((clampedValue - min) / step);
  const [liveIndex, setLiveIndex] = useState(initialIndex);
  const pulse = useSharedValue(1);
  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }]
  }));

  useEffect(() => {
    pulse.value = withSequence(withTiming(1.2, { duration: 90 }), withSpring(1, { damping: 8, stiffness: 250 }));
    // Bumps on every displayed value change, including the very first render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [liveIndex]);

  useEffect(() => {
    if (!containerWidth || hasScrolledRef.current) return;
    hasScrolledRef.current = true;
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ x: initialIndex * ITEM_WIDTH, animated: false });
    });
    // Only snap to the starting position once the width is known — subsequent
    // updates come from the user's own scrolling.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerWidth]);

  function handleScroll(event) {
    const index = Math.round(event.nativeEvent.contentOffset.x / ITEM_WIDTH);
    setLiveIndex(Math.min(Math.max(index, 0), values.length - 1));
  }

  function handleMomentumEnd(event) {
    const index = Math.round(event.nativeEvent.contentOffset.x / ITEM_WIDTH);
    const clamped = Math.min(Math.max(index, 0), values.length - 1);
    onChange(values[clamped]);
  }

  return <View>
      <View style={styles.valueRow}>
        <Animated.View style={pulseStyle}>
          <ThemedText type="title" color={theme.text} style={styles.valueText}>{values[liveIndex]}</ThemedText>
        </Animated.View>
        <ThemedText type="small" color={theme.textSecondary}>{unit}</ThemedText>
      </View>
      <View style={styles.scaleWrap} onLayout={event => setContainerWidth(event.nativeEvent.layout.width)}>
        <View pointerEvents="none" style={[styles.centerIndicator, { backgroundColor: theme.accent }]} />
        {containerWidth > 0 && <ScrollView ref={scrollRef} horizontal showsHorizontalScrollIndicator={false} snapToInterval={ITEM_WIDTH} decelerationRate="fast" scrollEventThrottle={16} onScroll={handleScroll} onMomentumScrollEnd={handleMomentumEnd} contentContainerStyle={{
        paddingHorizontal: containerWidth / 2 - ITEM_WIDTH / 2
      }}>
            {values.map(v => {
          const isMajor = Math.round(v / majorStep) * majorStep === Math.round(v);
          return <View key={v} style={styles.tickBox}>
                  <View style={[styles.tick, {
              height: isMajor ? 26 : 13,
              backgroundColor: isMajor ? theme.textSecondary : `${theme.textSecondary}60`
            }]} />
                </View>;
        })}
          </ScrollView>}
      </View>
    </View>;
}

const styles = StyleSheet.create({
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    gap: 4,
    marginBottom: 4
  },
  valueText: {
    fontSize: 22,
    lineHeight: 26
  },
  scaleWrap: {
    height: 38,
    justifyContent: 'center'
  },
  centerIndicator: {
    position: 'absolute',
    left: '50%',
    marginLeft: -1,
    width: 2,
    height: 30,
    borderRadius: 1,
    zIndex: 1
  },
  tickBox: {
    width: ITEM_WIDTH,
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: 30
  },
  tick: {
    width: 2,
    borderRadius: 1
  }
});
