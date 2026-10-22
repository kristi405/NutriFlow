import { useMemo, useRef, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { observer } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';
import { Alert, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { RecipeImage } from '@/components/ui/recipe-image';
import { ScreenScrollView } from '@/components/ui/screen-scroll-view';
import { getCategories, getIngredients } from '@/data/catalog';
import { defaultQuantityFor, formatUnit, parseQuantity } from '@/lib/ingredientUnits';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useFocusedRowScroll } from '@/hooks/useFocusedRowScroll';
import { useKeyboardHeight } from '@/hooks/useKeyboardHeight';
import { myRecipesStore } from '@/store/myRecipesStore';

const DIFFICULTIES = ['easy', 'medium', 'hard'];
const DEFAULT_SERVINGS = 1;
const DEFAULT_PREP_TIME_MINUTES = 0;
const DEFAULT_COOK_TIME_MINUTES = 0;

function AddRecipeScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const insets = useSafeAreaInsets();
  const keyboardHeight = useKeyboardHeight();
  const scrollRef = useRef(null);
  const { rowProps, inputProps } = useFocusedRowScroll(scrollRef, keyboardHeight);

  const categories = getCategories();
  const ingredients = getIngredients();
  const [title, setTitle] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const [categoryId, setCategoryId] = useState(categories[0]?.id);
  const [difficulty, setDifficulty] = useState('easy');
  const [ingredientLines, setIngredientLines] = useState([]);
  const [isIngredientModalOpen, setIsIngredientModalOpen] = useState(false);
  const [ingredientQuery, setIngredientQuery] = useState('');

  const filteredIngredients = useMemo(() => {
    const normalized = ingredientQuery.trim().toLowerCase();
    const pool = !normalized ? ingredients : ingredients.filter(ingredient => ingredient.name.toLowerCase().includes(normalized));
    return pool.slice(0, 40);
  }, [ingredientQuery, ingredients]);

  async function handleTakePhoto() {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(t('common.errorTitle'), t('common.errorDefault'));
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [4, 3], quality: 0.7 });
    if (!result.canceled && result.assets[0]) setImageUri(result.assets[0].uri);
  }

  async function handleChooseFromLibrary() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(t('common.errorTitle'), t('common.errorDefault'));
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [4, 3], quality: 0.7 });
    if (!result.canceled && result.assets[0]) setImageUri(result.assets[0].uri);
  }

  function handlePickPhoto() {
    Alert.alert(t('recipes.addPhotoTitle'), undefined, [{ text: t('recipes.takePhoto'), onPress: handleTakePhoto }, { text: t('recipes.chooseFromLibrary'), onPress: handleChooseFromLibrary }, { text: t('common.cancel'), style: 'cancel' }]);
  }

  function handleAddIngredient(ingredient) {
    setIngredientLines(current => [...current, { ingredientId: ingredient.id, name: ingredient.name, unit: ingredient.defaultUnit, quantity: defaultQuantityFor(ingredient.defaultUnit) }]);
    setIsIngredientModalOpen(false);
    setIngredientQuery('');
  }

  function handleRemoveIngredient(index) {
    setIngredientLines(current => current.filter((_, i) => i !== index));
  }

  function handleQuantityChange(index, value) {
    setIngredientLines(current => current.map((line, i) => i === index ? { ...line, quantity: value } : line));
  }

  const canSave = title.trim().length > 0 && ingredientLines.length > 0;
  // Errors only appear once the user has tried to save, and clear as they're fixed.
  const [showValidation, setShowValidation] = useState(false);
  const showTitleError = showValidation && title.trim().length === 0;
  const showIngredientsError = showValidation && ingredientLines.length === 0;

  function handleSave() {
    if (!canSave) {
      setShowValidation(true);
      // The title sits at the top of the form, the ingredients at the bottom.
      if (title.trim().length === 0) scrollRef.current?.scrollTo({ y: 0, animated: true });
      else scrollRef.current?.scrollToEnd({ animated: true });
      return;
    }
    const id = myRecipesStore.addRecipe({
      title: title.trim(),
      imageUrl: imageUri,
      categoryId,
      servings: DEFAULT_SERVINGS,
      prepTimeMinutes: DEFAULT_PREP_TIME_MINUTES,
      cookTimeMinutes: DEFAULT_COOK_TIME_MINUTES,
      difficulty,
      ingredients: ingredientLines.map(line => ({ ingredientId: line.ingredientId, quantity: parseQuantity(line.quantity), unit: line.unit })),
      steps: []
    });
    router.replace({ pathname: '/recipes/[id]', params: { id } });
  }

  // iOS gets its keyboard-clearing room from ScreenScrollView's own
  // automaticallyAdjustKeyboardInsets below — a native, frame-synced inset
  // that tracks the keyboard's real animation curve, instead of this view's
  // own "padding" behavior stacking an extra, non-synced shift on top.
  // Android still has no native equivalent, so it keeps the manual paddingBottom.
  return <KeyboardAvoidingView behavior={undefined} style={[styles.flex1, Platform.OS === 'android' && { paddingBottom: keyboardHeight }]}>
      <LinearGradient colors={[theme.background, theme.primarySoft, theme.accentSoft]} style={styles.flex1}>
      <ScreenScrollView ref={scrollRef} gap={Spacing.four} horizontalPadding={20} automaticallyAdjustKeyboardInsets contentInsetAdjustmentBehavior="automatic" contentContainerStyle={[styles.scrollContent, {
      // This padding is only for clearing safe-area/home-indicator space when
      // there's no keyboard. With the keyboard up, automaticallyAdjustKeyboardInsets
      // already adds its own native inset — stacking this on top of that left a
      // visible gap of empty space above the keyboard.
      paddingBottom: Platform.OS === 'android' ? Spacing.six + keyboardHeight : keyboardHeight > 0 ? 0 : Spacing.six
    }]} keyboardShouldPersistTaps="handled">
        <Pressable onPress={handlePickPhoto} style={[styles.photoWrapper, !imageUri && styles.photoEmpty]}>
          {imageUri ? <RecipeImage uri={imageUri} style={styles.photo} iconSize={36} /> : <View style={styles.photoPlaceholder}>
              <View style={styles.photoPlaceholderIcon}>
                <SymbolView name={{ ios: 'camera.fill', android: 'photo_camera', web: 'photo_camera' }} size={22} tintColor={theme.accent} />
              </View>
              <ThemedText type="smallBold" color={theme.accent}>{t('recipes.addPhotoTitle')}</ThemedText>
            </View>}
          <View style={styles.photoEditBadge}>
            <SymbolView name={{ ios: imageUri ? 'pencil' : 'plus', android: imageUri ? 'edit' : 'add', web: imageUri ? 'edit' : 'add' }} size={15} tintColor="#ffffff" />
          </View>
        </Pressable>

        <View style={styles.field}>
          <ThemedText type="small" color={theme.textSecondary}>{t('recipes.recipeTitle')}</ThemedText>
          <TextInput value={title} onChangeText={setTitle} placeholder={t('recipes.recipeTitlePlaceholder')} placeholderTextColor={theme.textSecondary} style={[styles.titleInput, showTitleError && styles.inputError]} />
          {showTitleError && <ThemedText type="caption" color={theme.error}>{t('recipes.titleRequired')}</ThemedText>}
        </View>

        <View style={styles.field}>
          <ThemedText type="small" color={theme.textSecondary}>{t('recipes.categoriesLabel')}</ThemedText>
          <View style={styles.optionGrid}>
            {categories.map(category => {
            const isActive = categoryId === category.id;
            return <Pressable key={category.id} onPress={() => setCategoryId(category.id)} style={[styles.optionTile, isActive && styles.optionTileActive]}>
                  <ThemedText type="smallBold" color={isActive ? theme.accent : theme.text} numberOfLines={2} style={styles.optionLabel}>{category.name}</ThemedText>
                  {isActive && <SymbolView name={{ ios: 'checkmark.circle.fill', android: 'check_circle', web: 'check_circle' }} size={16} tintColor={theme.accent} />}
                </Pressable>;
          })}
          </View>
        </View>

        <View style={styles.field}>
          <ThemedText type="small" color={theme.textSecondary}>{t('recipes.difficultyLabel')}</ThemedText>
          <View style={styles.segmented}>
            {DIFFICULTIES.map(level => {
            const isActive = difficulty === level;
            return <Pressable key={level} onPress={() => setDifficulty(level)} style={[styles.segment, isActive && styles.segmentActive]}>
                  <ThemedText type="smallBold" color={isActive ? '#ffffff' : theme.text}>{t(`recipes.difficulty.${level}`)}</ThemedText>
                </Pressable>;
          })}
          </View>
        </View>

        <View style={styles.field}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionTitleRow}>
              <ThemedText type="smallBold" color={theme.text}>{t('recipes.ingredients')}</ThemedText>
              {ingredientLines.length > 0 && <View style={styles.countBadge}>
                  <ThemedText type="caption" color={theme.accent} style={styles.countText}>{ingredientLines.length}</ThemedText>
                </View>}
            </View>
            <Pressable onPress={() => setIsIngredientModalOpen(true)} style={styles.addChip}>
              <SymbolView name={{ ios: 'plus', android: 'add', web: 'add' }} size={14} tintColor="#ffffff" />
              <ThemedText type="small" color="#ffffff" style={styles.addChipText}>{t('common.add')}</ThemedText>
            </Pressable>
          </View>
          {ingredientLines.length === 0 ? <Pressable onPress={() => setIsIngredientModalOpen(true)} style={[styles.emptyIngredientsBox, showIngredientsError && styles.emptyIngredientsBoxError]}>
              <SymbolView name={{ ios: 'leaf', android: 'eco', web: 'eco' }} size={20} tintColor={showIngredientsError ? theme.error : theme.textSecondary} />
              <ThemedText type="caption" color={showIngredientsError ? theme.error : theme.textSecondary} style={styles.emptyIngredientsText}>{showIngredientsError ? t('recipes.ingredientsRequired') : t('recipes.noIngredientsYet')}</ThemedText>
            </Pressable> : <View style={styles.list}>
              {ingredientLines.map((line, index) => <View key={`${line.ingredientId}-${index}`} {...rowProps(index)} style={styles.ingredientRow}>
                  <ThemedText type="smallBold" color={theme.text} style={styles.flex1} numberOfLines={1}>{line.name}</ThemedText>
                  <View style={styles.quantityBox}>
                    <TextInput value={line.quantity} onChangeText={value => handleQuantityChange(index, value)} keyboardType="decimal-pad" {...inputProps(index)} style={styles.quantityInput} />
                    <ThemedText type="caption" color={theme.textSecondary}>{formatUnit(t, line.unit)}</ThemedText>
                  </View>
                  <Pressable onPress={() => handleRemoveIngredient(index)} hitSlop={8}>
                    <SymbolView name={{ ios: 'xmark.circle.fill', android: 'cancel', web: 'cancel' }} size={20} tintColor={theme.border} />
                  </Pressable>
                </View>)}
            </View>}
        </View>
      </ScreenScrollView>

      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + Spacing.two }]}>
        <Pressable onPress={handleSave} style={[styles.saveButton, canSave ? styles.saveButtonActive : styles.saveButtonDisabled]}>
          <ThemedText type="default" color={canSave ? '#ffffff' : theme.textSecondary} style={styles.saveButtonText}>{t('common.save')}</ThemedText>
        </Pressable>
      </View>

      <Modal visible={isIngredientModalOpen} transparent animationType="slide" onRequestClose={() => setIsIngredientModalOpen(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex1}>
        <Pressable style={[styles.modalBackdrop, Platform.OS === 'android' && { paddingBottom: keyboardHeight }]} onPress={() => setIsIngredientModalOpen(false)}>
          <Pressable style={[styles.modalSheet, keyboardHeight > 0 && styles.modalSheetKeyboardOpen]} onPress={event => event.stopPropagation()}>
            <View style={styles.modalGrabber} />
            <View style={styles.modalHeader}>
              <ThemedText type="smallBold" color={theme.text}>{t('recipes.addIngredientTitle')}</ThemedText>
              <Pressable onPress={() => setIsIngredientModalOpen(false)} hitSlop={8} style={styles.modalCloseButton}>
                <SymbolView name={{ ios: 'xmark', android: 'close', web: 'close' }} size={14} tintColor={theme.textSecondary} />
              </Pressable>
            </View>
            <View style={styles.searchBox}>
              <SymbolView name={{ ios: 'magnifyingglass', android: 'search', web: 'search' }} size={16} tintColor={theme.textSecondary} />
              <TextInput value={ingredientQuery} onChangeText={setIngredientQuery} placeholder={t('recipes.searchIngredientsPlaceholder')} placeholderTextColor={theme.textSecondary} style={styles.searchInput} autoCorrect={false} />
            </View>
            <ScrollView style={styles.ingredientScroll} keyboardShouldPersistTaps="handled">
              {filteredIngredients.map(ingredient => <Pressable key={ingredient.id} onPress={() => handleAddIngredient(ingredient)} style={styles.ingredientOption}>
                  <ThemedText type="small" color={theme.text} style={styles.flex1} numberOfLines={1}>{ingredient.name}</ThemedText>
                  <View style={styles.ingredientAddIcon}>
                    <SymbolView name={{ ios: 'plus', android: 'add', web: 'add' }} size={12} tintColor={theme.accent} />
                  </View>
                </Pressable>)}
            </ScrollView>
          </Pressable>
        </Pressable>
        </KeyboardAvoidingView>
      </Modal>
      </LinearGradient>
    </KeyboardAvoidingView>;
}

