import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
export function SkeletonBlock({
  width = '100%',
  height = 16,
  borderRadius = 8
}) {
  const theme = useTheme();
  const opacity = useSharedValue(0.5);
  useEffect(() => {
    opacity.value = withRepeat(withTiming(1, {
      duration: 700,
      easing: Easing.inOut(Easing.ease)
    }), -1, true);
  }, [opacity]);
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value
  }));
  return <Animated.View style={[{
    width,
    height,
    borderRadius,
    backgroundColor: theme.backgroundElement
  }, animatedStyle]} />;
}
export function SkeletonCardRow({
  count = 3
}) {
  return <View style={styles.row}>
      {Array.from({
      length: count
    }).map((_, index) => <SkeletonBlock key={index} width={160} height={200} borderRadius={20} />)}
    </View>;
}
export function SkeletonList({
  count = 4
}) {
  return <View style={styles.list}>
      {Array.from({
      length: count
    }).map((_, index) => <SkeletonBlock key={index} height={72} borderRadius={16} />)}
    </View>;
}
const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: Spacing.three
  },
  list: {
    gap: Spacing.three
  }
});
