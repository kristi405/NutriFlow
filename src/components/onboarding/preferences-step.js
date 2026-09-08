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
  return <Pressable onPress={onPress} style={[styles.chip, {
    backgroundColor: selected ? theme.accent : theme.background,
    borderColor: selected ? theme.accent : theme.border
  }]}>
      <ThemedText type="small" color={selected ? '#ffffff' : theme.text}>
        {label}
      </ThemedText>
    </Pressable>;
}
function toggle(list, item) {
  return list.includes(item) ? list.filter(entry => entry !== item) : [...list, item];
}
export function PreferencesStep({
  dietaryTags,
  allergies,
  onChangeDietaryTags,
  onChangeAllergies
}) {
  const { t } = useTranslation();
  const theme = useTheme();
  const DIETARY_OPTIONS = [{
    tag: 'vegetarian',
    label: t('onboarding.preferences.vegetarian')
  }, {
    tag: 'vegan',
    label: t('onboarding.preferences.vegan')
  }, {
    tag: 'pescatarian',
    label: t('onboarding.preferences.pescatarian')
  }, {
    tag: 'gluten-free',
    label: t('onboarding.preferences.glutenFree')
  }, {
    tag: 'dairy-free',
    label: t('onboarding.preferences.dairyFree')
  }, {
    tag: 'low-carb',
    label: t('onboarding.preferences.lowCarb')
  }, {
    tag: 'high-protein',
    label: t('onboarding.preferences.highProtein')
  }];
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
        <ThemedText type="smallBold" color={theme.accent}>{t('onboarding.preferences.dietary')}</ThemedText>
        <View style={styles.chipRow}>
          {DIETARY_OPTIONS.map(option => <Chip key={option.tag} label={option.label} selected={dietaryTags.includes(option.tag)} onPress={() => onChangeDietaryTags(toggle(dietaryTags, option.tag))} />)}
        </View>
      </View>

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
  chip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: 999,
    borderWidth: 1
  }
});
