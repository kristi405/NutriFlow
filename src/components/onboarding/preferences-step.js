import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const ALLERGEN_TAGS = [{
  tag: 'gluten',
  key: 'gluten'
}, {
  tag: 'dairy',
  key: 'dairy'
}, {
  tag: 'egg',
  key: 'egg'
}, {
  tag: 'fish',
  key: 'fish'
}, {
  tag: 'shellfish',
  key: 'shellfish'
}, {
  tag: 'tree nuts',
  key: 'treeNuts'
}, {
  tag: 'peanuts',
  key: 'peanuts'
}, {
  tag: 'soy',
  key: 'soy'
}, {
  tag: 'sesame',
  key: 'sesame'
}];

function Chip({
  label,
  selected,
  onPress
}) {
  const theme = useTheme();
  return <Pressable onPress={onPress} style={[styles.optionTile, selected && styles.optionTileActive, {
    backgroundColor: selected ? theme.accentSoft : theme.background,
    borderColor: selected ? theme.accent : theme.border
  }]}>
      <ThemedText type="smallBold" color={selected ? theme.accent : theme.text} numberOfLines={2} style={styles.optionLabel}>
        {label}
      </ThemedText>
      {selected && <SymbolView name={{ ios: 'checkmark.circle.fill', android: 'check_circle', web: 'check_circle' }} size={16} tintColor={theme.accent} />}
    </Pressable>;
}
function toggle(list, item) {
  return list.includes(item) ? list.filter(entry => entry !== item) : [...list, item];
}
export function PreferencesStep({
  allergies,
  onChangeAllergies
}) {
  const { t } = useTranslation();
  const theme = useTheme();
  const ALLERGEN_OPTIONS = ALLERGEN_TAGS.map(({ tag, key }) => ({
    tag,
    label: t(`onboarding.preferences.${key}`)
  }));
  return <View style={styles.container}>
      <ThemedText type="title" style={styles.title} color={theme.text}>
        {t('onboarding.preferences.title')}
      </ThemedText>
      <ThemedText type="default" color={theme.textSecondary}>
        {t('onboarding.preferences.subtitle')}
      </ThemedText>
      <ThemedText type="caption" color={theme.textSecondary}>
        {t('onboarding.preferences.canSkip')}
      </ThemedText>

      <View style={styles.section}>
        <ThemedText type="smallBold" color={theme.accent}>{t('onboarding.preferences.allergies')}</ThemedText>
        <View style={styles.chipRow}>
          {ALLERGEN_OPTIONS.map(option => <Chip key={option.tag} label={option.label} selected={allergies.includes(option.tag)} onPress={() => onChangeAllergies(toggle(allergies, option.tag))} />)}
        </View>
      </View>
    </View>;
}
const styles = StyleSheet.create({
  container: {
    gap: Spacing.three
  },
  title: {
    fontSize: 32,
    lineHeight: 38
  },
  section: {
    gap: Spacing.three,
    marginTop: Spacing.two
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two
  },
  optionTile: {
    width: '48.5%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderRadius: 16,
    borderWidth: 1.5,
    paddingVertical: Spacing.two + 2,
    paddingHorizontal: Spacing.two + 2
  },
  optionTileActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3
  },
  optionLabel: {
    flex: 1
  }
});
