import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Colors, LoginButtonGreen, LoginIconBackground, Spacing } from '@/constants/theme';

const theme = Colors.light;

export function OptionCard({
  title,
  subtitle,
  icon,
  selected,
  onPress
}) {
  return <Pressable onPress={onPress} style={({
    pressed
  }) => [styles.card, {
    backgroundColor: selected ? theme.primarySoft : theme.background,
    borderColor: selected ? theme.primary : theme.border,
    borderWidth: selected ? 2 : 1
  }, pressed && styles.pressed]}>
      {icon && <View style={[styles.iconWrapper, {
      backgroundColor: LoginIconBackground
    }]}>
          <SymbolView name={icon} size={20} tintColor={LoginButtonGreen} />
        </View>}
      <View style={styles.textWrapper}>
        <ThemedText type="smallBold" color={theme.text}>{title}</ThemedText>
        {subtitle && <ThemedText type="caption" color={theme.textSecondary}>
            {subtitle}
          </ThemedText>}
      </View>
      {selected && <SymbolView name={{ ios: 'checkmark.circle.fill', android: 'check_circle', web: 'check_circle' }} size={20} tintColor={theme.primary} />}
    </Pressable>;
}
const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: 16
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center'
  },
  textWrapper: {
    flex: 1,
    gap: 2
  },
  pressed: {
    opacity: 0.85
  }
});
