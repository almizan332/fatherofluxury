
import { useState } from "react";
import CategoryCard from "./category/CategoryCard";
import CategoryFormDialog from "./category/CategoryFormDialog";
import CategoryActions from "./category/CategoryActions";
import { useCategories } from "@/hooks/useCategories";
import { CategoryOperations } from "./category/CategoryOperations";
import { Category } from "./category/types";

const CategoryManagement = () => {
  const { categories, setCategories, isLoading, fetchCategories } = useCategories();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const {
    newCategory,
    setNewCategory,
    handleImageUpload,
    handleAddCategory,
    handleUpdateCategory,
    handleDeleteCategory,
    isAdmin,
  } = CategoryOperations({ 
    categories, 
    setCategories,
    onSuccess: () => setDialogOpen(false)
  });

  const handleCategoryChange = (value: string, field: 'name') => {
    if (editingCategory) {
      setEditingCategory({ ...editingCategory, [field]: value });
    } else {
      setNewCategory(prev => ({ ...prev, [field]: value }));
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-700"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <h1 className="text-xl md:text-2xl font-bold text-right">Category Management</h1>
        <CategoryActions 
          isAdmin={isAdmin} 
          onAddClick={() => setDialogOpen(true)} 
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {categories.map((category) => (
          <CategoryCard
            key={category.id}
            category={category}
            onEdit={(category) => {
              setEditingCategory(category);
              setDialogOpen(true);
            }}
            onDelete={handleDeleteCategory}
            isAdmin={isAdmin}
          />
        ))}
      </div>

      <CategoryFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editingCategory={editingCategory}
        newCategory={newCategory}
        onImageUpload={handleImageUpload}
        onCategoryChange={handleCategoryChange}
        onSubmit={editingCategory ? () => handleUpdateCategory(editingCategory) : handleAddCategory}
      />
    </div>
  );
};

export default CategoryManagement;
