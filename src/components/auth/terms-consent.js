import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TermsContent } from '@/components/terms-content';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export function TermsLink() {
  const { t } = useTranslation();
  const theme = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  return <View style={styles.wrapper}>
      <Pressable onPress={() => setIsOpen(true)} hitSlop={8}>
        <ThemedText type="caption" color={theme.accent} style={styles.link}>{t('auth.terms.link')}</ThemedText>
      </Pressable>

      <Modal visible={isOpen} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setIsOpen(false)}>
        <SafeAreaView edges={['bottom']} style={[styles.modal, { backgroundColor: theme.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
            <ThemedText type="headline" color={theme.text}>{t('auth.terms.link')}</ThemedText>
            <Pressable onPress={() => setIsOpen(false)} hitSlop={10}>
              <ThemedText type="smallBold" color={theme.accent}>{t('auth.terms.close')}</ThemedText>
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={styles.modalBody}>
            <TermsContent />
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </View>;
}

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 'auto',
    paddingTop: Spacing.four,
    paddingBottom: Spacing.two,
    alignItems: 'center'
  },
  link: {
    fontSize: 12,
    lineHeight: 15,
    fontWeight: '700',
    textDecorationLine: 'underline'
  },
  modal: {
    flex: 1
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: Spacing.three,
    borderBottomWidth: StyleSheet.hairlineWidth
  },
  modalBody: {
    padding: 20,
    gap: Spacing.three
  }
});
