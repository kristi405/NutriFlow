import { Pressable, StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { todayKey, weekContaining, weekdayLabel } from '@/lib/date';

export function DateStrip({ selectedDate, onSelectDate, style }) {
  const theme = useTheme();
  const days = weekContaining(todayKey());
  return <View style={[styles.row, style]}>
      {days.map(dateKey => {
      const dayNumber = Number(dateKey.split('-')[2]);
      const isSelected = dateKey === selectedDate;
      const isToday = dateKey === todayKey();
      return <Pressable key={dateKey} onPress={() => onSelectDate(dateKey)} style={[styles.day, {
        backgroundColor: isSelected ? theme.accent : 'transparent',
        borderColor: !isSelected && isToday ? theme.accent : 'transparent'
      }]}>
            <ThemedText type="caption" color={isSelected ? '#ffffff' : theme.textSecondary}>
              {weekdayLabel(dateKey)}
            </ThemedText>
            <ThemedText type="smallBold" color={isSelected ? '#ffffff' : theme.text}>
              {dayNumber}
            </ThemedText>
          </Pressable>;
    })}
    </View>;
}
const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.one
  },
  day: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 999,
    borderWidth: 1.5,
    gap: Spacing.one
  }
});
