
import { Category } from "@/components/category/types";
import { useAdminAuth } from "./useAdminAuth";
import { useCategoryOperations } from "./useCategoryOperations";

export function useCategoryMutations(categories: Category[], setCategories: (categories: Category[]) => void) {
  const { isAdmin } = useAdminAuth();
  const { addCategory, updateCategory, deleteCategory, deleteAllCategories } = useCategoryOperations(categories, setCategories);

  return {
    addCategory,
    updateCategory,
    deleteCategory,
    deleteAllCategories,
    isAdmin,
  };
}
