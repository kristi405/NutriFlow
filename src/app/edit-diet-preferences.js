import { useMemo, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { observer } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { ScreenScrollView } from '@/components/ui/screen-scroll-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { profileStore } from '@/store/profileStore';

const ALLERGEN_OPTIONS = [{ tag: 'gluten', labelKey: 'onboarding.preferences.gluten' }, { tag: 'dairy', labelKey: 'onboarding.preferences.dairy' }, { tag: 'egg', labelKey: 'onboarding.preferences.egg' }, { tag: 'fish', labelKey: 'onboarding.preferences.fish' }, { tag: 'shellfish', labelKey: 'onboarding.preferences.shellfish' }, { tag: 'tree nuts', labelKey: 'onboarding.preferences.treeNuts' }, { tag: 'peanuts', labelKey: 'onboarding.preferences.peanuts' }, { tag: 'soy', labelKey: 'onboarding.preferences.soy' }, { tag: 'sesame', labelKey: 'onboarding.preferences.sesame' }];

function toggle(list, item) {
  return list.includes(item) ? list.filter(entry => entry !== item) : [...list, item];
}

function EditDietPreferencesScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const insets = useSafeAreaInsets();
  const profile = profileStore.activeProfile;
  const [allergies, setAllergies] = useState(profile?.preferences?.allergies ?? []);

  if (!profile) return null;

  function handleSave() {
    profileStore.updateProfile({
      preferences: { ...profile.preferences, allergies }
    });
    router.back();
  }

  return <LinearGradient colors={[theme.background, theme.primarySoft, theme.accentSoft]} style={styles.flex1}>
      <ScreenScrollView gap={Spacing.four} horizontalPadding={20} contentContainerStyle={styles.scrollContent}>
        <View style={styles.field}>
          <View style={styles.titleRow}>
            <SymbolView name={{ ios: 'exclamationmark.triangle.fill', android: 'warning', web: 'warning' }} size={14} tintColor={theme.error} />
            <ThemedText type="smallBold" color={theme.error}>{t('profile.allergies')}</ThemedText>
          </View>
          <View style={styles.optionGrid}>
            {ALLERGEN_OPTIONS.map(option => {
            const isActive = allergies.includes(option.tag);
            return <Pressable key={option.tag} onPress={() => setAllergies(toggle(allergies, option.tag))} style={[styles.optionTile, isActive && styles.optionTileActive]}>
                  <ThemedText type="smallBold" color={isActive ? theme.accent : theme.text} numberOfLines={2} style={styles.optionLabel}>{t(option.labelKey)}</ThemedText>
                  {isActive && <SymbolView name={{ ios: 'checkmark.circle.fill', android: 'check_circle', web: 'check_circle' }} size={16} tintColor={theme.accent} />}
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
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  field: {
    gap: Spacing.two + Spacing.one
  },
  optionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two
  },
  optionTile: {
    width: '48.5%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    backgroundColor: theme.background,
    borderColor: theme.border,
    borderWidth: 1.5,
    borderRadius: 16,
    paddingVertical: Spacing.two + 2,
    paddingHorizontal: Spacing.two + 2
  },
  optionTileActive: {
    borderColor: theme.accent,
    backgroundColor: theme.accentSoft,
    shadowColor: theme.accent,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3
  },
  optionLabel: {
    flex: 1
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
