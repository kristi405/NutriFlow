import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export function SquareOptionCard({ title, subtitle, icon, selected, onPress }) {
  const theme = useTheme();
  return <Pressable onPress={onPress} style={({ pressed }) => [styles.card, {
    backgroundColor: selected ? theme.primarySoft : theme.background,
    borderColor: selected ? theme.primary : theme.border,
    borderWidth: selected ? 2 : 1
  }, pressed && styles.pressed]}>
      {selected && <View style={styles.checkBadge}>
          <SymbolView name={{ ios: 'checkmark.circle.fill', android: 'check_circle', web: 'check_circle' }} size={20} tintColor={theme.primary} />
        </View>}
      <View style={[styles.iconWrapper, { backgroundColor: theme.accentSoft }]}>
        <SymbolView name={icon} size={32} tintColor={theme.accent} />
      </View>
      <View style={styles.textWrapper}>
        <ThemedText type="smallBold" color={theme.text} style={styles.title}>{title}</ThemedText>
        {subtitle && <ThemedText type="caption" color={theme.textSecondary} style={styles.subtitle}>
            {subtitle}
          </ThemedText>}
      </View>
    </Pressable>;
}

const styles = StyleSheet.create({
  card: {
    width: '48%',
    aspectRatio: 1,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.three,
    gap: Spacing.two
  },
  checkBadge: {
    position: 'absolute',
    top: Spacing.two,
    right: Spacing.two
  },
  iconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center'
  },
  textWrapper: {
    alignItems: 'center',
    gap: 2
  },
  title: {
    textAlign: 'center'
  },
  subtitle: {
    textAlign: 'center'
  },
  pressed: {
    opacity: 0.85
  }
});
