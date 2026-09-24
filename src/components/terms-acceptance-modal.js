import { SymbolView } from 'expo-symbols';
import { observer } from 'mobx-react-lite';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TermsContent } from '@/components/terms-content';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { termsStore } from '@/store/termsStore';

function TermsAcceptanceModal() {
  const { t } = useTranslation();
  const theme = useTheme();
  const [checked, setChecked] = useState(false);
  const insets = useSafeAreaInsets();
  const visible = termsStore.hasHydrated && termsStore.isPending;

  return <Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
      <View style={[styles.modal, { backgroundColor: theme.background, paddingTop: Math.max(insets.top, 54) }]}>
        <View style={[styles.header, { borderBottomColor: theme.border }]}>
          <ThemedText type="headline" color={theme.text}>{t('auth.terms.link')}</ThemedText>
        </View>
        <ScrollView contentContainerStyle={styles.body}>
          <TermsContent />
        </ScrollView>
        <View style={[styles.footer, { borderTopColor: theme.border, paddingBottom: Math.max(insets.bottom, 20) + Spacing.three }]}>
          <Pressable onPress={() => setChecked(prev => !prev)} accessibilityRole="checkbox" accessibilityState={{ checked }} style={styles.checkRow}>
            <View style={[styles.checkbox, { borderColor: theme.accent, backgroundColor: checked ? theme.accent : 'transparent' }]}>
              {checked && <SymbolView name={{ ios: 'checkmark', android: 'check', web: 'check' }} size={13} tintColor="#ffffff" />}
            </View>
            <ThemedText type="small" color={theme.textSecondary} style={styles.checkText}>
              {t('auth.terms.agreePrefix')}{t('auth.terms.link')}{t('auth.terms.agreeSuffix')}
            </ThemedText>
          </Pressable>
          <Pressable onPress={() => termsStore.accept()} disabled={!checked} style={({ pressed }) => [styles.button, { backgroundColor: theme.accent, opacity: checked ? (pressed ? 0.85 : 1) : 0.4 }]}>
            <ThemedText type="smallBold" color="#ffffff" style={styles.buttonText}>{t('auth.terms.accept')}</ThemedText>
          </Pressable>
        </View>
      </View>
    </Modal>;
}

export default observer(TermsAcceptanceModal);

const styles = StyleSheet.create({
  modal: {
    flex: 1
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: Spacing.three,
    borderBottomWidth: StyleSheet.hairlineWidth
  },
  body: {
    padding: 20,
    gap: Spacing.three
  },
  footer: {
    gap: Spacing.three,
    paddingHorizontal: 20,
    paddingTop: Spacing.three,
    borderTopWidth: StyleSheet.hairlineWidth
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.two
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center'
  },
  checkText: {
    flex: 1
  },
  button: {
    paddingVertical: Spacing.three,
    borderRadius: 16,
    alignItems: 'center'
  },
  buttonText: {
    fontSize: 17
  }
});
