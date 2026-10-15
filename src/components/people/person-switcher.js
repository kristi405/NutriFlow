import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { observer } from 'mobx-react-lite';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { PersonAvatar } from '@/components/people/person-avatar';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { peopleStore } from '@/store/peopleStore';
import { profileStore } from '@/store/profileStore';

/** Whose data the app is currently showing; opens a picker to switch or add a person.
 *  `variant="pill"` (default) is a labeled chip; `variant="avatarBadge"` wraps `children`
 *  (an avatar) so tapping it opens the switcher, with a small corner icon as a visual hint. */
function PersonSwitcherComponent({ style, variant = 'pill', size = 48, children }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const me = profileStore.profile;
  const activeProfile = profileStore.activeProfile;
  const activeId = peopleStore.currentPersonId;
  if (!me) return null;

  const people = [{ id: null, profile: me, isMe: true }, ...peopleStore.members];

  function handleSelect(id) {
    peopleStore.setActive(id);
    setIsOpen(false);
  }

  function handleAdd() {
    setIsOpen(false);
    router.push('/add-person');
  }

  const badgeSize = Math.round(size * 0.42);

  return <>
      {variant === 'avatarBadge' ? <Pressable onPress={() => setIsOpen(true)} accessibilityLabel={t('people.switchTitle')} style={[{ width: size, height: size }, style]}>
          {children}
          <View style={[styles.avatarBadge, {
        width: badgeSize,
        height: badgeSize,
        borderRadius: badgeSize / 2,
        backgroundColor: theme.accent,
        borderColor: theme.background
      }]}>
            <SymbolView name={{ ios: 'arrow.triangle.2.circlepath', android: 'sync', web: 'sync' }} size={Math.round(badgeSize * 0.55)} tintColor="#ffffff" />
          </View>
        </Pressable> : <Pressable onPress={() => setIsOpen(true)} style={({ pressed }) => [styles.pill, { backgroundColor: theme.accentSoft, borderColor: theme.accent, opacity: pressed ? 0.8 : 1 }, style]}>
          <View style={[styles.pillAvatarRing, { borderColor: theme.accent }]}>
            <PersonAvatar profile={activeProfile} size={24} />
          </View>
          <ThemedText type="smallBold" color={theme.text} numberOfLines={1} style={styles.pillLabel}>{activeProfile?.name}</ThemedText>
          <View style={[styles.pillChevron, { backgroundColor: theme.accent }]}>
            <SymbolView name={{ ios: 'chevron.down', android: 'expand_more', web: 'expand_more' }} size={10} tintColor="#ffffff" />
          </View>
        </Pressable>}

      <Modal visible={isOpen} transparent animationType="slide" onRequestClose={() => setIsOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setIsOpen(false)}>
          <Pressable style={[styles.sheet, { backgroundColor: theme.background }]} onPress={event => event.stopPropagation()}>
            <ThemedText type="smallBold" color={theme.text}>{t('people.switchTitle')}</ThemedText>
            {people.map(person => {
            const isActive = person.id === activeId;
            return <Pressable key={person.id ?? 'me'} onPress={() => handleSelect(person.id)} style={styles.row}>
                  <PersonAvatar profile={person.profile} size={36} />
                  <View style={styles.rowText}>
                    <ThemedText type="smallBold" color={theme.text} numberOfLines={1}>{person.profile.name}</ThemedText>
                    {person.isMe ? <ThemedText type="caption" color={theme.textSecondary}>{t('people.you')}</ThemedText> : null}
                  </View>
                  {isActive ? <SymbolView name={{ ios: 'checkmark', android: 'check', web: 'check' }} size={18} tintColor={theme.accent} /> : null}
                </Pressable>;
          })}
            {peopleStore.canAddMember && <Pressable onPress={handleAdd} style={[styles.addRow, { borderColor: theme.accent }]}>
              <SymbolView name={{ ios: 'plus.circle.fill', android: 'add_circle', web: 'add_circle' }} size={20} tintColor={theme.accent} />
              <ThemedText type="smallBold" color={theme.accent}>{t('people.addPerson')}</ThemedText>
            </Pressable>}
          </Pressable>
        </Pressable>
      </Modal>
    </>;
}

export const PersonSwitcher = observer(PersonSwitcherComponent);

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 8,
    maxWidth: 220,
    borderWidth: 1.5,
    borderRadius: 999,
    paddingLeft: 5,
    paddingRight: 10,
    paddingVertical: 5,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2
  },
  pillAvatarRing: {
    borderWidth: 1.5,
    borderRadius: 14,
    padding: 1
  },
  pillLabel: {
    flexShrink: 1
  },
  pillChevron: {
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center'
  },
  avatarBadge: {
    position: 'absolute',
    right: -4,
    bottom: -4,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center'
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end'
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: Spacing.four,
    paddingBottom: Spacing.six,
    gap: Spacing.three
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three
  },
  rowText: {
    flex: 1
  },
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderRadius: 999,
    paddingVertical: Spacing.two,
    marginTop: Spacing.one
  }
});
