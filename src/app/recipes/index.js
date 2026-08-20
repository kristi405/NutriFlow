import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Dimensions, StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { RecipeCard } from '@/components/ui/recipe-card';
import { ScreenScrollView } from '@/components/ui/screen-scroll-view';
import { SectionHeader } from '@/components/ui/section-header';
import { Colors, Spacing } from '@/constants/theme';
import { getIngredientById } from '@/data/seed/ingredients';
import { CATEGORIES } from '@/data/seed/categories';
import { RECIPES } from '@/data/seed/recipes';
import { calculateRecipeNutrition } from '@/lib/nutrition';

const theme = Colors.light;

const CONTAINER_PADDING = Spacing.four;
const CARD_GAP = Spacing.three;
const CARD_WIDTH = (Dimensions.get('window').width - CONTAINER_PADDING * 2 - CARD_GAP) / 2;

function chunkPairs(items) {
  const pairs = [];
  for (let index = 0; index < items.length; index += 2) {
    pairs.push(items.slice(index, index + 2));
  }
  return pairs;
}

export default function RecipesScreen() {
  const { t } = useTranslation();

  const collections = useMemo(() => CATEGORIES.map(category => ({
    category,
    rows: chunkPairs(RECIPES.filter(recipe => recipe.categoryId === category.id))
  })).filter(collection => collection.rows.length > 0), []);

  return <ScreenScrollView gap={Spacing.five}>
      <View style={styles.header}>
        <ThemedText type="title" style={styles.title} color={theme.text}>
          {t('recipes.title')}
        </ThemedText>
        <ThemedText type="default" color={theme.textSecondary}>
          {t('recipes.subtitle')}
        </ThemedText>
      </View>

      {collections.map(({ category, rows }) => <View key={category.id} style={styles.section}>
          <SectionHeader title={category.name} />
          <View style={styles.rows}>
            {rows.map((pair, index) => <View key={index} style={styles.row}>
                {pair.map(recipe => <RecipeCard key={recipe.id} recipe={recipe} calories={calculateRecipeNutrition(recipe, getIngredientById).nutrition.calories} style={{
              width: CARD_WIDTH
            }} />)}
              </View>)}
          </View>
        </View>)}
    </ScreenScrollView>;
}

const styles = StyleSheet.create({
  header: {
    gap: Spacing.half
  },
  title: {
    fontSize: 32,
    lineHeight: 38
  },
  section: {
    gap: Spacing.three
  },
  rows: {
    gap: Spacing.three
  },
  row: {
    flexDirection: 'row',
    gap: CARD_GAP
  }
});
