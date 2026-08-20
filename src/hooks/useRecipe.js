import { useQuery } from '@tanstack/react-query';
import { recipeRepository } from '@/services/repositories';
export function useRecipe(id) {
  return useQuery({
    queryKey: ['recipe', id],
    queryFn: () => recipeRepository.getRecipe(id),
    enabled: Boolean(id)
  });
}
