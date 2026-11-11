import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { SymbolView } from 'expo-symbols';
import { observer } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { localeStore } from '@/store/localeStore';

// Shown once, right after sign-in and before the onboarding questionnaire —
// gated in _layout.js on localeStore.hasPickedLanguage so a returning,
// already-onboarded user never sees it again.
function LanguageGateScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const languages = localeStore.availableLanguages;
  const [selected, setSelected] = useState(localeStore.language);

  useEffect(() => {
    localeStore.fetchLanguages();
  }, []);

  function handleContinue() {
    localeStore.setLanguage(selected);
    localeStore.markLanguagePicked();
  }

  return <LinearGradient colors={[theme.background, theme.primarySoft, theme.accentSoft]} style={styles.flex1}>
      <SafeAreaView style={styles.flex1}>
        <View style={styles.flex1}>
          <View style={styles.header}>
            <ThemedText type="title" color={theme.text}>{t('onboarding.chooseLanguageTitle')}</ThemedText>
            <ThemedText type="small" color={theme.textSecondary}>{t('onboarding.chooseLanguageSubtitle')}</ThemedText>
          </View>

          <ScrollView style={styles.flex1} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <View style={[styles.list, { backgroundColor: theme.background, borderColor: theme.border }]}>
              {languages.map((language, index) => {
              const isActive = selected === language.code;
              return <Pressable key={language.code} onPress={() => setSelected(language.code)} style={[styles.row, index !== languages.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.border }]}>
                    <ThemedText type="default" color={theme.text}>{language.name}</ThemedText>
                    {isActive && <SymbolView name={{ ios: 'checkmark', android: 'check', web: 'check' }} size={18} tintColor={theme.accent} />}
                  </Pressable>;
            })}
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <Pressable onPress={handleContinue} style={({ pressed }) => [styles.button, { backgroundColor: theme.accent, transform: [{ scale: pressed ? 0.97 : 1 }] }]}>
              <ThemedText type="smallBold" color="#ffffff">{t('onboarding.continue')}</ThemedText>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>;
}

export const LanguageGate = observer(LanguageGateScreen);

const styles = StyleSheet.create({
  flex1: {
    flex: 1
  },
  header: {
    gap: Spacing.one,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two
  },
  content: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.five,
    paddingBottom: Spacing.four,
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    width: '100%'
  },
  list: {
    borderWidth: 1,
    borderRadius: 16,
    overflow: 'hidden'
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three
  },
  footer: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.three
  },
  button: {
    paddingVertical: Spacing.three,
    borderRadius: 16,
    alignItems: 'center'
  }
});
