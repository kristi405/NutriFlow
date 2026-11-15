import { useEffect, useMemo, useRef, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { observer } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Alert, Animated, Easing, KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import IngredientPicker from '@/components/ingredient/ingredient-picker';
import { RecipeImage } from '@/components/ui/recipe-image';
import { ScreenScrollView } from '@/components/ui/screen-scroll-view';
import { getCategories, getCategoryTagId } from '@/data/catalog';
import { formatUnit, parseQuantity } from '@/lib/ingredientUnits';
import { createRecipe, uploadImage } from '@/lib/userContent';
import { persistPickedImage } from '@/lib/persistPickedImage';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useKeyboardHeight } from '@/hooks/useKeyboardHeight';

const DEFAULT_SERVINGS = 1;

// Same overshoot-then-settle bump the recipes tab's category circles use
// when one becomes selected (see (tabs)/recipes/index.js's PulseItem) — a
// gentler scale here since this wraps a full-width grid tile, not a small
// circular icon.
function PulseTile({ active, style, children }) {
  const scale = useRef(new Animated.Value(1)).current;
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (!active) return;
    Animated.sequence([Animated.timing(scale, { toValue: 1.06, duration: 140, easing: Easing.out(Easing.quad), useNativeDriver: true }), Animated.spring(scale, { toValue: 1, friction: 4, tension: 140, useNativeDriver: true })]).start();
  }, [active]);
  return <Animated.View style={[style, { transform: [{ scale }] }]}>{children}</Animated.View>;
}

function AddRecipeScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const insets = useSafeAreaInsets();
  const keyboardHeight = useKeyboardHeight();
  const scrollRef = useRef(null);

  const categories = getCategories();
  const [title, setTitle] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const [categoryId, setCategoryId] = useState(categories[0]?.id);
  const [ingredientLines, setIngredientLines] = useState([]);
  const [isIngredientModalOpen, setIsIngredientModalOpen] = useState(false);
  const [editingQuantityIndex, setEditingQuantityIndex] = useState(null);
  const [editingQuantityValue, setEditingQuantityValue] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  async function handleTakePhoto() {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(t('common.errorTitle'), t('common.errorDefault'));
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [4, 3], quality: 0.7 });
    if (!result.canceled && result.assets[0]) setImageUri(persistPickedImage(result.assets[0].uri, 'recipe-photo'));
  }

  async function handleChooseFromLibrary() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(t('common.errorTitle'), t('common.errorDefault'));
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [4, 3], quality: 0.7 });
    if (!result.canceled && result.assets[0]) setImageUri(persistPickedImage(result.assets[0].uri, 'recipe-photo'));
  }

  function handlePickPhoto() {
    Alert.alert(t('recipes.addPhotoTitle'), undefined, [{ text: t('recipes.takePhoto'), onPress: handleTakePhoto }, { text: t('recipes.chooseFromLibrary'), onPress: handleChooseFromLibrary }, { text: t('common.cancel'), style: 'cancel' }]);
  }

  function handlePickIngredient({ ingredient, quantity, unit }) {
    setIngredientLines(current => [...current, { ingredientId: ingredient.id, name: ingredient.name, unit, quantity }]);
  }

  function handleRemoveIngredient(index) {
    setIngredientLines(current => current.filter((_, i) => i !== index));
  }

  function handleQuantityChange(index, value) {
    setIngredientLines(current => current.map((line, i) => i === index ? { ...line, quantity: value } : line));
  }

  function handleOpenQuantityEditor(index) {
    setEditingQuantityIndex(index);
    setEditingQuantityValue(ingredientLines[index].quantity);
  }

  function handleConfirmQuantityEdit() {
    if (editingQuantityIndex === null) return;
    handleQuantityChange(editingQuantityIndex, editingQuantityValue);
    setEditingQuantityIndex(null);
  }

  const canSave = title.trim().length > 0 && ingredientLines.length > 0;
  // Errors only appear once the user has tried to save, and clear as they're fixed.
  const [showValidation, setShowValidation] = useState(false);
  const showTitleError = showValidation && title.trim().length === 0;
  const showIngredientsError = showValidation && ingredientLines.length === 0;

  async function handleSave() {
    if (isSaving) return;
    if (!canSave) {
      setShowValidation(true);
      // The title sits at the top of the form, the ingredients at the bottom.
      if (title.trim().length === 0) scrollRef.current?.scrollTo({ y: 0, animated: true });
      else scrollRef.current?.scrollToEnd({ animated: true });
      return;
    }
    // Own recipes are stored on the server now (POST /app/recipes) — it
    // validates the composition and computes КБЖУ; the response lands in the
    // local catalog cache, so the recipe screen can open it right away.
    setIsSaving(true);
    try {
      const imageFilename = imageUri ? await uploadImage(imageUri) : undefined;
      const categoryTagId = getCategoryTagId(categoryId);
      const raw = await createRecipe({
        title,
        servings: DEFAULT_SERVINGS,
        tagIds: categoryTagId ? [categoryTagId] : [],
        imageFilename,
        ingredients: ingredientLines.map(line => ({ ingredientId: line.ingredientId, quantity: parseQuantity(line.quantity), unit: line.unit }))
      });
      router.replace({ pathname: '/recipes/[id]', params: { id: raw.id } });
    } catch (error) {
      Alert.alert(t('userContent.saveFailedTitle'), error.status === 0 ? t('userContent.offline') : error.message);
    } finally {
      setIsSaving(false);
    }
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
          <TextInput selectionColor="#1B5E20" value={title} onChangeText={setTitle} placeholder={t('recipes.recipeTitlePlaceholder')} placeholderTextColor={theme.textSecondary + '80'} style={[styles.titleInput, showTitleError && styles.inputError]} />
          {showTitleError && <ThemedText type="caption" color={theme.error}>{t('recipes.titleRequired')}</ThemedText>}
        </View>

        <View style={styles.field}>
          <ThemedText type="small" color={theme.textSecondary}>{t('recipes.categoriesLabel')}</ThemedText>
          <View style={styles.optionGrid}>
            {categories.map(category => {
            const isActive = categoryId === category.id;
            return <Pressable key={category.id} onPress={() => setCategoryId(category.id)} style={styles.optionTileWrapper}>
                  <PulseTile active={isActive} style={[styles.optionTile, isActive && styles.optionTileActive]}>
                    <ThemedText type="smallBold" color={isActive ? theme.accent : theme.text} numberOfLines={2} style={styles.optionLabel}>{category.name}</ThemedText>
                    {isActive && <SymbolView name={{ ios: 'checkmark.circle.fill', android: 'check_circle', web: 'check_circle' }} size={16} tintColor={theme.accent} />}
                  </PulseTile>
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
              {ingredientLines.map((line, index) => <View key={`${line.ingredientId}-${index}`} style={styles.ingredientRow}>
                  <ThemedText type="smallBold" color={theme.text} style={styles.flex1} numberOfLines={1}>{line.name}</ThemedText>
                  <Pressable onPress={() => handleOpenQuantityEditor(index)} style={styles.quantityBox}>
                    <ThemedText type="smallBold" color={theme.text}>{line.quantity}</ThemedText>
                    <ThemedText type="caption" color={theme.textSecondary}>{formatUnit(t, line.unit)}</ThemedText>
                  </Pressable>
                  <Pressable onPress={() => handleRemoveIngredient(index)} hitSlop={8}>
                    <SymbolView name={{ ios: 'xmark.circle.fill', android: 'cancel', web: 'cancel' }} size={20} tintColor={theme.border} />
                  </Pressable>
                </View>)}
            </View>}
        </View>
      </ScreenScrollView>

      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + Spacing.two }]}>
        <Pressable onPress={handleSave} disabled={isSaving} style={[styles.saveButton, canSave ? styles.saveButtonActive : styles.saveButtonDisabled]}>
          {isSaving ? <ActivityIndicator color="#ffffff" /> : <ThemedText type="default" color={canSave ? '#ffffff' : theme.textSecondary} style={styles.saveButtonText}>{t('common.save')}</ThemedText>}
        </Pressable>
      </View>

      <IngredientPicker visible={isIngredientModalOpen} onClose={() => setIsIngredientModalOpen(false)} onPick={handlePickIngredient} excludeIds={ingredientLines.map(line => line.ingredientId)} />

      <Modal visible={editingQuantityIndex !== null} transparent animationType="fade" onRequestClose={() => setEditingQuantityIndex(null)}>
        <Pressable style={styles.amountBackdrop} onPress={() => setEditingQuantityIndex(null)}>
          <Pressable style={[styles.amountCard, { backgroundColor: theme.background }]} onPress={event => event.stopPropagation()}>
            <ThemedText type="smallBold" color={theme.text} numberOfLines={1}>{editingQuantityIndex !== null ? ingredientLines[editingQuantityIndex]?.name : ''}</ThemedText>
            <View style={styles.amountQuantityBox}>
              <TextInput selectionColor="#1B5E20" value={editingQuantityValue} onChangeText={setEditingQuantityValue} keyboardType="decimal-pad" autoFocus style={styles.amountQuantityInput} />
              <ThemedText type="smallBold" color={theme.textSecondary}>{editingQuantityIndex !== null ? formatUnit(t, ingredientLines[editingQuantityIndex]?.unit) : ''}</ThemedText>
            </View>
            <View style={styles.amountActions}>
              <Pressable onPress={() => setEditingQuantityIndex(null)} style={styles.amountCancel}>
                <ThemedText type="smallBold" color={theme.textSecondary}>{t('common.cancel')}</ThemedText>
              </Pressable>
              <Pressable onPress={handleConfirmQuantityEdit} style={styles.amountConfirm}>
                <ThemedText type="smallBold" color="#ffffff">{t('common.save')}</ThemedText>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
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
  optionTileWrapper: {
    width: '48.5%'
  },
  optionTile: {
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
    backgroundColor: theme.backgroundSelected,
    borderColor: theme.border,
    borderWidth: 1.5
  },
  saveButtonText: {
    fontWeight: '700'
  },
  // Opaque, not a dimmed overlay — the sheet is now full screen (flex: 1
  // below), so there's no "behind" content left to dim. A translucent
  // backdrop here only ever showed up as a flash of the screen behind
  // bleeding through during the keyboard's show/hide animation, while the
  // sheet and the native keyboard frame were still catching up to each other.
  modalBackdrop: {
    flex: 1,
    backgroundColor: theme.background,
    justifyContent: 'flex-end'
  },
  modalSheet: {
    backgroundColor: theme.background,
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.six,
    gap: Spacing.three,
    flex: 1
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
    flex: 1
  },
  ingredientOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.four,
    borderBottomWidth: 1,
    borderBottomColor: theme.border
  },
  ingredientOptionImage: {
    width: 48,
    height: 48,
    borderRadius: 12
  },
  ingredientAddIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.accentSoft,
    alignItems: 'center',
    justifyContent: 'center'
  },
  amountBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.five
  },
  amountCard: {
    width: '100%',
    maxWidth: 320,
    borderRadius: 24,
    padding: Spacing.four,
    gap: Spacing.three
  },
  amountHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three
  },
  amountQuantityBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    backgroundColor: theme.accentSoft,
    borderRadius: 14,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three
  },
  amountQuantityInput: {
    flex: 1,
    color: theme.text,
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 20,
    paddingVertical: Spacing.two
  },
  amountActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: Spacing.two
  },
  amountCancel: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two
  },
  amountConfirm: {
    backgroundColor: theme.accent,
    borderRadius: 14,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two
  }
});
