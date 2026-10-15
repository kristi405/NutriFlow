import { Link } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import { AllergenWarning } from '@/components/allergen-warning';
import { ThemedText } from '@/components/themed-text';
import { RecipeImage } from '@/components/ui/recipe-image';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
export function MealRow({
  recipeId,
  planItemId,
  mealType,
  title,
  imageUrl,
  calories,
  servings,
  isEaten,
  onToggleEaten,
  allergens
}) {
  const { t } = useTranslation();
  const theme = useTheme();
  const mealTypeLabel = t(`mealTypes.${mealType}`, { defaultValue: mealType });
  const params = { id: recipeId };
  if (servings !== undefined) params.servings = String(servings);
  // Lets the recipe screen save ingredient removals/swaps back onto this exact
  // plan entry, instead of just reading its serving size.
  if (planItemId !== undefined) params.planItemId = planItemId;
  return <Link href={{
    pathname: '/recipes/[id]',
    params
  }} asChild>
      <Pressable style={StyleSheet.flatten([styles.row, {
      backgroundColor: theme.background,
      borderColor: isEaten ? theme.accent : allergens?.length ? theme.error : theme.border
    }])}>
        {({ pressed }) => <View style={[styles.rowInner, pressed && styles.pressed]}>
            {onToggleEaten && <Pressable onPress={onToggleEaten} hitSlop={8}>
                <SymbolView name={isEaten ? { ios: 'checkmark.circle.fill', android: 'check_circle', web: 'check_circle' } : { ios: 'circle', android: 'radio_button_unchecked', web: 'radio_button_unchecked' }} size={24} tintColor={isEaten ? theme.accent : theme.border} />
              </Pressable>}
            <RecipeImage uri={imageUrl} style={styles.image} iconSize={18} />
            <View style={styles.textWrapper}>
              <ThemedText type="caption" color={theme.textSecondary}>
                {mealTypeLabel}
              </ThemedText>
              <ThemedText type="smallBold" color={isEaten ? theme.textSecondary : theme.text} numberOfLines={1}>
                {title}
              </ThemedText>
              <AllergenWarning allergens={allergens} />
            </View>
            <ThemedText type="small" color={theme.textSecondary}>
              {Math.round(calories)} {t('common.kcal')}
            </ThemedText>
          </View>}
      </Pressable>
    </Link>;
}
const styles = StyleSheet.create({
  row: {
    borderRadius: 16,
    borderWidth: 1
  },
  rowInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.two
  },
  image: {
    width: 48,
    height: 48,
    borderRadius: 12
  },
  textWrapper: {
    flex: 1,
    gap: 2
  },
  pressed: {
    opacity: 0.85
  }
});
