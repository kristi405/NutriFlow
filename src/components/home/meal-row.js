import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Colors, Spacing } from '@/constants/theme';
const theme = Colors.light;
export function MealRow({
  recipeId,
  mealType,
  title,
  imageUrl,
  calories
}) {
  const { t } = useTranslation();
  const mealTypeLabel = t(`mealTypes.${mealType}`, { defaultValue: mealType });
  return <Link href={{
    pathname: '/recipes/[id]',
    params: {
      id: recipeId
    }
  }} asChild>
      <Pressable style={({
      pressed
    }) => [styles.row, {
      backgroundColor: theme.background,
      borderColor: theme.border
    }, pressed && styles.pressed]}>
        <Image source={{
        uri: imageUrl
      }} style={styles.image} contentFit="cover" />
        <View style={styles.textWrapper}>
          <ThemedText type="caption" color={theme.textSecondary}>
            {mealTypeLabel}
          </ThemedText>
          <ThemedText type="smallBold" color={theme.text} numberOfLines={1}>
            {title}
          </ThemedText>
        </View>
        <ThemedText type="small" color={theme.textSecondary}>
          {Math.round(calories)} {t('common.kcal')}
        </ThemedText>
      </Pressable>
    </Link>;
}
const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.two,
    borderRadius: 16,
    borderWidth: 1
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
