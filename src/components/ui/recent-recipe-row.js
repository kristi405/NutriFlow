import { useMemo } from 'react';
import { Link } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { RecipeImage } from '@/components/ui/recipe-image';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
export function RecentRecipeRow({ recipe, calories, style }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  return <Link href={{
    pathname: '/recipes/[id]',
    params: {
      id: recipe.id
    }
  }} asChild>
      <Pressable style={StyleSheet.flatten([styles.row, style])}>
        {({ pressed }) => <View style={[styles.rowInner, pressed && styles.pressed]}>
            <RecipeImage uri={recipe.imageUrl} style={styles.image} iconSize={16} />
            <View style={styles.textWrapper}>
              <ThemedText type="smallBold" color={theme.text} numberOfLines={1}>
                {recipe.title}
              </ThemedText>
              {calories !== undefined && <ThemedText type="caption" color={theme.textSecondary}>
                  {Math.round(calories)} {t('common.kcal')}
                </ThemedText>}
            </View>
            <SymbolView name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }} size={14} tintColor={theme.textSecondary} />
          </View>}
      </Pressable>
    </Link>;
}
const createStyles = theme => StyleSheet.create({
  row: {
    backgroundColor: theme.background,
    borderColor: theme.border,
    borderWidth: 1,
    borderRadius: 14
  },
  rowInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    padding: Spacing.two
  },
  image: {
    width: 44,
    height: 44,
    borderRadius: 10
  },
  textWrapper: {
    flex: 1,
    minWidth: 0,
    gap: 2
  },
  pressed: {
    opacity: 0.85
  }
});
