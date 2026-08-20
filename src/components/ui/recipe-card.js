import { ThemedText } from '@/components/themed-text';
import { Colors, Spacing } from '@/constants/theme';
import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
const theme = Colors.light;
export function RecipeCard({
  recipe,
  calories,
  style
}) {
  const { t } = useTranslation();
  const totalTime = recipe.prepTimeMinutes + recipe.cookTimeMinutes;
  return <Link href={{
    pathname: '/recipes/[id]',
    params: {
      id: recipe.id
    }
  }} asChild>
      <Pressable style={({
      pressed
    }) => [styles.card, style, pressed && styles.pressed]}>
        <Image source={{
        uri: recipe.imageUrl
      }} style={styles.image} contentFit="cover" transition={150} />
        <View style={styles.body}>
          <ThemedText type="caption" color={theme.text} style={styles.title} numberOfLines={2}>
            {recipe.title}
          </ThemedText>
          <View style={styles.metaRow}>
            <ThemedText type="caption" color={theme.textSecondary}>
              {totalTime} {t('common.min')}
            </ThemedText>
            {calories !== undefined && <>
                <View style={[styles.dot, {
              backgroundColor: theme.textSecondary
            }]} />
                <ThemedText type="caption" color={theme.textSecondary}>
                  {Math.round(calories)} {t('common.kcal')}
                </ThemedText>
              </>}
          </View>
        </View>
      </Pressable>
    </Link>;
}
const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.background,
    borderColor: theme.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: Spacing.two,
    gap: Spacing.two
  },
  image: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 10
  },
  body: {
    gap: 3
  },
  title: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700'
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 2
  },
  pressed: {
    opacity: 0.85
  }
});
