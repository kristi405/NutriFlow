import { useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { todayKey, weekContaining, weekdayLabel } from '@/lib/date';

function DayButton({ isSelected, isToday, onPress, weekday, dayNumber, theme }) {
  const scale = useRef(new Animated.Value(1)).current;
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (!isSelected) return;
    Animated.sequence([Animated.timing(scale, { toValue: 1.18, duration: 160, easing: Easing.out(Easing.quad), useNativeDriver: true }), Animated.spring(scale, { toValue: 1, friction: 4, tension: 140, useNativeDriver: true })]).start();
  }, [isSelected]);
  return <Pressable onPress={onPress} style={styles.dayWrapper}>
      <Animated.View style={[styles.day, {
      backgroundColor: isSelected ? theme.accent : 'transparent',
      borderColor: !isSelected && isToday ? theme.accent : 'transparent',
      transform: [{ scale }]
    }]}>
        <ThemedText type="caption" color={isSelected ? '#ffffff' : theme.textSecondary}>{weekday}</ThemedText>
        <ThemedText type="smallBold" color={isSelected ? '#ffffff' : theme.text}>{dayNumber}</ThemedText>
      </Animated.View>
    </Pressable>;
}

export function DateStrip({ selectedDate, onSelectDate, style }) {
  const theme = useTheme();
  const days = weekContaining(todayKey());
  return <View style={[styles.row, style]}>
      {days.map(dateKey => {
      const dayNumber = Number(dateKey.split('-')[2]);
      const isSelected = dateKey === selectedDate;
      const isToday = dateKey === todayKey();
      return <DayButton key={dateKey} isSelected={isSelected} isToday={isToday} onPress={() => onSelectDate(dateKey)} weekday={weekdayLabel(dateKey)} dayNumber={dayNumber} theme={theme} />;
    })}
    </View>;
}
const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.one
  },
  dayWrapper: {
    flex: 1
  },
  day: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 999,
    borderWidth: 1.5,
    gap: Spacing.one
  }
});
