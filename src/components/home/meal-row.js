import { Link } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { RecipeImage } from '@/components/ui/recipe-image';
import { Colors, LoginButtonGreen, Spacing } from '@/constants/theme';
const theme = Colors.light;
export function MealRow({
  recipeId,
  mealType,
  title,
  imageUrl,
  calories,
  isEaten,
  onToggleEaten
}) {
  const { t } = useTranslation();
  const mealTypeLabel = t(`mealTypes.${mealType}`, { defaultValue: mealType });
  return <Link href={{
    pathname: '/recipes/[id]',
    params: {
      id: recipeId
    }
  }} asChild>
      <Pressable style={StyleSheet.flatten([styles.row, {
      backgroundColor: theme.background,
      borderColor: isEaten ? LoginButtonGreen : theme.border
    }])}>
        {({ pressed }) => <View style={[styles.rowInner, pressed && styles.pressed]}>
            {onToggleEaten && <Pressable onPress={onToggleEaten} hitSlop={8}>
                <SymbolView name={isEaten ? 'checkmark.circle.fill' : 'circle'} size={24} tintColor={isEaten ? LoginButtonGreen : theme.border} />
              </Pressable>}
            <RecipeImage uri={imageUrl} style={styles.image} iconSize={18} />
            <View style={styles.textWrapper}>
              <ThemedText type="caption" color={theme.textSecondary}>
                {mealTypeLabel}
              </ThemedText>
              <ThemedText type="smallBold" color={isEaten ? theme.textSecondary : theme.text} numberOfLines={1} style={isEaten && styles.strikethrough}>
                {title}
              </ThemedText>
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
  strikethrough: {
    textDecorationLine: 'line-through'
  },
  pressed: {
    opacity: 0.85
  }
});
