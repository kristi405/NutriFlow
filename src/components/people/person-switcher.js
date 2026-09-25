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

/** Pill showing whose data the app is currently showing; opens a picker to switch or add a person. */
function PersonSwitcherComponent({ style }) {
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

  return <>
      <Pressable onPress={() => setIsOpen(true)} style={[styles.pill, { backgroundColor: theme.background, borderColor: theme.border }, style]}>
        <PersonAvatar profile={activeProfile} size={22} />
        <ThemedText type="small" color={theme.text} numberOfLines={1} style={styles.pillLabel}>{activeProfile?.name}</ThemedText>
        <SymbolView name={{ ios: 'chevron.down', android: 'expand_more', web: 'expand_more' }} size={12} tintColor={theme.textSecondary} />
      </Pressable>

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
    borderWidth: 1,
    borderRadius: 999,
    paddingLeft: 6,
    paddingRight: 12,
    paddingVertical: 5
  },
  pillLabel: {
    flexShrink: 1
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
