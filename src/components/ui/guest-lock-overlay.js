import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { LockedFeature } from '@/components/ui/locked-feature';
import { Spacing } from '@/constants/theme';
import { authStore } from '@/store/authStore';

/**
 * Lets a guest ("Continue without an account") see a screen's real layout
 * (Home/Meal Plan/AI Analysis/Progress, rendered by the caller with
 * placeholder data — see guestMockProfile.js) instead of an immediate
 * "sign in" stub, and only shows that stub once they actually try to
 * interact with it. A transparent Pressable sits over the (now
 * non-interactive) real content and opens the prompt on first tap.
 */
export function GuestLockOverlay({ message, children }) {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);

  if (!authStore.isGuest) return children;

  return <View style={styles.flex1}>
      <View pointerEvents="none" style={styles.flex1}>{children}</View>
      <Pressable style={StyleSheet.absoluteFill} onPress={() => setVisible(true)} />

      <Modal visible={visible} transparent animationType="fade" onRequestClose={() => setVisible(false)}>
        <Pressable style={styles.backdrop} onPress={() => setVisible(false)}>
          <Pressable style={styles.cardWrapper} onPress={event => event.stopPropagation()}>
            <LockedFeature title={t('auth.guestLockedTitle')} message={message} actionLabel={t('auth.signIn')} actionIcon={{ ios: 'person.fill', android: 'person', web: 'person' }} onAction={() => {
            setVisible(false);
            authStore.exitGuestMode();
          }} />
          </Pressable>
        </Pressable>
      </Modal>
    </View>;
}

const styles = StyleSheet.create({
  flex1: {
    flex: 1
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.four
  },
  cardWrapper: {
    width: '100%'
  }
});
