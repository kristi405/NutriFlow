import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { observer } from 'mobx-react-lite';
import { Pressable, StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ScreenScrollView } from '@/components/ui/screen-scroll-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { localeStore } from '@/store/localeStore';

const LANGUAGES = [{ code: 'en', nativeLabel: 'English' }, { code: 'ru', nativeLabel: 'Русский' }, { code: 'pl', nativeLabel: 'Polski' }, { code: 'de', nativeLabel: 'Deutsch' }];

function SelectLanguageScreen() {
  const theme = useTheme();

  function handleSelect(code) {
    localeStore.setLanguage(code);
    router.back();
  }

  return <ScreenScrollView gap={Spacing.two} horizontalPadding={20}>
      <View style={[styles.list, { backgroundColor: theme.background, borderColor: theme.border }]}>
        {LANGUAGES.map((language, index) => {
        const isActive = localeStore.language === language.code;
        return <Pressable key={language.code} onPress={() => handleSelect(language.code)} style={[styles.row, index !== LANGUAGES.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.border }]}>
              <ThemedText type="default" color={theme.text}>{language.nativeLabel}</ThemedText>
              {isActive && <SymbolView name={{ ios: 'checkmark', android: 'check', web: 'check' }} size={18} tintColor={theme.accent} />}
            </Pressable>;
      })}
      </View>
    </ScreenScrollView>;
}

export default observer(SelectLanguageScreen);

const styles = StyleSheet.create({
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
  }
});
