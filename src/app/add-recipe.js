import { useMemo, useState } from 'react';
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
import { CATEGORIES } from '@/data/seed/categories';
import { INGREDIENTS } from '@/data/seed/ingredients';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
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

  const [title, setTitle] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const [categoryId, setCategoryId] = useState(CATEGORIES[0].id);
  const [difficulty, setDifficulty] = useState('easy');
  const [ingredientLines, setIngredientLines] = useState([]);
  const [isIngredientModalOpen, setIsIngredientModalOpen] = useState(false);
  const [ingredientQuery, setIngredientQuery] = useState('');

  const filteredIngredients = useMemo(() => {
    const normalized = ingredientQuery.trim().toLowerCase();
    const pool = !normalized ? INGREDIENTS : INGREDIENTS.filter(ingredient => ingredient.name.toLowerCase().includes(normalized));
    return pool.slice(0, 40);
  }, [ingredientQuery]);

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
    setIngredientLines(current => [...current, { ingredientId: ingredient.id, name: ingredient.name, quantity: '100' }]);
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

  function handleSave() {
    if (!canSave) return;
    const id = myRecipesStore.addRecipe({
      title: title.trim(),
      imageUrl: imageUri,
      categoryId,
      servings: DEFAULT_SERVINGS,
      prepTimeMinutes: DEFAULT_PREP_TIME_MINUTES,
      cookTimeMinutes: DEFAULT_COOK_TIME_MINUTES,
      difficulty,
      ingredients: ingredientLines.map(line => ({ ingredientId: line.ingredientId, quantity: Math.max(1, Number(line.quantity) || 1), unit: 'g' })),
      steps: []
    });
    router.replace({ pathname: '/recipes/[id]', params: { id } });
  }

  return <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex1}>
      <LinearGradient colors={[theme.background, theme.primarySoft, theme.accentSoft]} style={styles.flex1}>
      <ScreenScrollView gap={Spacing.four} horizontalPadding={20} contentContainerStyle={styles.scrollContent}>
        <Pressable onPress={handlePickPhoto} style={styles.photoWrapper}>
          <RecipeImage uri={imageUri} style={styles.photo} iconSize={36} />
          <View style={styles.photoEditBadge}>
            <SymbolView name={{ ios: 'camera.fill', android: 'photo_camera', web: 'photo_camera' }} size={15} tintColor="#ffffff" />
          </View>
        </Pressable>

        <TextInput value={title} onChangeText={setTitle} placeholder={t('recipes.recipeTitlePlaceholder')} placeholderTextColor={theme.textSecondary} style={styles.input} />

        <View style={styles.field}>
          <ThemedText type="small" color={theme.textSecondary}>{t('recipes.categoriesLabel')}</ThemedText>
          <View style={styles.chipRow}>
            {CATEGORIES.map(category => {
            const isActive = categoryId === category.id;
            return <Pressable key={category.id} onPress={() => setCategoryId(category.id)} style={[styles.chip, isActive && styles.chipActive]}>
                  <ThemedText type="small" color={isActive ? '#ffffff' : theme.text}>{category.name}</ThemedText>
                </Pressable>;
          })}
          </View>
        </View>

        <View style={styles.field}>
          <ThemedText type="small" color={theme.textSecondary}>{t('recipes.difficultyLabel')}</ThemedText>
          <View style={styles.chipRow}>
            {DIFFICULTIES.map(level => {
            const isActive = difficulty === level;
            return <Pressable key={level} onPress={() => setDifficulty(level)} style={[styles.chip, isActive && styles.chipActive]}>
                  <ThemedText type="small" color={isActive ? '#ffffff' : theme.text}>{t(`recipes.difficulty.${level}`)}</ThemedText>
                </Pressable>;
          })}
          </View>
        </View>

        <View style={styles.field}>
          <View style={styles.sectionHeaderRow}>
            <ThemedText type="smallBold" color={theme.text}>{t('recipes.ingredients')}</ThemedText>
            <Pressable onPress={() => setIsIngredientModalOpen(true)} style={styles.addChip}>
              <SymbolView name={{ ios: 'plus.circle.fill', android: 'add_circle', web: 'add_circle' }} size={16} tintColor={theme.accent} />
              <ThemedText type="small" color={theme.accent} style={styles.addChipText}>{t('common.add')}</ThemedText>
            </Pressable>
          </View>
          {ingredientLines.length === 0 ? <ThemedText type="caption" color={theme.textSecondary} style={styles.emptyIngredientsText}>{t('recipes.noIngredientsYet')}</ThemedText> : <View style={styles.list}>
              {ingredientLines.map((line, index) => <View key={`${line.ingredientId}-${index}`} style={styles.ingredientRow}>
                  <ThemedText type="small" color={theme.text} style={styles.flex1} numberOfLines={1}>{line.name}</ThemedText>
                  <TextInput value={line.quantity} onChangeText={value => handleQuantityChange(index, value)} keyboardType="number-pad" style={styles.quantityInput} />
                  <ThemedText type="caption" color={theme.textSecondary}>g</ThemedText>
                  <Pressable onPress={() => handleRemoveIngredient(index)} hitSlop={8}>
                    <SymbolView name={{ ios: 'xmark.circle.fill', android: 'cancel', web: 'cancel' }} size={18} tintColor={theme.border} />
                  </Pressable>
                </View>)}
            </View>}
        </View>
      </ScreenScrollView>

      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + Spacing.two }]}>
        <Pressable onPress={handleSave} disabled={!canSave} style={[styles.saveButton, !canSave && styles.saveButtonDisabled]}>
          <ThemedText type="default" color={canSave ? theme.accent : theme.textSecondary} style={styles.saveButtonText}>{t('common.save')}</ThemedText>
        </Pressable>
      </View>

      <Modal visible={isIngredientModalOpen} transparent animationType="slide" onRequestClose={() => setIsIngredientModalOpen(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setIsIngredientModalOpen(false)}>
          <Pressable style={styles.modalSheet} onPress={event => event.stopPropagation()}>
            <View style={styles.modalHeader}>
              <ThemedText type="smallBold" color={theme.text}>{t('recipes.addIngredientTitle')}</ThemedText>
              <Pressable onPress={() => setIsIngredientModalOpen(false)} hitSlop={8}>
                <SymbolView name={{ ios: 'xmark', android: 'close', web: 'close' }} size={16} tintColor={theme.accent} />
              </Pressable>
            </View>
            <TextInput value={ingredientQuery} onChangeText={setIngredientQuery} placeholder={t('recipes.searchIngredientsPlaceholder')} placeholderTextColor={theme.textSecondary} style={styles.input} />
            <ScrollView style={styles.ingredientScroll}>
              {filteredIngredients.map(ingredient => <Pressable key={ingredient.id} onPress={() => handleAddIngredient(ingredient)} style={styles.ingredientOption}>
                  <ThemedText type="small" color={theme.text}>{ingredient.name}</ThemedText>
                </Pressable>)}
            </ScrollView>
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
    height: 180,
    borderRadius: 16,
    overflow: 'hidden'
  },
  photo: {
    width: '100%',
    height: '100%'
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
  input: {
    borderColor: theme.border,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 16,
    color: theme.text
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two
  },
  chip: {
    borderColor: theme.border,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    backgroundColor: theme.background
  },
  chipActive: {
    backgroundColor: theme.accent,
    borderColor: theme.accent
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  addChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: theme.background,
    borderWidth: 1.5,
    borderColor: theme.accent,
    borderRadius: 999,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one
  },
  addChipText: {
    fontWeight: '700'
  },
  emptyIngredientsText: {
    opacity: 0.6
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
    borderRadius: 12,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two
  },
  quantityInput: {
    width: 56,
    borderColor: theme.border,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: Spacing.one,
    paddingVertical: 4,
    color: theme.text,
    textAlign: 'center'
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingTop: Spacing.two
  },
  saveButton: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderColor: theme.accent,
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: Spacing.two
  },
  saveButtonDisabled: {
    borderColor: theme.border
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
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: Spacing.four,
    paddingBottom: Spacing.six,
    gap: Spacing.three,
    maxHeight: '80%'
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  ingredientScroll: {
    maxHeight: 320
  },
  ingredientOption: {
    paddingVertical: Spacing.two,
    borderBottomWidth: 1,
    borderBottomColor: theme.border
  }
});
