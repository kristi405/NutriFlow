import { SymbolView } from 'expo-symbols';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Modal, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useKeyboardHeight } from '@/hooks/useKeyboardHeight';

/**
 * Multi-select tag picker in a bottom sheet. Built for long tag lists: a
 * search box narrows it, the list is virtualized, and options arrive already
 * sorted by how many articles use them. Selection applies live — "Done" just
 * closes the sheet.
 */
export function TagFilterSheet({ visible, tags, selectedIds, onChange, onClose }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const keyboardHeight = useKeyboardHeight();
  const [query, setQuery] = useState('');

  const visibleTags = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return normalized ? tags.filter(tag => tag.name.toLowerCase().includes(normalized)) : tags;
  }, [tags, query]);

  function toggle(id) {
    onChange(selectedIds.includes(id) ? selectedIds.filter(selectedId => selectedId !== id) : [...selectedIds, id]);
  }

  function handleClose() {
    setQuery('');
    onClose();
  }

  return <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <Pressable style={[styles.backdrop, { paddingBottom: keyboardHeight }]} onPress={handleClose}>
        <Pressable style={[styles.sheet, { backgroundColor: theme.background }]} onPress={event => event.stopPropagation()}>
          <View style={styles.header}>
            <ThemedText type="smallBold" color={theme.text}>{t('articles.selectTags')}</ThemedText>
            <Pressable onPress={handleClose} hitSlop={8} style={[styles.closeButton, { backgroundColor: theme.accentSoft }]}>
              <SymbolView name={{ ios: 'xmark', android: 'close', web: 'close' }} size={16} tintColor={theme.accent} />
            </Pressable>
          </View>

          <TextInput value={query} onChangeText={setQuery} placeholder={t('articles.searchTags')} placeholderTextColor={theme.textSecondary} style={[styles.search, { borderColor: theme.border, color: theme.text }]} returnKeyType="search" />

          <FlatList data={visibleTags} keyExtractor={tag => tag.id} keyboardShouldPersistTaps="handled" style={styles.list} ListEmptyComponent={<ThemedText type="small" color={theme.textSecondary} style={styles.empty}>{t('articles.noTags')}</ThemedText>} renderItem={({ item }) => {
          const isSelected = selectedIds.includes(item.id);
          return <Pressable onPress={() => toggle(item.id)} style={[styles.row, { borderBottomColor: theme.border }]}>
                <SymbolView name={isSelected ? { ios: 'checkmark.circle.fill', android: 'check_circle', web: 'check_circle' } : { ios: 'circle', android: 'radio_button_unchecked', web: 'radio_button_unchecked' }} size={22} tintColor={isSelected ? theme.accent : theme.border} />
                <ThemedText type="small" color={theme.text} style={styles.rowLabel} numberOfLines={1}>{item.name}</ThemedText>
                <ThemedText type="caption" color={theme.textSecondary}>{item.count}</ThemedText>
              </Pressable>;
        }} />

          <View style={styles.footer}>
            <Pressable onPress={() => onChange([])} disabled={selectedIds.length === 0} style={[styles.footerButton, { borderColor: theme.border, opacity: selectedIds.length === 0 ? 0.5 : 1 }]}>
              <ThemedText type="smallBold" color={theme.text}>{t('articles.clear')}</ThemedText>
            </Pressable>
            <Pressable onPress={handleClose} style={[styles.footerButton, styles.doneButton, { backgroundColor: theme.accent, borderColor: theme.accent }]}>
              <ThemedText type="smallBold" color="#ffffff">{t('articles.done')}</ThemedText>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>;
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end'
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: Spacing.four,
    paddingBottom: Spacing.five,
    gap: Spacing.three,
    height: '75%'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center'
  },
  search: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 16
  },
  list: {
    flex: 1
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.two,
    borderBottomWidth: 1
  },
  rowLabel: {
    flex: 1
  },
  empty: {
    textAlign: 'center',
    paddingVertical: Spacing.four
  },
  footer: {
    flexDirection: 'row',
    gap: Spacing.two
  },
  footerButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: Spacing.two
  },
  doneButton: {
    flex: 2
  }
});
