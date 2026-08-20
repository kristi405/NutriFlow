import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Svg, { Circle } from 'react-native-svg';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
const theme = Colors.light;
export function CalorieRing({
  consumed,
  target,
  size = 200,
  strokeWidth = 16
}) {
  const { t } = useTranslation();
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = target > 0 ? Math.min(1, consumed / target) : 0;
  const remaining = Math.max(0, Math.round(target - consumed));
  return <View style={[styles.container, {
    width: size,
    height: size
  }]}>
      <Svg width={size} height={size}>
        <Circle cx={size / 2} cy={size / 2} r={radius} stroke={theme.backgroundElement} strokeWidth={strokeWidth} fill="none" />
        <Circle cx={size / 2} cy={size / 2} r={radius} stroke={theme.primary} strokeWidth={strokeWidth} strokeLinecap="round" strokeDasharray={`${circumference} ${circumference}`} strokeDashoffset={circumference * (1 - progress)} fill="none" rotation={-90} originX={size / 2} originY={size / 2} />
      </Svg>
      <View style={styles.center} pointerEvents="none">
        <ThemedText type="stat" color={theme.text}>{remaining}</ThemedText>
        <ThemedText type="caption" color={theme.textSecondary}>
          {t('nutrition.kcalLeft')}
        </ThemedText>
      </View>
    </View>;
}
const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  center: {
    position: 'absolute',
    alignItems: 'center',
    gap: 2
  }
});
