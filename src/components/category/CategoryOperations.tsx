
import { useState } from "react";
import { Category } from "./types";
import { useImageUpload } from "@/hooks/category/useImageUpload";
import { useCategoryMutations } from "@/hooks/category/useCategoryMutations";

interface CategoryOperationsProps {
  categories: Category[];
  setCategories: (categories: Category[]) => void;
  onSuccess?: () => void;
}

export function CategoryOperations({ categories, setCategories, onSuccess }: CategoryOperationsProps) {
  const [newCategory, setNewCategory] = useState({
    name: "",
    image_url: "",
    gradient: "from-purple-500 to-pink-500"
  });

  const { selectedImage, setSelectedImage, handleImageUpload, isAdmin } = useImageUpload();
  const { addCategory, updateCategory, deleteCategory } = useCategoryMutations(categories, setCategories);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const imageUrl = await handleImageUpload(e);
    if (imageUrl) {
      setNewCategory(prev => ({ ...prev, image_url: imageUrl }));
    }
  };

  const handleAddCategory = async () => {
    const success = await addCategory(newCategory);
    if (success) {
      setNewCategory({
        name: "",
        image_url: "",
        gradient: "from-purple-500 to-pink-500"
      });
      setSelectedImage(null);
      if (onSuccess) {
        onSuccess();
      }
    }
  };

  const handleUpdateCategory = async (category: Category) => {
    const success = await updateCategory(category);
    if (success && onSuccess) {
      onSuccess();
    }
  };

  const handleDeleteCategory = async (id: string) => {
    const success = await deleteCategory(id);
    if (success && onSuccess) {
      onSuccess();
    }
  };

  return {
    newCategory,
    setNewCategory,
    selectedImage,
    handleImageUpload: handleImageChange,
    handleAddCategory,
    handleUpdateCategory,
    handleDeleteCategory,
    isAdmin,
  };
}
