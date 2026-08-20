import { useQuery } from '@tanstack/react-query';
import { recipeRepository } from '@/services/repositories';
export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => recipeRepository.listCategories(),
    staleTime: Infinity
  });
}
