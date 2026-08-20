import { useInfiniteQuery } from '@tanstack/react-query';
import { recipeRepository } from '@/services/repositories';
const PAGE_SIZE = 10;
export function useRecipes(filters) {
  return useInfiniteQuery({
    queryKey: ['recipes', filters],
    queryFn: ({
      pageParam
    }) => recipeRepository.listRecipes({
      page: pageParam,
      pageSize: PAGE_SIZE,
      filters
    }),
    initialPageParam: 0,
    getNextPageParam: lastPage => lastPage.nextPage
  });
}
