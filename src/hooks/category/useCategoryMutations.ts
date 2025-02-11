
import { Category } from "@/components/category/types";
import { useAdminAuth } from "./useAdminAuth";
import { useCategoryOperations } from "./useCategoryOperations";

export function useCategoryMutations(categories: Category[], setCategories: (categories: Category[]) => void) {
  const { isAdmin } = useAdminAuth();
  const { addCategory, updateCategory, deleteCategory } = useCategoryOperations(categories, setCategories);

  return {
    addCategory,
    updateCategory,
    deleteCategory,
    isAdmin,
  };
}
