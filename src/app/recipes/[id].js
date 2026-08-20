import { ThemedText } from '@/components/themed-text';
import { EmptyState } from '@/components/ui/empty-state';
import { ScreenScrollView } from '@/components/ui/screen-scroll-view';
import { SectionHeader } from '@/components/ui/section-header';
import { Colors, Spacing } from '@/constants/theme';
import { getIngredientById } from '@/data/seed/ingredients';
import { getRecipeById } from '@/data/seed/recipes';
import { calculateRecipeNutrition } from '@/lib/nutrition';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

const theme = Colors.light;

const STATS = [
  { key: 'calories', labelKey: 'recipes.calories' },
  { key: 'protein', labelKey: 'home.protein' },
  { key: 'carbs', labelKey: 'home.carbs' },
  { key: 'fat', labelKey: 'home.fat' }
];

export default function RecipeDetailScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams();
  const recipe = getRecipeById(id);

  const nutrition = useMemo(() => recipe ? calculateRecipeNutrition(recipe, getIngredientById).nutrition : undefined, [recipe]);

  if (!recipe) {
    return <ScreenScrollView>
        <EmptyState icon={{
        ios: 'fork.knife',
        android: 'restaurant_menu',
        web: 'restaurant_menu'
      }} title={t('common.errorTitle')} message={t('common.errorDefault')} actionLabel={t('common.back')} onAction={() => router.back()} />
      </ScreenScrollView>;
  }

  const totalTime = recipe.prepTimeMinutes + recipe.cookTimeMinutes;

  return <ScreenScrollView gap={Spacing.four}>
      <Pressable onPress={() => router.back()} hitSlop={8} style={styles.backButton}>
        <SymbolView name="chevron.left" size={16} tintColor={theme.text} />
        <ThemedText type="small" color={theme.text}>{t('common.back')}</ThemedText>
      </Pressable>

      <Image source={{
      uri: recipe.imageUrl
    }} style={styles.image} contentFit="cover" transition={150} />

      <View style={styles.header}>
        <ThemedText type="title" style={styles.title} color={theme.text}>
          {recipe.title}
        </ThemedText>
        <ThemedText type="default" color={theme.textSecondary}>
          {recipe.description}
        </ThemedText>
      </View>

      <View style={styles.metaRow}>
        <MetaItem icon="clock" label={`${totalTime} ${t('common.min')}`} />
        <MetaItem icon="person.2.fill" label={`${recipe.servings} ${t('recipes.servings')}`} />
        <MetaItem icon="chart.bar.fill" label={t(`recipes.difficulty.${recipe.difficulty}`, { defaultValue: recipe.difficulty })} />
      </View>

      {nutrition && <View style={styles.statsCard}>
          {STATS.map(stat => <View key={stat.key} style={styles.statItem}>
              <ThemedText type="smallBold" color={theme.text}>
                {Math.round(nutrition[stat.key])}
              </ThemedText>
              <ThemedText type="caption" color={theme.textSecondary}>
                {t(stat.labelKey)}
              </ThemedText>
            </View>)}
        </View>}

      <View style={styles.section}>
        <SectionHeader title={t('recipes.ingredients')} />
        <View style={styles.list}>
          {recipe.ingredients.map(line => {
          const ingredient = getIngredientById(line.ingredientId);
          return <View key={line.ingredientId} style={styles.listRow}>
                <ThemedText type="small" color={theme.text}>{ingredient?.name ?? line.ingredientId}</ThemedText>
                <ThemedText type="small" color={theme.textSecondary}>
                  {line.quantity} {line.unit}
                </ThemedText>
              </View>;
        })}
        </View>
      </View>

      <View style={styles.section}>
        <SectionHeader title={t('recipes.steps')} />
        <View style={styles.list}>
          {recipe.steps.map(step => <View key={step.order} style={styles.stepRow}>
              <View style={styles.stepNumber}>
                <ThemedText type="caption" color="#ffffff">{step.order}</ThemedText>
              </View>
              <ThemedText type="small" color={theme.text} style={styles.stepText}>
                {step.instruction}
              </ThemedText>
            </View>)}
        </View>
      </View>
    </ScreenScrollView>;
}

function MetaItem({ icon, label }) {
  return <View style={styles.metaItem}>
      <SymbolView name={icon} size={14} tintColor={theme.textSecondary} />
      <ThemedText type="small" color={theme.textSecondary}>{label}</ThemedText>
    </View>;
}

const styles = StyleSheet.create({
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  image: {
    width: '100%',
    aspectRatio: 4 / 3,
    borderRadius: 20
  },
  header: {
    gap: Spacing.half
  },
  title: {
    fontSize: 28,
    lineHeight: 34
  },
  metaRow: {
    flexDirection: 'row',
    gap: Spacing.four
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: theme.background,
    borderColor: theme.border,
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: Spacing.three
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 2
  },
  section: {
    gap: Spacing.three
  },
  list: {
    gap: Spacing.two
  },
  listRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.one,
    borderBottomWidth: 1,
    borderBottomColor: theme.border
  },
  stepRow: {
    flexDirection: 'row',
    gap: Spacing.two
  },
  stepNumber: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: theme.primary,
    alignItems: 'center',
    justifyContent: 'center'
  },
  stepText: {
    flex: 1
  }
});
