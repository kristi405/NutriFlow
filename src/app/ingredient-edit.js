import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import { observer } from 'mobx-react-lite';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform } from 'react-native';
import IngredientForm from '@/components/ingredient/ingredient-form';
import { EmptyState } from '@/components/ui/empty-state';
import { ScreenScrollView } from '@/components/ui/screen-scroll-view';
import { Spacing } from '@/constants/theme';
import { getIngredientById } from '@/data/catalog';
import { useKeyboardHeight } from '@/hooks/useKeyboardHeight';

/** Create (no `id`) or edit (`id`) one of the user's own ingredients. */
function IngredientEditScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const keyboardHeight = useKeyboardHeight();
  const { id } = useLocalSearchParams();
  const ingredient = id ? getIngredientById(id) : undefined;

  useEffect(() => {
    navigation.setOptions({ headerTitle: id ? t('userContent.editIngredient') : t('userContent.newIngredient') });
  }, [navigation, id, t]);

  if (id && !ingredient?.isEditable) {
    return <ScreenScrollView>
        <EmptyState icon={{ ios: 'leaf', android: 'eco', web: 'eco' }} title={t('common.errorTitle')} message={t('common.errorDefault')} actionLabel={t('common.back')} onAction={() => router.back()} />
      </ScreenScrollView>;
  }

  return <ScreenScrollView horizontalPadding={20} automaticallyAdjustKeyboardInsets keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingTop: Spacing.three, paddingBottom: Platform.OS === 'android' ? Spacing.six + keyboardHeight : Spacing.six }}>
      <IngredientForm ingredient={ingredient} onSaved={() => router.back()} />
    </ScreenScrollView>;
}

export default observer(IngredientEditScreen);