export default observer(AddRecipeScreen);

const createStyles = theme => StyleSheet.create({
  flex1: {
    flex: 1
  },
  scrollContent: {
    paddingTop: Spacing.half,
    paddingBottom: Spacing.six
  },
  field: {
    gap: Spacing.two
  },
  photoWrapper: {
    width: '100%',
    height: 190,
    borderRadius: 20,
    overflow: 'hidden'
  },
  photoEmpty: {
    backgroundColor: theme.background,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: theme.accent
  },
  photo: {
    width: '100%',
    height: '100%'
  },
  photoPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two
  },
  photoPlaceholderIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: theme.accentSoft,
    alignItems: 'center',
    justifyContent: 'center'
  },
  photoEditBadge: {
    position: 'absolute',
    bottom: Spacing.two,
    right: Spacing.two,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.accent,
    borderWidth: 2,
    borderColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center'
  },
  titleInput: {
    backgroundColor: theme.background,
    borderColor: theme.border,
    borderWidth: 1.5,
    borderRadius: 16,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    fontSize: 17,
    fontWeight: '600',
    color: theme.text
  },
  inputError: {
    borderColor: theme.error
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
  segmented: {
    flexDirection: 'row',
    backgroundColor: theme.background,
    borderColor: theme.border,
    borderWidth: 1.5,
    borderRadius: 16,
    padding: 4,
    gap: 4
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: Spacing.two
  },
  segmentActive: {
    backgroundColor: theme.accent
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two
  },
  countBadge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: theme.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6
  },
  countText: {
    fontWeight: '700'
  },
  addChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: theme.accent,
    borderRadius: 999,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one + 2,
    shadowColor: theme.accent,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 3
  },
  addChipText: {
    fontWeight: '700'
  },
  emptyIngredientsBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: theme.border,
    borderRadius: 16,
    paddingVertical: Spacing.four,
    paddingHorizontal: Spacing.three
  },
  emptyIngredientsBoxError: {
    borderColor: theme.error
  },
  emptyIngredientsText: {
    flexShrink: 1
  },
  list: {
    gap: Spacing.two
  },
  flex1: {
    flex: 1
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    backgroundColor: theme.background,
    borderColor: theme.border,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two + 2
  },
  quantityBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.accentSoft,
    borderRadius: 10,
    paddingHorizontal: Spacing.two,
    paddingVertical: 4
  },
  quantityInput: {
    minWidth: 40,
    color: theme.text,
    textAlign: 'center',
    fontWeight: '600',
    paddingVertical: 0
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingTop: Spacing.two
  },
  saveButton: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    paddingVertical: Spacing.two + 2
  },
  saveButtonActive: {
    backgroundColor: theme.accent,
    shadowColor: theme.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4
  },
  saveButtonDisabled: {
    backgroundColor: theme.background,
    borderColor: theme.border,
    borderWidth: 1
  },
  saveButtonText: {
    fontWeight: '700'
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end'
  },
  modalSheet: {
    backgroundColor: theme.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.six,
    gap: Spacing.three,
    maxHeight: '80%'
  },
  // With the keyboard up, KeyboardAvoidingView already shifts the sheet to sit
  // right above it — the sheet's own resting-state bottom padding would then
  // show up as a gap of empty space between the list and the keyboard.
  modalSheetKeyboardOpen: {
    paddingBottom: Spacing.two
  },
  modalGrabber: {
    alignSelf: 'center',
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: theme.border
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  modalCloseButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.accentSoft,
    alignItems: 'center',
    justifyContent: 'center'
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    backgroundColor: theme.background,
    borderColor: theme.border,
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    lineHeight: 20,
    color: theme.text,
    paddingVertical: 2
  },
  ingredientScroll: {
    maxHeight: 340,
    flexShrink: 1
  },
  ingredientOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.three,
    borderBottomWidth: 1,
    borderBottomColor: theme.border
  },
  ingredientAddIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.accentSoft,
    alignItems: 'center',
    justifyContent: 'center'
  }
});
