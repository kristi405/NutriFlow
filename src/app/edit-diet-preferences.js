import { useMemo, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { observer } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { ScreenScrollView } from '@/components/ui/screen-scroll-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { profileStore } from '@/store/profileStore';

const DIETARY_OPTIONS = [{ tag: 'vegetarian', labelKey: 'onboarding.preferences.vegetarian' }, { tag: 'vegan', labelKey: 'onboarding.preferences.vegan' }, { tag: 'pescatarian', labelKey: 'onboarding.preferences.pescatarian' }, { tag: 'gluten-free', labelKey: 'onboarding.preferences.glutenFree' }, { tag: 'dairy-free', labelKey: 'onboarding.preferences.dairyFree' }, { tag: 'low-carb', labelKey: 'onboarding.preferences.lowCarb' }, { tag: 'high-protein', labelKey: 'onboarding.preferences.highProtein' }];
const ALLERGEN_OPTIONS = [{ tag: 'gluten', labelKey: 'onboarding.preferences.gluten' }, { tag: 'dairy', labelKey: 'onboarding.preferences.dairy' }, { tag: 'egg', labelKey: 'onboarding.preferences.egg' }, { tag: 'fish', labelKey: 'onboarding.preferences.fish' }, { tag: 'shellfish', labelKey: 'onboarding.preferences.shellfish' }, { tag: 'tree nuts', labelKey: 'onboarding.preferences.treeNuts' }, { tag: 'peanuts', labelKey: 'onboarding.preferences.peanuts' }, { tag: 'soy', labelKey: 'onboarding.preferences.soy' }, { tag: 'sesame', labelKey: 'onboarding.preferences.sesame' }];

function toggle(list, item) {
  return list.includes(item) ? list.filter(entry => entry !== item) : [...list, item];
}

function EditDietPreferencesScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const insets = useSafeAreaInsets();
  const profile = profileStore.profile;
  const [dietaryTags, setDietaryTags] = useState(profile?.preferences?.dietaryTags ?? []);
  const [allergies, setAllergies] = useState(profile?.preferences?.allergies ?? []);

  if (!profile) return null;

  function handleSave() {
    profileStore.updateProfile({
      preferences: { ...profile.preferences, dietaryTags, allergies }
    });
    router.back();
  }

  return <LinearGradient colors={[theme.background, theme.primarySoft, theme.accentSoft]} style={styles.flex1}>
      <ScreenScrollView gap={Spacing.four} horizontalPadding={20} contentContainerStyle={styles.scrollContent}>
        <View style={styles.field}>
          <ThemedText type="small" color={theme.textSecondary}>{t('profile.dietary')}</ThemedText>
          <View style={styles.chipRow}>
            {DIETARY_OPTIONS.map(option => {
            const isActive = dietaryTags.includes(option.tag);
            return <Pressable key={option.tag} onPress={() => setDietaryTags(toggle(dietaryTags, option.tag))} style={[styles.chip, isActive && styles.chipActive]}>
                  <ThemedText type="small" color={isActive ? '#ffffff' : theme.text}>{t(option.labelKey)}</ThemedText>
                </Pressable>;
          })}
          </View>
        </View>

        <View style={styles.field}>
          <ThemedText type="small" color={theme.textSecondary}>{t('profile.allergies')}</ThemedText>
          <View style={styles.chipRow}>
            {ALLERGEN_OPTIONS.map(option => {
            const isActive = allergies.includes(option.tag);
            return <Pressable key={option.tag} onPress={() => setAllergies(toggle(allergies, option.tag))} style={[styles.chip, isActive && styles.chipActive]}>
                  <ThemedText type="small" color={isActive ? '#ffffff' : theme.text}>{t(option.labelKey)}</ThemedText>
                </Pressable>;
          })}
          </View>
        </View>
      </ScreenScrollView>

      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + Spacing.two }]}>
        <Pressable onPress={handleSave} style={styles.saveButton}>
          <ThemedText type="default" color={theme.accent} style={styles.saveButtonText}>{t('common.save')}</ThemedText>
        </Pressable>
      </View>
    </LinearGradient>;
}

export default observer(EditDietPreferencesScreen);

const createStyles = theme => StyleSheet.create({
  flex1: {
    flex: 1
  },
  scrollContent: {
    paddingTop: Spacing.three,
    paddingBottom: Spacing.six
  },
  field: {
    gap: Spacing.two
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two
  },
  chip: {
    borderColor: theme.border,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    backgroundColor: theme.background
  },
  chipActive: {
    backgroundColor: theme.accent,
    borderColor: theme.accent
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingTop: Spacing.two
  },
  saveButton: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderColor: theme.accent,
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: Spacing.two
  },
  saveButtonText: {
    fontWeight: '700'
  }
});
